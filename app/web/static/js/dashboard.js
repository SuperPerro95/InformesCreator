import { apiGet, apiPost } from './api.js';
import { $, show, hide, showToast, setLoading, refreshIcons, icon, simpleMarkdownToHtml, showConfirm } from './utils.js';
import { getSelectedCourse, setAllStudents, setCurrentStudentIndex, getAllStudents, getCurrentStudentIndex, getCourseSessions, setCourseSessions, getSessionReports, setSessionReports, setSelectedVariant, getSelectedStudentIndex, setSelectedStudentIndex, getCachedQuestionnaires, setCachedQuestionnaires } from './state.js';
import { navigateTo } from './auth.js';
import { renderSidebarCourses } from './sidebar.js';

const STUDENT_DRAWER_TEMPLATE = `
  <div id="student-drawer" class="student-drawer" role="dialog" aria-label="Detalle del alumno" aria-modal="true">
    <div class="student-drawer-overlay" id="student-drawer-overlay"></div>
    <div class="student-drawer-panel" id="student-drawer-panel">
      <div class="student-drawer-header">
        <div class="student-drawer-nav">
          <button id="btn-drawer-prev-student" class="btn-ghost btn-sm icon-btn" aria-label="Alumno anterior" title="Alumno anterior">
            <i data-lucide="chevron-left" style="width:18px;height:18px;"></i>
          </button>
        </div>
        <h3 id="student-drawer-name" class="student-drawer-name"></h3>
        <div class="student-drawer-nav">
          <button id="btn-drawer-next-student" class="btn-ghost btn-sm icon-btn" aria-label="Siguiente alumno" title="Siguiente alumno">
            <i data-lucide="chevron-right" style="width:18px;height:18px;"></i>
          </button>
          <button id="btn-close-drawer" class="btn-ghost btn-sm" aria-label="Cerrar detalle">
            <i data-lucide="x" style="width:18px;height:18px;"></i>
          </button>
        </div>
      </div>
      <div id="student-drawer-content" class="student-drawer-content"></div>
    </div>
  </div>
`;

function bindDrawerListeners() {
  $('btn-close-drawer').addEventListener('click', closeStudentDrawer);
  $('student-drawer-overlay').addEventListener('click', closeStudentDrawer);
  $('btn-drawer-prev-student').addEventListener('click', async () => {
    const { getSelectedStudentIndex } = await import('./state.js');
    const idx = getSelectedStudentIndex();
    if (idx > 0) selectStudent(idx - 1);
  });
  $('btn-drawer-next-student').addEventListener('click', async () => {
    const { getSelectedStudentIndex, getAllStudents } = await import('./state.js');
    const idx = getSelectedStudentIndex();
    if (idx < getAllStudents().length - 1) selectStudent(idx + 1);
  });
}

let _dashboardPrevCompleted = -1;
const _saveTimeouts = {};

export function getSaveTimeouts() { return _saveTimeouts; }

export function getReportFilename(nombreCompleto) {
  return 'Informe_' + nombreCompleto.replace(/, /g, '_').replace(/ /g, '_') + '.md';
}

