import { apiGet, apiPut, apiPost } from './api.js';
import {
  $, show, hide, showToast, setLoading, icon, refreshIcons, showHelp, showConfirm, clearFieldErrors,
  hideMainContentScreens
} from './utils.js';
import {
  setSelectedVariant, setAllStudents, setCurrentStudentIndex, setTotalQuestions,
  setCurrentQuestionnaire, setCurrentQuestions, getAuthState, setAuthState,
  getSystemStatus, setSystemStatus, getCurrentHelpScreen
} from './state.js';
import { renderSidebarCourses, navigateToCourse, closeMobileSidebar } from './sidebar.js';

// Configuration
const ALL_QUESTIONS = []; // Initialized as empty

export async function preloadSystemStatus() {
  const status = { running: false, folderOk: false, basePath: '' };
  try {
    const ollama = await apiGet('/ollama/status');
    status.running = ollama.running;
  } catch (_) { }
  try {
    const cfg = await apiGet('/config');
    status.basePath = cfg.base_path || '';
    status.folderOk = !!cfg.folder_exists;
  } catch (_) { }
  setSystemStatus(status);

  // Update UI components that depend on status
  import('./sidebar.js').then(m => m.updateSidebarStatus(status));

  return status;
}

export function parseStudentNames(raw) {
  return raw.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

export async function loadCoursesGrid() {
  const grid = $('courses-grid');
  if (!grid) return;
  try {
    const data = await apiGet('/courses');
    const courses = data.courses || [];
    if (courses.length === 0) {
      grid.innerHTML = `
        <div class="text-center p-8">
          <i data-lucide="folder-search" style="width:48px;height:48px;color:var(--text-tertiary);margin-bottom:var(--space-4);"></i>
          <p class="text-muted">No tienes cursos registrados.</p>
          <button class="btn-primary mt-4" onclick="$('btn-sidebar-new-course').click()">Crear primer curso</button>
        </div>
      `;
      refreshIcons(grid);
      return;
    }
    grid.innerHTML = courses.map(c => {
      const name = c.name || c;
      const count = c.student_count || 0;
      const completed = c.completed_count || 0;
      const pct = count > 0 ? Math.round((completed / count) * 100) : 0;
      return `
        <a href="#/course/${name.replace(/\s+/g, '-')}" class="selection-card">
          <div class="flex justify-between items-center">
            <h4>${name}</h4>
            <span class="badge ${pct === 100 ? 'badge-success' : 'badge-subtle'}">${count} alumnos</span>
          </div>
          <div class="progress-bar-track mt-3" style="height:4px;">
            <div class="progress-bar-fill ${pct === 100 ? 'complete' : ''}" style="width:${pct}%"></div>
          </div>
          <p class="mt-2" style="font-size:0.8125rem; color:var(--text-muted)">
            ${completed} de ${count} informes listos (${pct}%)
          </p>
        </a>
      `;
    }).join('');
    refreshIcons(grid);
  } catch (err) {
    grid.innerHTML = '<p class="text-center text-danger">Error al cargar los cursos.</p>';
  }
}

export async function loadQuestionnaireForCourse(course) {
  try {
    const data = await apiGet(`/courses/${encodeURIComponent(course)}/questionnaire`);
    const qid = data.questionnaire_id;
    if (qid && qid !== 'default') {
      const qData = await apiGet(`/questionnaires/${qid}`);
      if (qData && qData.questions && qData.questions.length > 0) {
        setCurrentQuestionnaire(qData);
        setCurrentQuestions(qData.questions);
        setTotalQuestions(qData.questions.length);
        return;
      }
    }
  } catch (err) {
    console.error('Error cargando cuestionario:', err);
  }
  setCurrentQuestionnaire(null);
  setCurrentQuestions(ALL_QUESTIONS);
  setTotalQuestions(ALL_QUESTIONS.length);
}

const ONBOARDING_TEMPLATE = `
  <div id="onboarding-overlay" class="onboarding-overlay">
    <div class="onboarding-card">
      <h1>Bienvenido a InformesCreator</h1>
      <p class="onboarding-subtitle">Configuración inicial del sistema</p>
      
      <div id="onboarding-ollama" class="onboarding-section">
        <h3><i data-lucide="refresh-cw" style="width:18px;height:18px;"></i> Servidor Ollama</h3>
        <p id="ollama-status-msg" class="hint">Verificando conexión...</p>
        <div id="ollama-ok-panel" class="hidden">
          <div class="badge badge-success">Conectado</div>
          <p class="hint mt-2">Ollama está funcionando correctamente.</p>
        </div>
        <div id="ollama-fail-panel" class="hidden">
          <div class="badge badge-danger">No detectado</div>
          <div class="setup-instructions mt-3">
            <p>1. Asegurate de tener <strong>Ollama</strong> instalado.</p>
            <p>2. Ejecutá <code>ollama run llama3.1</code> en tu terminal.</p>
            <button id="btn-retry-ollama" class="btn-secondary btn-sm mt-2">Reintentar</button>
          </div>
        </div>
      </div>

      <div id="onboarding-folder" class="onboarding-section">
        <h3><i data-lucide="folder" style="width:18px;height:18px;"></i> Carpeta de Trabajo</h3>
        <p class="hint">Ubicación donde se guardarán tus datos.</p>
        <div id="folder-status-panel" class="mt-3">
          <div id="folder-not-set" class="text-center">
            <button id="btn-select-base-folder" class="btn-primary">
              <i data-lucide="folder-plus" style="width:18px;height:18px;"></i> Elegir Carpeta
            </button>
          </div>
          <div id="folder-ok-panel" class="hidden">
            <div class="profile-folder-box">
              <span id="onboarding-folder-path" class="profile-folder-text"></span>
              <button id="btn-change-folder-onboarding" class="btn-ghost icon-btn" aria-label="Cambiar">
                <i data-lucide="refresh-cw" style="width:16px;height:16px;"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="onboarding-actions mt-6 flex justify-between">
        <button id="btn-skip-onboarding" class="btn-ghost btn-sm">Configurar más tarde</button>
        <button id="btn-finish-onboarding" class="btn-primary" disabled>¡Comenzar!</button>
      </div>
    </div>
  </div>
`;

export function showOnboarding() {
  const root = $('onboarding-root');
  if (!root) return;
  root.innerHTML = ONBOARDING_TEMPLATE;
  const overlay = $('onboarding-overlay');
  if (overlay) overlay.classList.remove('hidden');
  refreshIcons(root);
  bindOnboardingListeners();
  checkOnboardingStatus();
}

async function checkOnboardingStatus() {
  const status = await preloadSystemStatus();

  if (status.running) {
    hide($('ollama-status-msg')); hide($('ollama-fail-panel')); show($('ollama-ok-panel'));
  } else {
    hide($('ollama-status-msg')); hide($('ollama-ok-panel')); show($('ollama-fail-panel'));
  }

  if (status.folderOk) {
    hide($('folder-not-set')); show($('folder-ok-panel'));
    $('onboarding-folder-path').textContent = status.basePath;
  } else {
    show($('folder-not-set')); hide($('folder-ok-panel'));
  }

  const btnFinish = $('btn-finish-onboarding');
  if (btnFinish) btnFinish.disabled = !(status.running && status.folderOk);
}

function bindOnboardingListeners() {
  $('btn-retry-ollama')?.addEventListener('click', checkOnboardingStatus);
  $('btn-select-base-folder')?.addEventListener('click', handleSelectFolder);
  $('btn-change-folder-onboarding')?.addEventListener('click', handleSelectFolder);
  $('btn-skip-onboarding')?.addEventListener('click', () => { hide($('onboarding-overlay')); navigateTo('#/courses'); });
  $('btn-finish-onboarding')?.addEventListener('click', () => { hide($('onboarding-overlay')); navigateTo('#/courses'); });
}

export async function handleSelectFolder() {
  try {
    setLoading(true);
    const data = await apiGet('/pick-folder');
    setLoading(false);
    if (data.error) {
      showToast(data.error, 'error');
      return;
    }
    if (data.cancelled || !data.path) return;
    await apiPost('/config', { base_path: data.path });

    // Refresh status everywhere
    const status = await preloadSystemStatus();

    // If we are in onboarding, update it
    const ov = $('onboarding-overlay');
    if (ov && !ov.classList.contains('hidden')) {
      checkOnboardingStatus();
    }

    showToast('Carpeta configurada correctamente', 'success');
  } catch (err) {
    setLoading(false);
    showToast('Error al seleccionar carpeta', 'error');
  }
}

export function showHero() {
  const stage = $('landing-stage');
  if (stage) {
    stage.classList.remove('hidden');
    refreshIcons(stage);
  }
}

export function hideHero() {
  const stage = $('landing-stage');
  if (!stage) return;
  const hash = window.location.hash;
  if (hash.startsWith('#/login') || hash.startsWith('#/register') || !hash || hash === '#/') return;
  stage.classList.add('hidden');
}

export function handleHashChange() {
  const hash = window.location.hash;
  const authState = getAuthState();

  if (!authState.loggedIn && !hash.startsWith('#/login') && !hash.startsWith('#/register') && hash !== '' && hash !== '#/') {
    window.location.hash = '#/';
    return;
  }

  if (authState.loggedIn) {
    const layout = $('layout-body');
    if (layout) layout.classList.remove('hidden');
  }

  const ov = $('onboarding-overlay');
  if (ov) hide(ov);

  if (hash === '#/login') {
    import('./auth.js').then(m => m.showLoginScreen());
    showHero();
  } else if (hash === '#/register') {
    import('./auth.js').then(m => m.showRegisterScreen());
    showHero();
  } else if (hash === '#/courses') {
    hideHero();
    hideMainContentScreens();
    show($('main-content'));
    show($('courses-grid'));
    hide($('course-view'));
    loadCoursesGrid();
    renderSidebarCourses();
  } else if (hash.startsWith('#/course/')) {
    hideHero();
    hideMainContentScreens();
    show($('main-content'));
    const courseName = decodeURIComponent(hash.replace('#/course/', '')).replace(/-/g, ' ');
    import('./dashboard.js').then(m => m.enterCourse(courseName));
  } else if (hash === '#/onboarding') {
    hideHero();
    showOnboarding();
  } else if (hash === '#/questionnaires') {
    hideHero();
    hideMainContentScreens();
    import('./questionnaire-editor.js').then(m => m.showQuestionnairesScreen());
  } else if (hash === '' || hash === '#/') {
    if (authState.loggedIn) {
      navigateTo('#/courses');
    } else {
      showHero();
      import('./auth.js').then(m => m.showLoginScreen());
    }
  }

  updateSidebarNavActive();

  // Re-run icon generation after view change
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 50);
  } else {
    refreshIcons(document.body);
  }
}

