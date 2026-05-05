import { apiGet, apiPost } from './api.js';
import { $, show, hide, showToast, setLoading, refreshIcons, icon } from './utils.js';
import { getSelectedCourse } from './state.js';
import { navigateTo } from './auth.js';
import { on } from './events.js';

export async function renderSidebarCourses() {
  const list = $('sidebar-courses-list');
  if (!list) return;
  const countEl = $('sidebar-course-count');
  const emptyEl = $('sidebar-empty');
  try {
    const data = await apiGet('/courses');
    const courses = data.courses || [];
    if (countEl) countEl.textContent = courses.length;
    if (courses.length === 0) {
      list.innerHTML = '';
      if (emptyEl) show(emptyEl);
    } else {
      if (emptyEl) hide(emptyEl);
      const selectedCourse = getSelectedCourse();
      list.innerHTML = courses.map(c => {
        const name = c.name || c;
        const total = c.student_count || 0;
        const completed = c.completed_count || 0;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const completeClass = pct >= 100 ? ' complete' : '';
        const active = selectedCourse === name ? ' active' : '';
        return `<a href="#/course/${name.replace(/\s+/g, '-')}" class="sidebar-course-item${active}" data-course="${name.replace(/"/g, '&quot;')}" aria-pressed="${selectedCourse === name}">
        <div class="sidebar-course-top">
        <span class="sidebar-course-name">${name}</span>
        <span class="sidebar-course-badge">${total}</span>
        </div>
        <div class="sidebar-course-progress">
        <div class="sidebar-course-progress-bar">
        <div class="sidebar-course-progress-fill${completeClass}" style="width:${total > 0 ? pct : 0}%"></div>
        </div>
        <span class="sidebar-course-progress-text">${completed}/${total}</span>
        </div>
        </a>`;
      }).join('');
    }
  } catch (err) {
    console.error('Error loading sidebar courses:', err);
  }
}

on('courses:changed', renderSidebarCourses);
on('course:selected', renderSidebarCourses);
on('report:generated', renderSidebarCourses);

export function navigateToCourse(name) {
  closeMobileSidebar();
  navigateTo(`#/course/${name.replace(/\s+/g, '-')}`);
}

export function toggleMobileSidebar() {
  const sidebar = $('sidebar');
  if (!sidebar) return;
  if (sidebar.classList.contains('open')) {
    closeMobileSidebar();
  } else {
    sidebar.classList.add('open');
    let backdrop = document.getElementById('sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'sidebar-backdrop';
      backdrop.className = 'sidebar-backdrop visible';
      backdrop.addEventListener('click', closeMobileSidebar);
      document.getElementById('app').appendChild(backdrop);
    } else {
      backdrop.classList.add('visible');
    }
  }
}

export function closeMobileSidebar() {
  const sidebar = $('sidebar');
  if (sidebar) sidebar.classList.remove('open');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.classList.remove('visible');
  const userMenu = $('sidebar-user-menu-expanded');
  if (userMenu && !userMenu.classList.contains('hidden')) {
    userMenu.classList.add('hidden');
    const chevronBtn = $('btn-sidebar-user-menu');
    if (chevronBtn) {
      chevronBtn.innerHTML = icon('chevron-up', 14);
    }
  }
}

export async function createCourseFromSidebar() {
  const courseName = $('sidebar-new-course-name').value.trim();
  const rawNames = $('sidebar-new-students-list').value.trim();
  if (!courseName) { showToast('Ingresa un nombre para el curso.', 'warning'); return; }
  if (!rawNames) { showToast('Ingresa al menos un alumno.', 'warning'); return; }
  const { parseStudentNames } = await import('./app.js');
  const students = parseStudentNames(rawNames);
  if (students.length === 0) { showToast('No se pudieron detectar nombres de alumnos.', 'warning'); return; }
  setLoading(true);
  try {
    const defaultPath = './data/CURSOS';
    await apiPost('/config', { base_path: defaultPath });
    await apiPost('/courses/create', { course_name: courseName, students });
    showToast(`Curso "${courseName}" creado con ${students.length} alumnos.`, 'success');
    $('sidebar-new-course-name').value = '';
    $('sidebar-new-students-list').value = '';
    const createForm = $('sidebar-create-course');
    const btnNew = $('btn-sidebar-new-course');
    if (createForm) hide(createForm);
    if (btnNew) {
      btnNew.classList.remove('adding');
      btnNew.setAttribute('aria-label', 'Nuevo curso');
      btnNew.innerHTML = icon('plus', 18);
    }
    renderSidebarCourses();
  } catch (err) {
    showToast('No se pudo crear el curso. Verifica la carpeta y los permisos.', 'error');
  } finally { setLoading(false); }
}
export function updateSidebarStatus(status) {
  const dot = $('sidebar-status-dot');
  const text = $('sidebar-status-text');
  const pathAlias = $('sidebar-path-alias');

  if (dot && text) {
    if (status.running) {
      dot.className = 'dropdown-status-dot status-online';
      text.textContent = 'Ollama: Conectado';
    } else {
      dot.className = 'dropdown-status-dot status-offline';
      text.textContent = 'Ollama: Desconectado';
    }
  }

  if (pathAlias) {
    if (status.folderOk) {
      const folderName = status.basePath.split(/[\\/]/).pop() || 'Carpeta OK';
      pathAlias.textContent = folderName;
      pathAlias.title = status.basePath;
      pathAlias.classList.remove('error-text');
    } else {
      pathAlias.textContent = 'Configurar carpeta';
      pathAlias.classList.add('error-text');
    }
  }
}

export function initSidebar() {
  const btnMenu = $('btn-sidebar-user-menu');
  const menuExpanded = $('sidebar-user-menu-expanded');
  const btnLogout = $('sidebar-menu-logout');
  const btnChangeFolder = $('sidebar-menu-change-folder');

  if (btnMenu && menuExpanded) {
    btnMenu.onclick = (e) => {
      e.stopPropagation();
      const isHidden = menuExpanded.classList.contains('hidden');
      if (isHidden) {
        show(menuExpanded);
        btnMenu.innerHTML = icon('chevron-down', 14);
      } else {
        hide(menuExpanded);
        btnMenu.innerHTML = icon('chevron-up', 14);
      }
    };
  }

  if (btnLogout) {
    btnLogout.onclick = async () => {
      const { doLogout } = await import('./auth.js');
      doLogout();
    };
  }

  if (btnChangeFolder) {
    btnChangeFolder.onclick = async () => {
      hide(menuExpanded);
      const { handleSelectFolder } = await import('./app.js');
      await handleSelectFolder();
    };
  }

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (menuExpanded && !menuExpanded.classList.contains('hidden')) {
      if (!menuExpanded.contains(e.target) && !btnMenu.contains(e.target)) {
        hide(menuExpanded);
        btnMenu.innerHTML = icon('chevron-up', 14);
      }
    }
  });
}

on('status:changed', (status) => updateSidebarStatus(status));