export async function renderDashboard() {
  let cachedQuestionnaires = getCachedQuestionnaires();
  if (!cachedQuestionnaires) {
    try {
      cachedQuestionnaires = await apiGet('/questionnaires');
      setCachedQuestionnaires(cachedQuestionnaires);
    } catch (err) {
      cachedQuestionnaires = [];
      setCachedQuestionnaires([]);
    }
  }
  const selectedCourse = getSelectedCourse();
  const session = getCourseSessions()[selectedCourse] || {};
  const allStudents = getAllStudents();
  const sessionReports = getSessionReports();
  const studentQs = session.student_questionnaires || {};
  const backendCompletados = new Set(session.progreso?.completados || []);
  sessionReports.forEach(r => {
    if (r.completed) backendCompletados.add(r.filename);
  });
  const completedCount = backendCompletados.size;
  const totalCount = allStudents.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = completedCount === totalCount && totalCount > 0;
  const circumference = 2 * Math.PI * 19;
  const offset = circumference - (progressPct / 100) * circumference;
  const progressColor = isComplete ? 'var(--success-text)' : 'var(--accent)';
  const progressLabel = isComplete ? 'Curso completo' : 'Alumnos completados';
  const milestoneHtml = isComplete ? '<div class="milestone-banner"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Todos los informes están listos. ¡Buen trabajo!</div>' : '';
  $('dashboard-stats').innerHTML = `
  ${milestoneHtml}
  <div class="dashboard-stats">
  <div style="display:flex;align-items:center;gap:var(--space-4);">
  <svg class="progress-ring" viewBox="0 0 48 48" style="width:48px;height:48px;opacity:0.8;">
  <circle class="ring-bg" cx="24" cy="24" r="19" />
  <circle class="ring-fill" cx="24" cy="24" r="19" stroke="${progressColor}" stroke-dasharray="${offset} ${circumference}" transform="rotate(-90 24 24)" />
  <text x="24" y="24" text-anchor="middle" dominant-baseline="central" style="font-family:var(--font-mono);font-size:10px;font-weight:700;fill:var(--text-primary);">${progressPct}%</text>
  </svg>
  <div>
  <div class="stat-number">${completedCount}<span class="font-mono" style="font-size: 1rem; color: var(--text-muted);"> / ${totalCount}</span></div>
  <div class="stat-label">${progressLabel}</div>
  </div>
  </div>
  <div class="progress-bar-track"><div class="progress-bar-fill ${isComplete ? 'complete' : ''}" style="width:${progressPct}%"></div></div>
  </div>
  `;
  setTimeout(() => {
    const ringFill = document.querySelector('.progress-ring .ring-fill');
    if (ringFill) {
      const targetOffset = circumference - (progressPct / 100) * circumference;
      ringFill.setAttribute('stroke-dasharray', `${targetOffset} ${circumference}`);
      ringFill.setAttribute('stroke', progressColor);
    }
  }, 50);
  const container = $('dashboard-students-list');
  if (allStudents.length === 0) {
    container.innerHTML = '<div class="course-view-enter-delay" style="text-align:center;padding:var(--space-8) var(--space-4);animation-delay:100ms"><p style="font-size:1rem;font-weight:600;color:var(--text-primary);margin-bottom:var(--space-2)">Aún no hay alumnos en este curso</p><p class="hint">Agregá alumnos desde la carpeta del curso para empezar a trabajar.</p></div>';
    return;
  }
  container.innerHTML = allStudents.map((s, i) => {
    const isCompleted = backendCompletados.has(s.filename);
    const hasSavedAnswers = !!(session.respuestas && session.respuestas[s.filename]);
    const isIncompleto = !isCompleted && hasSavedAnswers;
    const badgeClass = isCompleted ? 'badge-success' : (isIncompleto ? 'badge-warning' : 'badge-subtle');
    const statusText = isCompleted ? 'Informe listo' : (isIncompleto ? 'Cuestionario guardado' : 'Sin empezar');
    const pulseClass = (_dashboardPrevCompleted >= 0 && isCompleted && !s._prevCompleted) ? ' badge-pulse' : '';
    s._prevCompleted = isCompleted;
    const delay = Math.min(i * 30, 300);
    return `
    <div class="list-row delight-enter" data-index="${i}" onclick="selectStudent(${i})" style="animation-delay:${delay}ms">
    <span class="row-num font-mono">${i + 1}</span>
    <span class="row-name">${s.nombre_completo}</span>
    <span class="badge ${badgeClass}${pulseClass}">${statusText}</span>
    <span class="row-action-hint"><i data-lucide="chevron-right" style="width:16px;height:16px;"></i></span>
    </div>
    `;
  }).join('');
  _dashboardPrevCompleted = completedCount;
  refreshIcons(container);
  await renderQuestionnaireSelector();
  const searchInput = $('student-search');
  if (searchInput && !searchInput._wired) {
    searchInput._wired = true;
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      document.querySelectorAll('#dashboard-students-list .list-row').forEach(row => {
        const name = row.querySelector('.row-name');
        if (name) row.style.display = name.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }
}

export function renderStudentEditor(containerId, index) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const allStudents = getAllStudents();
  const s = allStudents[index];
  if (!s) return;
  const selectedCourse = getSelectedCourse();
  const session = getCourseSessions()[selectedCourse] || {};
  const sessionReports = getSessionReports();
  const backendCompletados = new Set(session.progreso?.completados || []);
  sessionReports.forEach(r => {
    if (r.completed) backendCompletados.add(r.filename);
  });
  const isCompleted = backendCompletados.has(s.filename);
  const reportContent = (sessionReports.find(r => r.studentIndex === index)?.report_content) || s.report || '';
  container.innerHTML = `
  <div class="student-info-container">
  <div class="student-info-meta">${isCompleted ? 'Informe generado' : 'Pendiente'}</div>
  </div>
  <div class="report-editor-container">
  <div class="editor-header">
  <span class="label">Informe:</span>
  <span id="save-status-${containerId}" class="save-status"></span>
  </div>
  <div class="markdown-toolbar">
  <button onclick="applyFormat('${containerId}', ${index}, 'bold')" title="Negrita (Ctrl+B)" aria-label="Negrita (Ctrl+B)"><b>B</b></button>
  <button onclick="applyFormat('${containerId}', ${index}, 'italic')" title="Cursiva (Ctrl+I)" aria-label="Cursiva (Ctrl+I)"><i>I</i></button>
  <button onclick="applyFormat('${containerId}', ${index}, 'list')" title="Lista" aria-label="Lista">&bull; List</button>
  <span class="toolbar-divider"></span>
  <button class="preview-btn" onclick="togglePreview('${containerId}')" id="preview-btn-${containerId}">Vista Previa</button>
  </div>
  <div class="editor-wrapper">
  <textarea id="textarea-${containerId}" class="report-textarea" placeholder="Escribe el informe aqui..."
  oninput="handleAutoSave('${containerId}', ${index})">${reportContent}</textarea>
  <div id="preview-${containerId}" class="markdown-preview hidden"></div>
  </div>
  </div>
  <div class="action-sidebar">
  <button class="action-btn btn-primary-action" onclick="triggerStudentAction(${index}, 'wizard')" title="Completar el cuestionario para este alumno">
  <i data-lucide="clipboard-list" style="width:14px;height:14px;"></i> Cuestionario
  </button>
  <button class="action-btn btn-secondary-action" onclick="triggerStudentAction(${index}, 'download')" title="Descargar el informe como archivo">
  <i data-lucide="download" style="width:14px;height:14px;"></i> Descargar
  </button>
  <div class="action-divider"></div>
  <button class="action-btn btn-modify" onclick="triggerStudentAction(${index}, 'modify')" title="Ajustar opciones de generacion">
  <i data-lucide="sliders-horizontal" style="width:14px;height:14px;"></i> Modificar
  </button>
  <button class="action-btn btn-redo" onclick="triggerStudentAction(${index}, 'redo')" title="Regenerar el informe con IA">
  <i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> Rehacer
  </button>
  <div class="action-divider action-danger-divider"></div>
  <button class="action-btn btn-danger" onclick="triggerStudentAction(${index}, 'clear')" title="Eliminar el informe generado">
  <i data-lucide="trash-2" style="width:14px;height:14px;"></i> Borrar
  </button>
  </div>
  `;
  refreshIcons(container);
}

async function renderQuestionnaireSelector() {
  const select = $('active-questionnaire');
  if (!select) return;
  try {
    const selectedCourse = getSelectedCourse();
    const [allData, activeData] = await Promise.all([
      apiGet('/questionnaires'),
      apiGet(`/courses/${encodeURIComponent(selectedCourse)}/questionnaire`)
    ]);
    const activeId = activeData.questionnaire_id || '';
    const options = [`<option value="">Predeterminado (19 preguntas)</option>`];
    for (const q of allData || []) {
      const selected = q.id === activeId ? ' selected' : '';
      options.push(`<option value="${q.id}"${selected}>${q.name} (${q.question_count || 0} preguntas)</option>`);
    }
    select.innerHTML = options.join('');
    select.onchange = async (e) => {
      const qid = e.target.value || 'default';
      try {
        await apiPost(`/courses/${encodeURIComponent(selectedCourse)}/questionnaire`, { questionnaire_id: qid });
        const { loadQuestionnaireForCourse } = await import('./app.js');
        await loadQuestionnaireForCourse(selectedCourse);
      } catch (err) {
        showToast('No se pudo cambiar el cuestionario. Intenta de nuevo.', 'error');
      }
    };
  } catch (err) {
    console.error('Error cargando cuestionarios:', err);
  }
}

export function handleAutoSave(containerId, index) {
  if (typeof index !== 'number') return;
  const statusEl = document.getElementById(`save-status-${containerId}`);
  const textarea = document.getElementById(`textarea-${containerId}`);
  if (statusEl) {
    statusEl.textContent = 'Escribiendo...';
    statusEl.className = 'save-status';
  }
  const key = containerId + '-' + index;
  clearTimeout(_saveTimeouts[key]);
  _saveTimeouts[key] = setTimeout(() => {
    if (statusEl) {
      statusEl.textContent = 'Guardando...';
      statusEl.className = 'save-status saving';
    }
    const allStudents = getAllStudents();
    const sessionReports = getSessionReports();
    const student = allStudents[index];
    if (student && textarea) {
      const existingIndex = sessionReports.findIndex(r => r.studentIndex === index);
      const reportData = {
        studentIndex: index,
        nombre_completo: student.nombre_completo,
        filename: student.filename,
        report_content: textarea.value,
        completed: true
      };
      if (existingIndex >= 0) {
        sessionReports[existingIndex] = { ...sessionReports[existingIndex], ...reportData };
      } else {
        sessionReports.push(reportData);
      }
      setSessionReports(sessionReports);
    }
    if (statusEl) {
      statusEl.textContent = '\u2713 Guardado';
      statusEl.className = 'save-status saved';
    }
  }, 1500);
}

export function applyFormat(containerId, indexOrType, type) {
  let index, _type;
  if (typeof type === 'string') {
    index = indexOrType;
    _type = type;
  } else {
    index = containerId;
    _type = indexOrType;
    containerId = 'student-drawer-content';
  }
  const textarea = document.getElementById(`textarea-${containerId}`);
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selected = text.substring(start, end);
  let formatted = '';
  if (_type === 'bold') formatted = `**${selected}**`;
  else if (_type === 'italic') formatted = `*${selected}*`;
  else if (_type === 'list') formatted = `\n- ${selected}`;
  textarea.value = text.substring(0, start) + formatted + text.substring(end);
  textarea.focus();
  textarea.setSelectionRange(start + formatted.length, start + formatted.length);
  handleAutoSave(containerId, index);
}

export function togglePreview(containerId) {
  const textarea = document.getElementById(`textarea-${containerId}`);
  const preview = document.getElementById(`preview-${containerId}`);
  const btn = document.getElementById(`preview-btn-${containerId}`);
  if (!textarea || !preview || !btn) return;
  if (preview.classList.contains('hidden')) {
    preview.innerHTML = simpleMarkdownToHtml(textarea.value);
    textarea.classList.add('hidden');
    preview.classList.remove('hidden');
    btn.textContent = 'Editar';
  } else {
    textarea.classList.remove('hidden');
    preview.classList.add('hidden');
    btn.textContent = 'Vista Previa';
  }
}

export function selectStudent(index) {
  let selectedStudentIndex = getSelectedStudentIndex();
  if (index === selectedStudentIndex) {
    deselectStudent();
    return;
  }
  setSelectedStudentIndex(index);
  document.querySelectorAll('.list-row.selected').forEach(r => r.classList.remove('selected'));
  const row = document.querySelector(`.list-row[data-index="${index}"]`);
  if (row) row.classList.add('selected');
  openStudentDrawer(index);
}

export function deselectStudent() {
  setSelectedStudentIndex(-1);
  document.querySelectorAll('.list-row.selected').forEach(r => r.classList.remove('selected'));
  closeStudentDrawer();
}

async function openStudentDrawer(index) {
  const allStudents = getAllStudents();
  const student = allStudents[index];
  if (!student) return;

  const root = $('drawer-root');
  if (!root) return;
  root.innerHTML = STUDENT_DRAWER_TEMPLATE;
  if (window.lucide) lucide.createIcons({ nodes: [root] });
  bindDrawerListeners();

  $('student-drawer-name').textContent = student.nombre_completo;
  renderStudentEditor('student-drawer-content', index);
  show($('student-drawer'));
  document.body.style.overflow = 'hidden';
  $('btn-close-drawer').focus();
  const textarea = document.getElementById('textarea-student-drawer-content');
  if (textarea && !textarea.value.trim()) {
    const reportFilename = getReportFilename(student.nombre_completo);
    try {
      const selectedCourse = getSelectedCourse();
      const data = await apiGet(`/reports/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(reportFilename)}`);
      if (data.content) {
        textarea.value = data.content;
        const sessionReports = getSessionReports();
        const existingIndex = sessionReports.findIndex(r => r.studentIndex === index);
        const reportData = {
          studentIndex: index,
          nombre_completo: student.nombre_completo,
          filename: student.filename,
          report_content: data.content,
          completed: true,
          variant: null
        };
        if (existingIndex >= 0) {
          sessionReports[existingIndex] = { ...sessionReports[existingIndex], ...reportData };
        } else {
          sessionReports.push(reportData);
        }
        setSessionReports(sessionReports);
      }
    } catch (err) {
    }
  }
}

export function closeStudentDrawer() {
  hide($('student-drawer'));
  document.body.style.overflow = '';
  const root = $('drawer-root');
  if (root) root.innerHTML = '';
}

export async function triggerStudentAction(index, action) {
  const allStudents = getAllStudents();
  const selectedCourse = getSelectedCourse();
  const sessionReports = getSessionReports();
  const student = allStudents[index];
  setCurrentStudentIndex(index);
  if (action === 'complete') {
    const { startWizardForStudent } = await import('./wizard.js');
    await startWizardForStudent(false);
    return;
  } else if (action === 'continue') {
    const { startWizardForStudent } = await import('./wizard.js');
    await startWizardForStudent(true);
    return;
  } else if (action === 'quick') {
    const ok = await showConfirm(`Generar informe para ${student.nombre_completo} con cuestionario predeterminado?`);
    if (!ok) return;
    setSessionReports(sessionReports.filter(r => r.studentIndex !== index));
    const { startWizardForStudent } = await import('./wizard.js');
    await startWizardForStudent(false);
    return;
  } else if (action === 'download') {
    try {
      const reportFilename = getReportFilename(student.nombre_completo);
      await downloadExistingReport(selectedCourse, reportFilename);
    } catch (err) {
      downloadReportForIndex(index);
    }
  } else if (action === 'redo') {
    setSessionReports(sessionReports.filter(r => r.studentIndex !== index));
    const { startWizardForStudent } = await import('./wizard.js');
    startWizardForStudent();
  } else if (action === 'modify') {
    const reportFilename = getReportFilename(student.nombre_completo);
    let reportContent = null;
    const cachedReport = sessionReports.find(r => r.studentIndex === index);
    if (cachedReport && cachedReport.report_content) {
      reportContent = cachedReport.report_content;
      if (cachedReport.variant) setSelectedVariant(cachedReport.variant);
    } else {
      try {
        const data = await apiGet(`/reports/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(reportFilename)}`);
        reportContent = data.content;
        const existingIndex = sessionReports.findIndex(r => r.studentIndex === index);
        const reportData = {
          studentIndex: index,
          nombre_completo: student.nombre_completo,
          filename: student.filename,
          report_content: reportContent,
          completed: true,
          variant: null
        };
        if (existingIndex >= 0) {
          sessionReports[existingIndex] = reportData;
        } else {
          sessionReports.push(reportData);
        }
        setSessionReports(sessionReports);
      } catch (err) {
        showToast('No se pudo cargar el informe. Intenta de nuevo.', 'error');
        return;
      }
    }
    setCurrentStudentIndex(index);
    const { loadStudentContext } = await import('./wizard.js');
    await loadStudentContext();
    const { renderMarkdownToHtml } = await import('./utils.js');
    $('report-preview').innerHTML = renderMarkdownToHtml(reportContent);
    show($('report-actions'));
    show($('customization-panel'));
    hide($('btn-next-student'));
    const { goToWizardStep, showWizard } = await import('./wizard.js');
    goToWizardStep(3);
    showWizard();
  } else if (action === 'clear') {
    const ok = await showConfirm(`Borrar todas las respuestas de ${student.nombre_completo}?`);
    if (!ok) return;
    try {
      await apiPost(`/students/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(student.filename)}/clear`, {});
      const refreshed = await apiGet(`/courses/${encodeURIComponent(selectedCourse)}/session`);
      const sessions = getCourseSessions();
      sessions[selectedCourse] = refreshed;
      setCourseSessions(sessions);
      await renderDashboard();
    } catch (err) {
      showToast('No se pudieron borrar las respuestas. Intenta de nuevo.', 'error');
    }
  } else if (action === 'wizard') {
    closeStudentDrawer();
    const { startWizardForStudent } = await import('./wizard.js');
    await startWizardForStudent(false);
    return;
  }
  closeStudentDrawer();
}

function downloadReportForIndex(studentIndex) {
  import('./state.js').then(mod => mod.setLastReportDownloaded(true));
  const sessionReports = getSessionReports();
  const report = sessionReports.find(r => r.studentIndex === studentIndex);
  if (!report || !report.report_content) return;
  const blob = new Blob([report.report_content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const studentName = report.nombre_completo?.replace(/\s+/g, '_') || 'Informe';
  a.href = url;
  a.download = `Informe_${studentName}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function downloadExistingReport(course, filename) {
  try {
    const data = await apiGet(`/reports/${encodeURIComponent(course)}/${encodeURIComponent(filename)}`);
    const blob = new Blob([data.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    showToast('No se pudo descargar el informe. Intenta de nuevo.', 'error');
  }
}