function updateSidebarNavActive() {
  const hash = window.location.hash;
  const linkCourses = $('sidebar-link-courses');
  const linkQs = $('sidebar-link-questionnaires');

  linkCourses?.classList.remove('active');
  linkQs?.classList.remove('active');

  if (hash === '#/courses' || hash.startsWith('#/course/')) linkCourses?.classList.add('active');
  if (hash === '#/questionnaires') linkQs?.classList.add('active');
}

export function navigateTo(hash) {
  window.location.hash = hash;
}

function exportToWindow() {
  Object.assign(window, {
    navigateTo, showHero, hideHero, showHelp, showConfirm, showToast, setLoading,
    loadCoursesGrid, handleHashChange, preloadSystemStatus, parseStudentNames,
    navigateToCourse, closeMobileSidebar
  });

  // Also export dashboard actions if needed
  import('./dashboard.js').then(m => {
    Object.assign(window, {
      selectStudent: m.selectStudent,
      triggerStudentAction: m.triggerStudentAction,
      applyFormat: m.applyFormat,
      togglePreview: m.togglePreview,
      handleAutoSave: m.handleAutoSave
    });
  });
}

async function init() {
  exportToWindow();

  // Initial icon run
  if (window.lucide) {
    lucide.createIcons();
  } else {
    refreshIcons(document.body);
  }

  window.addEventListener('hashchange', handleHashChange);

  const { initAuth } = await import('./auth.js');
  await initAuth();

  const { initSidebar } = await import('./sidebar.js');
  initSidebar();

  const authState = getAuthState();
  if (authState.loggedIn) {
    const layout = $('layout-body');
    if (layout) layout.classList.remove('hidden');

    wireSidebarFooter();

    const status = await preloadSystemStatus();
    if (!status.running || !status.folderOk) {
      if (window.location.hash !== '#/onboarding') navigateTo('#/onboarding');
    }
  }

  handleHashChange();

  // Global event delegation for better reliability
  document.addEventListener('click', (e) => {
    const userMenu = $('sidebar-user-menu-expanded');
    if (userMenu && !userMenu.classList.contains('hidden') && !e.target.closest('.sidebar-footer')) {
      userMenu.classList.add('hidden');
      const btnMenu = $('btn-sidebar-user-menu');
      if (btnMenu) btnMenu.innerHTML = icon('chevron-up', 14);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
