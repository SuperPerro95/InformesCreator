import {
  $, show, hide, showToast, setLoading, refreshIcons,
  icon, showHelp, hideHelp, updateHelpButton,
  renderMarkdownToHtml, showConfirm, escapeHtml,
  hideMainContentScreens, HELP_CONTENT
} from './utils.js';
import { apiGet, apiPost } from './api.js';
import {
  getSelectedCourse, setSelectedCourse,
  getAllStudents, setAllStudents,
  getCurrentStudentIndex, setCurrentStudentIndex,
  getCourseSessions, setCourseSessions,
  getSessionReports, setSessionReports,
  getOnboardingComplete, setOnboardingComplete,
  getSelectedVariant, setSelectedVariant,
  getSelectedModel, setSelectedModel,
  getSystemStatus, setSystemStatus,
  getCurrentQuestionnaire, setCurrentQuestionnaire,
  getCurrentQuestions, setCurrentQuestions,
  getTotalQuestions, setTotalQuestions,
  getCurrentHelpScreen, setCurrentHelpScreen,
  getAuthState
} from './state.js';
import { navigateTo } from './auth.js';
import { renderSidebarCourses, closeMobileSidebar, navigateToCourse, createCourseFromSidebar, toggleMobileSidebar } from './sidebar.js';
import { renderDashboard, renderStudentEditor, getReportFilename, handleAutoSave, applyFormat, togglePreview, selectStudent, deselectStudent, closeStudentDrawer, triggerStudentAction } from './dashboard.js';
import { showWizard, hideWizard, goToWizardStep, setupQuestionnaireForCurrentStudent, startWizardForStudent, loadStudentContext, showObservationsPanel, skipObservationsAndContinue, parseQuickObservations, addEmptyObsRow, saveObservationsAndContinue, saveQuestionnaire, finishQuestionnaire, skipAllAndGenerate, skipQuestion, goToPreviousQuestion, renderQuestion, handleAnswer } from './wizard.js';
import { doGenerateReport, doRegenerateWithCustomization, downloadReport, downloadReportForIndex, downloadAllReports, goToNextStudent } from './report.js';
import { showQuestionnairesScreen, loadQuestionnairesList, openQuestionnaireEditor, saveQuestionnaireEditor, closeQuestionnaireEditor, duplicateQuestionnaire, deleteQuestionnaire } from './questionnaire-editor.js';

const ALL_QUESTIONS = [
  { section: 'valoracion', title: 'Valoracion preliminar del alumno', text: 'Valoracion preliminar del alumno', answer_type: 'tea_tep_ted', options: ['TEA', 'TEP', 'TED'], labels: ['TEA - Trayectoria Educativa Alcanzada', 'TEP - Trayectoria Educativa en Proceso', 'TED - Trayectoria Educativa Discontinua'] },
  { section: 'pedagogical', title: 'Participacion', text: 'Interviene de manera pertinente durante las explicaciones o debates?', answer_type: 'frequency_4', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'pedagogical', title: 'Seguimiento de consignas', text: 'Comprende y ejecuta las instrucciones de trabajo a la primera mencion?', answer_type: 'frequency_4', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'pedagogical', title: 'Autonomia', text: 'Inicia y avanza en sus tareas sin necesidad de supervision constante?', answer_type: 'frequency_4', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'pedagogical', title: 'Organizacion', text: 'Trae y mantiene ordenados los materiales necesarios para la clase?', answer_type: 'frequency_4', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'pedagogical', title: 'Persistencia', text: 'Mantiene el esfuerzo ante una tarea que le resulta dificil o compleja?', answer_type: 'frequency_4', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'pedagogical', title: 'Cumplimiento', text: 'Entrega las actividades o producciones en los plazos establecidos?', answer_type: 'frequency_4', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'socioemotional', title: 'Integracion social', text: 'Trabaja de forma colaborativa y armonica con sus companeros?', answer_type: 'frequency_4', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'socioemotional', title: 'Gestion del error', text: 'Acepta las correcciones o los errores sin mostrar frustracion excesiva o bloqueo?', answer_type: 'frequency_4', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'socioemotional', title: 'Comunicacion', text: 'Expresa sus necesidades, dudas o desacuerdos de manera respetuosa?', answer_type: 'frequency_4', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'socioemotional', title: 'Respeto a las normas', text: 'Se ajusta a los acuerdos de convivencia establecidos en el aula?', answer_type: 'frequency_4', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'socioemotional', title: 'Empatia', text: 'Muestra actitudes de ayuda o respeto hacia las dificultades de los demas?', answer_type: 'frequency_4', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'socioemotional', title: 'Nivel de motivacion', text: 'Muestra curiosidad o disposicion positiva hacia las actividades propuestas?', answer_type: 'frequency_4', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'content', title: 'Explica con sus propias palabras', text: 'Explica con sus propias palabras', answer_type: 'achievement_3', options: [1, 2, 3], labels: ['1 - No Logrado', '2 - En Proceso', '3 - Logrado'] },
  { section: 'content', title: 'Relaciona con temas previos', text: 'Relaciona con temas previos', answer_type: 'achievement_3', options: [1, 2, 3], labels: ['1 - No Logrado', '2 - En Proceso', '3 - Logrado'] },
  { section: 'content', title: 'Aplica en ejercicios practicos', text: 'Aplica en ejercicios practicos', answer_type: 'achievement_3', options: [1, 2, 3], labels: ['1 - No Logrado', '2 - En Proceso', '3 - Logrado'] },
  { section: 'content', title: 'Usa terminologia adecuada', text: 'Usa terminologia adecuada', answer_type: 'achievement_3', options: [1, 2, 3], labels: ['1 - No Logrado', '2 - En Proceso', '3 - Logrado'] },
  { section: 'content', title: 'Justifica sus respuestas', text: 'Justifica sus respuestas', answer_type: 'achievement_3', options: [1, 2, 3], labels: ['1 - No Logrado', '2 - En Proceso', '3 - Logrado'] },
  { section: 'observaciones', title: 'Observaciones particulares', text: 'Observaciones particulares (opcional)', answer_type: 'free_text', options: null, labels: null },
];

const MODEL_INFO = {
  'gemma4': {
    name: 'Gemma 4 (31B Cloud)',
    desc: 'Creado por Google (EE.UU.). Excelente calidad en espanol para textos educativos. Requiere conexion a internet.',
    specs: [
      { label: 'Velocidad', value: 'Normal (~20-30s)' },
      { label: 'Calidad', value: 'Excelente en espanol, ideal para informes escolares' },
      { label: 'Conexion', value: 'Requiere internet' },
      { label: 'Creador', value: 'Google (modelo en la nube)' },
    ]
  },
  'qwen3.5': {
    name: 'Qwen 3.5 (Cloud)',
    desc: 'Creado por Alibaba (China). Muy buen rendimiento en espanol y texto educativo. Requiere conexion a internet.',
    specs: [
      { label: 'Velocidad', value: 'Normal (~20-30s)' },
      { label: 'Calidad', value: 'Muy buena, gran soporte multilingue con espanol' },
      { label: 'Conexion', value: 'Requiere internet' },
      { label: 'Creador', value: 'Alibaba (modelo en la nube)' },
    ]
  },
  'nemotron-3-super': {
    name: 'Nemotron 3 Super (Cloud)',
    desc: 'Creado por NVIDIA (EE.UU.). Destaca en razonamiento complejo, matematicas y tareas avanzadas. Requiere conexion a internet.',
    specs: [
      { label: 'Velocidad', value: 'Rapida (~15-20s)' },
      { label: 'Calidad', value: 'Excelente en razonamiento y textos estructurados' },
      { label: 'Conexion', value: 'Requiere internet' },
      { label: 'Creador', value: 'NVIDIA (modelo en la nube)' },
    ]
  },
  'gemini-3-flash-preview': {
    name: 'Gemini 3 Flash Preview (Cloud)',
    desc: 'Creado por Google (EE.UU.). Extremadamente rapido y eficiente, con capacidades multimodales. Requiere conexion a internet.',
    specs: [
      { label: 'Velocidad', value: 'Muy rapida (~10-15s)' },
      { label: 'Calidad', value: 'Buena, rapido pero menos detallado que modelos mas grandes' },
      { label: 'Conexion', value: 'Requiere internet' },
      { label: 'Creador', value: 'Google (modelo en la nube)' },
    ]
  },
  'deepseek-v4-flash': {
    name: 'DeepSeek V4 Flash (Cloud)',
    desc: 'Creado por DeepSeek (China). Excelente en razonamiento profundo, matematicas y generacion de codigo. Requiere conexion a internet.',
    specs: [
      { label: 'Velocidad', value: 'Normal (~30-45s)' },
      { label: 'Calidad', value: 'Excelente en razonamiento profundo, analisis detallado' },
      { label: 'Conexion', value: 'Requiere internet' },
      { label: 'Creador', value: 'DeepSeek (modelo en la nube)' },
    ]
  },
  'gemma3': {
    name: 'Gemma 3 (Local)',
    desc: 'Creado por Google (EE.UU.). Modelo local ligero. Funciona sin internet.',
    specs: [
      { label: 'Velocidad', value: 'Rapida (~5-15s)' },
      { label: 'Calidad', value: 'Buena calidad, menor precision en textos largos' },
      { label: 'Conexion', value: 'Funciona sin internet' },
      { label: 'Creador', value: 'Google (modelo local)' },
    ]
  },
  'llama3.1': {
    name: 'Llama 3.1 (Local)',
    desc: 'Creado por Meta (EE.UU.). Buen soporte multilingue y razonamiento. Funciona sin internet.',
    specs: [
      { label: 'Velocidad', value: 'Rapida (~5-15s)' },
      { label: 'Calidad', value: 'Buena, multilingue, balance calidad-velocidad' },
      { label: 'Conexion', value: 'Funciona sin internet' },
      { label: 'Creador', value: 'Meta (modelo local)' },
    ]
  },
};

function getModelSpecs(rawName, info) {
  if (info && info.specs) return info.specs;
  const baseName = rawName.split(':')[0].toLowerCase();
  const isCloud = rawName.toLowerCase().indexOf('cloud') >= 0;
  const connValue = isCloud ? 'Requiere internet' : 'Posiblemente local';
  return [
    { label: 'Velocidad', value: 'Variable -- proba el modelo para medir' },
    { label: 'Calidad', value: 'Verifica la documentacion del modelo en Ollama' },
    { label: 'Conexion', value: connValue },
    { label: 'Creador', value: 'Modelo instalado en Ollama (' + baseName + ')' },
  ];
}

function normalizeModelName(name) {
  return name.split(':')[0];
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
    console.error('Error cargando cuestionario del curso:', err);
  }
  setCurrentQuestionnaire(null);
  setCurrentQuestions(ALL_QUESTIONS);
  setTotalQuestions(ALL_QUESTIONS.length);
}

async function loadStudentsForCourse(course) {
  try {
    const data = await apiGet(`/courses/${encodeURIComponent(course)}/students`);
    setAllStudents(data.students);
    setCurrentStudentIndex(0);
  } catch (err) {
    console.error('Error cargando alumnos:', err);
  }
}

function showWizardFromHash(substep) {
  hideHero();
  hideOnboarding();
  hideMainContentScreens();
  hide($('course-view'));
  setSidebarMode('full');
  show($('wizard'));
  // Map substep name to step number (4-step wizard)
  const stepMap = { attendance: 1, questionnaire: 2, config: 3, report: 4 };
  const step = stepMap[substep] || 1;
  document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#progress-bar .step').forEach(el => el.classList.remove('active'));
  const stepEl = $(`step-${step}`);
  if (stepEl) stepEl.classList.add('active');
  const progressEl = document.querySelector(`#progress-bar .step[data-step="${step}"]`);
  if (progressEl) progressEl.classList.add('active');
  document.querySelectorAll('#progress-bar .step').forEach(el => el.classList.remove('completed'));
  for (let i = 1; i < step; i++) {
    const prev = document.querySelector(`#progress-bar .step[data-step="${i}"]`);
    if (prev) prev.classList.add('completed');
  }
  import('./state.js').then(mod => mod.setCurrentWizardStep(step));
  // Step 1 = attendance (observations only), step 2 = questionnaire, step 3 = config, step 4 = report
  if (step === 1) {
    show($('observations-panel'));
    hide($('question-card'));
    hide(document.querySelector('.question-progress-bar'));
    hide($('question-counter'));
  } else if (step === 2) {
    hide($('observations-panel'));
    show($('question-card'));
    show(document.querySelector('.question-progress-bar'));
    show($('question-counter'));
  } else {
    hide($('observations-panel'));
    hide($('question-card'));
    hide(document.querySelector('.question-progress-bar'));
    hide($('question-counter'));
  }
  const helpMap = { 1: 'wizard_obs', 2: 'wizard_q', 3: 'wizard_cfg', 4: 'wizard_report' };
  const helpScreen = helpMap[step] || 'wizard_obs';
  updateHelpButton(helpScreen);
  setCurrentHelpScreen(helpScreen);
  import('./utils.js').then(mod => mod.announceStep(step));
}

const ONBOARDING_TEMPLATE = `
  <div id="onboarding-overlay" class="onboarding-overlay">
    <div class="onboarding-card">
      <h1>Bienvenido a InformesCreator</h1>
      <p class="onboarding-subtitle">Generador de Informes de Avance</p>
      <div id="onboarding-ollama" class="onboarding-section">
        <h2>Verificando Ollama...</h2>
        <div id="onboarding-ollama-status" class="status-box">
          <p>Verificando estado de Ollama...</p>
        </div>
        <div id="onboarding-ollama-setup" class="hidden"></div>
      </div>
      <div id="onboarding-folder" class="onboarding-section">
        <h2>Carpeta de archivos</h2>
        <div class="folder-option">
          <label><input type="radio" name="folder-option" value="existing" checked> Ya tengo la carpeta CURSOS con mis alumnos</label>
        </div>
        <div class="folder-option">
          <label><input type="radio" name="folder-option" value="new"> No tengo carpeta, quiero crear un curso nuevo</label>
        </div>
        <div id="existing-folder-section">
          <label for="base-path">Ruta base (donde esta la carpeta CURSOS):</label>
          <div style="display:flex;gap:8px;">
            <input type="text" id="base-path" placeholder="Ej: E:\\Google_Drive\\Base\\Mi escuela\\CURSOS" style="flex:1;">
            <button id="btn-pick-folder" class="btn-secondary btn-sm" type="button" style="margin-top:0;white-space:nowrap;">
              <i data-lucide="folder-search" style="width:16px;height:16px;"></i> Seleccionar
            </button>
          </div>
          <p class="hint">En Windows podes usar la barra invertida (\\) o la barra normal (/).</p>
        </div>
        <div id="new-course-section" class="hidden">
          <label for="new-course-name">Nombre del curso:</label>
          <input type="text" id="new-course-name" placeholder="Ej: 1ro B ESN5">
          <label for="new-students-list">Lista de alumnos (uno por linea):</label>
          <textarea id="new-students-list" rows="6" placeholder="Ej:&#10;Aguilar, SANTINO&#10;Bermudez, MARTINA&#10;..."></textarea>
          <p class="hint">Escribi un nombre por linea. La app les asigna numero de lista automaticamente.</p>
        </div>
      </div>
      <button id="btn-start" class="btn-primary" disabled>Comenzar</button>
    </div>
  </div>
`;

function bindOnboardingListeners() {
  $('btn-start').addEventListener('click', completeOnboarding);
  document.querySelectorAll('input[name="folder-option"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'existing') {
        show($('existing-folder-section'));
        hide($('new-course-section'));
      } else {
        hide($('existing-folder-section'));
        show($('new-course-section'));
      }
      const ollamaOk = getSystemStatus().ollamaRunning;
      const folderOk = e.target.value === 'existing'
        ? $('base-path').value.trim().length > 0
        : $('new-course-name').value.trim().length > 0 && $('new-students-list').value.trim().length > 0;
      $('btn-start').disabled = !(ollamaOk && folderOk);
    });
  });
  $('base-path').addEventListener('input', () => {
    updateFolderIndicator($('base-path').value);
    const ollamaOk = getSystemStatus().ollamaRunning;
    $('btn-start').disabled = !(ollamaOk && $('base-path').value.trim().length > 0);
  });
  $('btn-pick-folder').addEventListener('click', async () => {
    try {
      setLoading(true);
      const data = await apiGet('/pick-folder');
      setLoading(false);
      if (data.error) { showToast('No se pudo abrir el selector. Intenta de nuevo.', 'error'); return; }
      if (data.cancelled) return;
      if (data.path) {
        $('base-path').value = data.path;
        $('base-path').dispatchEvent(new Event('input'));
        $('base-path').focus();
      }
    } catch (err) {
      setLoading(false);
      showToast('No se pudo abrir el selector. Intenta de nuevo.', 'error');
    }
  });
}

export function showOnboarding() {
  const root = $('onboarding-root');
  if (!root) return;
  root.innerHTML = ONBOARDING_TEMPLATE;
  if (window.lucide) lucide.createIcons({ nodes: [root] });
  bindOnboardingListeners();
}

export function hideOnboarding() {
  const root = $('onboarding-root');
  if (root) root.innerHTML = '';
}

export function showHero() {
  hideMainContentScreens();
  const stage = $('landing-stage');
  if (stage) stage.classList.remove('hidden');

  import('./auth.js').then(m => m.renderAuthCard());

  if (window.lucide) lucide.createIcons();
}

export function hideHero() {
  const stage = $('landing-stage');

  // Keep the stage visible when on auth routes (it IS the landing)
  if (!window.location.hash.includes('login') && !window.location.hash.includes('register')) {
    if (stage) stage.classList.add('hidden');
  }
}

export async function preloadSystemStatus() {
  try {
    const cfg = await apiGet('/config');
    const st = getSystemStatus();
    st.basePath = cfg.base_path || '';
    if ($('base-path')) $('base-path').value = st.basePath;

    // Use explicit folder_exists from backend
    st.folderPath = st.basePath;
    st.folderOk = !!cfg.folder_exists;
    setSystemStatus(st);
  } catch (err) {
    console.error('Error loading config:', err);
  }
  try {
    const data = await apiGet('/ollama/status');
    const st = getSystemStatus();
    if (data.running) {
      st.ollamaRunning = true;
      st.ollamaError = null;
    } else {
      st.ollamaError = data.installed ? 'Ollama detenido' : 'Ollama no instalado';
      st.ollamaRunning = false;
    }
    setSystemStatus(st);
  } catch (err) {
    const st = getSystemStatus();
    st.ollamaError = 'Error al verificar Ollama';
    st.ollamaRunning = false;
    setSystemStatus(st);
  }
  updateStatusDot();
  if (window.lucide) lucide.createIcons();
}

function updateFolderIndicator(path) {
  // This is now mostly used for manual input in onboarding
  const st = getSystemStatus();
  st.folderPath = path || '';
  st.folderOk = !!(path && path.trim());
  setSystemStatus(st);
  updateStatusDot();
}

export function setSidebarMode(mode) {
  const layoutBody = $('layout-body');
  const coursesSection = $('sidebar-courses-section');
  const mobileFab = $('btn-mobile-sidebar-toggle');
  if (mode === 'hidden') {
    hide(layoutBody);
    if (mobileFab) hide(mobileFab);
  } else {
    show(layoutBody);
    if (mobileFab && window.innerWidth <= 768) show(mobileFab);
    else if (mobileFab) hide(mobileFab);
    if (coursesSection) {
      coursesSection.classList.toggle('collapsed', mode === 'compact');
    }
  }
  updateSidebarNavActive();
}

export function updateSidebarNavActive() {
  const hash = window.location.hash || '';
  const linkCourses = $('sidebar-link-courses');
  const linkQuestionnaires = $('sidebar-link-questionnaires');
  if (linkCourses) linkCourses.classList.toggle('active', hash.startsWith('#/course') || hash === '#/courses');
  if (linkQuestionnaires) linkQuestionnaires.classList.toggle('active', hash.startsWith('#/questionnaire'));
}

export function updateStatusDot() {
  const dot = $('sidebar-status-dot');
  const text = $('sidebar-status-text');
  const alias = $('sidebar-path-alias');
  if (!dot && !text) return;
  const st = getSystemStatus();
  const ollamaOk = st.ollamaRunning;
  const folderOk = st.folderOk;
  let statusLabel, dotClass;
  if (ollamaOk && folderOk) {
    dotClass = 'ok';
    statusLabel = 'Ollama activo';
  } else if (!ollamaOk && !folderOk) {
    dotClass = 'error';
    statusLabel = 'Problemas detectados';
  } else if (!ollamaOk) {
    dotClass = 'error';
    statusLabel = st.ollamaError || 'Ollama desconectado';
  } else {
    dotClass = 'pending';
    statusLabel = 'Carpeta no configurada';
  }
  if (dot) dot.className = `dropdown-status-dot ${dotClass}`;
  if (text) text.textContent = statusLabel;
  if (alias) {
    if (st.folderPath) {
      const folderAlias = st.folderPath.split(/[\\\\/]/).filter(Boolean).pop() || st.folderPath;
      alias.textContent = folderAlias;
      alias.title = st.folderPath;
    } else {
      alias.textContent = 'Sin ruta';
      alias.title = '';
    }
  }
}

export async function runOnboarding() {
  const overlay = $('onboarding-overlay');
  if (!overlay) {
    showOnboarding();
  }
  try {
    const cfg = await apiGet('/config');
    $('base-path').value = cfg.base_path || '';
    updateFolderIndicator(cfg.base_path);
  } catch (err) {
    console.error('Error loading config:', err);
  }
  await checkOllamaStatus();
  const ollamaOk = getSystemStatus().ollamaRunning;
  const folderOk = $('base-path').value.trim().length > 0;
  $('btn-start').disabled = !(ollamaOk && folderOk);
}

async function checkOllamaStatus() {
  try {
    const data = await apiGet('/ollama/status');
    const statusBox = $('onboarding-ollama-status');
    const setupDiv = $('onboarding-ollama-setup');
    const st = getSystemStatus();
    if (data.running) {
      st.ollamaRunning = true;
      st.ollamaError = null;
      setSystemStatus(st);
      statusBox.className = 'status-box ok';
      statusBox.innerHTML = `<p><strong>Ollama esta activo.</strong> Modelos disponibles: ${data.models.length}</p>`;
      hide(setupDiv);
    } else if (data.installed) {
      st.ollamaRunning = false;
      st.ollamaError = 'Ollama detenido';
      setSystemStatus(st);
      statusBox.className = 'status-box error';
      statusBox.innerHTML = `<p><strong>Ollama esta instalado pero no esta corriendo.</strong></p>`;
      show(setupDiv);
      setupDiv.innerHTML = `<div class="setup-instructions"><h4>Como iniciar Ollama</h4><p>Abri una terminal y ejecuta:</p><code>ollama serve</code><p class="hint">Dejala corriendo en segundo plano.</p></div>`;
    } else {
      st.ollamaRunning = false;
      st.ollamaError = 'Ollama no instalado';
      setSystemStatus(st);
      statusBox.className = 'status-box error';
      statusBox.innerHTML = `<p><strong>Ollama no esta instalado.</strong></p>`;
      show(setupDiv);
      setupDiv.innerHTML = `<div class="setup-instructions"><h4>Como instalar Ollama</h4><p><strong>Windows (PowerShell admin):</strong></p><code>irm https://ollama.com/install.ps1 | iex</code><p><strong>macOS / Linux:</strong></p><code>curl -fsSL https://ollama.com/install.sh | sh</code><p>Mas info en <a href="https://ollama.com" target="_blank">ollama.com</a></p></div>`;
    }
  } catch (err) {
    const st = getSystemStatus();
    st.ollamaRunning = false;
    st.ollamaError = 'Error al verificar Ollama';
    setSystemStatus(st);
    $('onboarding-ollama-status').innerHTML = `<p>Error al verificar Ollama: ${err.message}</p>`;
  }
  updateStatusDot();
  if (window.lucide) lucide.createIcons();
}

async function completeOnboarding() {
  const folderOption = document.querySelector('input[name="folder-option"]:checked').value;
  if (folderOption === 'existing') {
    const basePath = $('base-path').value.trim();
    if (!basePath) {
      showToast('Ingresa la ruta base donde esta la carpeta CURSOS.', 'warning');
      return;
    }
    try {
      await apiPost('/config', { base_path: basePath });
      const st = getSystemStatus();
      st.basePath = basePath;
      setSystemStatus(st);
    } catch (err) {
      showToast('No se pudo guardar la ruta. Revisa la conexion e intenta de nuevo.', 'error');
      return;
    }
  } else {
    const courseName = $('new-course-name').value.trim();
    const rawNames = $('new-students-list').value.trim();
    if (!courseName) {
      showToast('Ingresa un nombre para el curso.', 'warning');
      return;
    }
    if (!rawNames) {
      showToast('Ingresa al menos un alumno.', 'warning');
      return;
    }
    const students = parseStudentNames(rawNames);
    if (students.length === 0) {
      showToast('No se pudieron detectar nombres de alumnos. Escribi un nombre por linea.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await apiPost('/config', { base_path: './data/CURSOS' });
      await apiPost('/courses/create', { course_name: courseName, students });
      showToast(`Curso "${courseName}" creado con ${students.length} alumnos.`, 'success');
    } catch (err) {
      showToast('No se pudo crear el curso. Verifica la carpeta y los permisos.', 'error');
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  }
  setOnboardingComplete(true);
  hideOnboarding();
  setSidebarMode('compact');
  show($('courses-grid'));
  renderSidebarCourses();
  loadCoursesGrid();
  updateHelpButton('courses');
  setCurrentHelpScreen('courses');
  navigateTo('#/courses');
}

export async function loadCoursesGrid() {
  setLoading(true);
  try {
    const data = await apiGet('/courses');
    const courses = data.courses;
    const container = $('courses-grid');
    if (courses.length === 0) {
      container.innerHTML = '<p class="hint">No se encontraron cursos. Verifica la ruta base.</p>';
      setLoading(false);
      return;
    }
    const sessionPromises = courses.map(c =>
      apiGet(`/courses/${encodeURIComponent(c.name || c)}/session`).catch(() => ({
        respuestas: {}, progreso: { completados: [] }, informes_existentes: []
      }))
    );
    const sessions = await Promise.all(sessionPromises);
    const sessionsMap = getCourseSessions();
    courses.forEach((c, i) => {
      sessionsMap[c.name || c] = sessions[i];
    });
    setCourseSessions(sessionsMap);
    container.innerHTML = courses.map((c, i) => {
      const session = sessions[i];
      const existingReports = session.informes_existentes?.length || 0;
      const completedCount = session.progreso?.completados?.length || 0;
      const totalStudents = c.student_count || 0;
      const progressPct = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
      const hasData = (session.respuestas && Object.keys(session.respuestas).length > 0) || existingReports > 0;
      const stateBadge = existingReports > 0
        ? '<span class="course-list-row-badge"><span class="badge badge-success">'+existingReports+' informe(s)</span></span>'
        : (hasData ? '<span class="course-list-row-badge"><span class="badge badge-warning">Datos guardados</span></span>' : '');
      return `
      <div class="course-list-row" data-course="${c.name || c}" tabindex="0" role="link" aria-label="Abrir curso ${c.name || c}">
      <span class="course-list-row-name">${c.name || c}</span>
      ${stateBadge}
      <span class="course-list-row-meta">
      <span class="course-list-row-count">${c.student_count || '?'} alumno(s)${completedCount > 0 ? ' &middot; '+completedCount+' listos' : ''}</span>
      <span class="course-list-row-minibar"><span class="course-list-row-minifill${progressPct === 100 ? ' complete' : ''}" style="width:${progressPct}%"></span></span>
      </span>
      <span class="course-list-row-arrow">${icon('chevron-right', 18)}</span>
      </div>
      `;
    }).join('');
    container.querySelectorAll('.course-list-row').forEach(row => {
      row.addEventListener('click', () => {
        const course = row.dataset.course;
        navigateTo(`#/course/${course.replace(/\s+/g, '-')}`);
      });
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const course = row.dataset.course;
          navigateTo(`#/course/${course.replace(/\s+/g, '-')}`);
        }
      });
    });
    refreshIcons(container);
  } catch (err) {
    showToast('No se pudieron cargar los cursos. Revisa la conexion e intenta de nuevo.', 'error');
  } finally {
    setLoading(false);
  }
}

async function openCourse(course) {
  setSelectedCourse(course);
  setLoading(true);
  try {
    const session = await apiGet(`/courses/${encodeURIComponent(course)}/session`);
    const sessionsMap = getCourseSessions();
    sessionsMap[course] = session;
    setCourseSessions(sessionsMap);
    const data = await apiGet(`/courses/${encodeURIComponent(course)}/students`);
    setAllStudents(data.students);
    setCurrentStudentIndex(0);
    await loadQuestionnaireForCourse(course);
    loadContents(course);
    hideMainContentScreens();
    setSidebarMode('full');
    show($('course-view'));
    hide($('wizard'));
    $('course-view-title').textContent = course;
    await renderDashboard();
    updateHelpButton('dashboard');
    setCurrentHelpScreen('dashboard');
    navigateTo(`#/course/${course.replace(/\s+/g, '-')}`);
  } catch (err) {
    showToast('No se pudo abrir el curso. Verifica que la carpeta exista.', 'error');
  } finally {
    setLoading(false);
  }
}

function openCoursesMenu() {
  hide($('course-view'));
  hide($('wizard'));
  const contentsPanel = $('course-contents-section');
  if (contentsPanel) contentsPanel.classList.add('hidden');
  setSidebarMode('compact');
  show($('courses-grid'));
  renderSidebarCourses();
  loadCoursesGrid();
  updateHelpButton('courses');
  setCurrentHelpScreen('courses');
  navigateTo('#/courses');
}

export function parseStudentNames(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  return lines.map((line, i) => {
    const pipeMatch = line.match(/^(.+?)\s*\|\s*(\d+)$/);
    if (pipeMatch) {
      return { nombre: pipeMatch[1].trim(), lista_numero: parseInt(pipeMatch[2]) };
    }
    const numMatch = line.match(/^\d+[.\-)]\s*(.+)$/);
    if (numMatch) {
      return { nombre: numMatch[1].trim(), lista_numero: i + 1 };
    }
    return { nombre: line, lista_numero: i + 1 };
  });
}

async function loadContents(course) {
  try {
    const data = await apiGet(`/courses/${encodeURIComponent(course)}/contents`);
    const textarea = $('course-contents');
    if (textarea) {
      textarea.value = data.contents || '';
      textarea.dataset.savedValue = textarea.value;
      updateSaveContentsButton();
    }
  } catch (err) {
    console.error('Error loading contents:', err);
  }
}

async function saveCourseContents() {
  if (!getSelectedCourse()) return;
  const textarea = $('course-contents');
  if (!textarea) return;
  setLoading(true);
  try {
    await apiPost(`/courses/${encodeURIComponent(getSelectedCourse())}/contents`, {
      contents: textarea.value
    });
    textarea.dataset.savedValue = textarea.value;
    updateSaveContentsButton();
    showToast('Contenidos guardados.', 'success');
  } catch (err) {
    showToast('No se pudieron guardar los contenidos. Intenta de nuevo.', 'error');
  } finally {
    setLoading(false);
  }
}

function updateSaveContentsButton() {
  const textarea = $('course-contents');
  const btn = $('btn-save-course-contents');
  if (!textarea || !btn) return;
  const hasChanges = textarea.value !== (textarea.dataset.savedValue || '');
  btn.disabled = !hasChanges;
}

async function initFromHashCourse(course, target, substep) {
  setLoading(true);
  try {
    const session = await apiGet(`/courses/${encodeURIComponent(course)}/session`);
    const sessionsMap = getCourseSessions();
    sessionsMap[course] = session;
    setCourseSessions(sessionsMap);
    const data = await apiGet(`/courses/${encodeURIComponent(course)}/students`);
    setAllStudents(data.students);
    setCurrentStudentIndex(0);
    setSelectedCourse(course);
    await loadQuestionnaireForCourse(course);
    hideHero();
    hideOnboarding();
    hideMainContentScreens();
    hide($('wizard'));
    hide($('questionnaires-screen'));
    hide($('questionnaire-editor'));
    setSidebarMode('full');
    show($('course-view'));
    $('course-view-title').textContent = course;
    loadContents(course);
    renderSidebarCourses();
    await renderDashboard();
    updateHelpButton('dashboard');
    setCurrentHelpScreen('dashboard');
  } catch (err) {
    console.error('Error inicializando curso desde hash:', err);
    navigateTo('#/courses');
  } finally {
    setLoading(false);
  }
}

async function handleHashChange() {
  const hash = window.location.hash || '#/';
  const status = getSystemStatus();
  const auth = getAuthState();

  // Guard for protected routes
  const isProtectedRoute = hash.startsWith('#/course') || hash === '#/courses' || hash.startsWith('#/questionnaire') || hash === '#/onboarding';
  
  if (isProtectedRoute && !auth.loggedIn) {
    navigateTo('#/login');
    return;
  }

  // If logged in but misconfigured, force onboarding (unless already there)
  if (isProtectedRoute && auth.loggedIn && hash !== '#/onboarding' && (!status.ollamaRunning || !status.folderOk)) {
    navigateTo('#/onboarding');
    return;
  }

  if (hash === '#/login') {
    import('./auth.js').then(m => m.showLoginScreen());
    hideHero();
    hideOnboarding();
    setSidebarMode('hidden');
    hideMainContentScreens();
    hide($('course-view'));
    hide($('wizard'));
    hide($('questionnaires-screen'));
    hide($('questionnaire-editor'));
    updateHelpButton('');
    setCurrentHelpScreen('');
    return;
  }
  if (hash === '#/register') {
    import('./auth.js').then(m => m.showRegisterScreen());
    hideHero();
    hideOnboarding();
    setSidebarMode('hidden');
    hideMainContentScreens();
    hide($('course-view'));
    hide($('wizard'));
    hide($('questionnaires-screen'));
    hide($('questionnaire-editor'));
    updateHelpButton('');
    setCurrentHelpScreen('');
    return;
  }
  if (hash === '' || hash === '#' || hash === '#/') {
    return;
  }
  if (hash === '#/onboarding') {
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      await runOnboarding();
      return;
    }
    hideHero();
    hideMainContentScreens();
    setSidebarMode('hidden');
    hide($('course-view'));
    hide($('wizard'));
    hide($('questionnaires-screen'));
    hide($('questionnaire-editor'));
    showOnboarding();
    updateHelpButton('onboarding');
    setCurrentHelpScreen('onboarding');
    await runOnboarding();
    return;
  }
  if (hash === '#/courses') {
    if (!$('courses-grid').classList.contains('hidden') && $('course-view').classList.contains('hidden') && $('wizard').classList.contains('hidden') && $('questionnaires-screen').classList.contains('hidden') && $('questionnaire-editor').classList.contains('hidden')) return;
    hideHero();
    hideOnboarding();
    hide($('course-view'));
    hide($('wizard'));
    hide($('questionnaires-screen'));
    hide($('questionnaire-editor'));
    setSidebarMode('compact');
    show($('courses-grid'));
    renderSidebarCourses();
    loadCoursesGrid();
    updateHelpButton('courses');
    setCurrentHelpScreen('courses');
    return;
  }
  const courseMatch = hash.match(/#\/course\/(.+)/);
  if (courseMatch) {
    const course = courseMatch[1].replace(/-/g, ' ');
    if (getSelectedCourse() === course && !$('course-view').classList.contains('hidden') && $('wizard').classList.contains('hidden') && $('questionnaires-screen').classList.contains('hidden') && $('questionnaire-editor').classList.contains('hidden')) {
      return;
    }
    const sessionsMap = getCourseSessions();
    const allStudents = getAllStudents();
    if (!sessionsMap[course] || !allStudents.length || allStudents[0]?.curso !== course) {
      initFromHashCourse(course, 'dashboard');
      return;
    }
    hideHero();
    hideOnboarding();
    hideMainContentScreens();
    hide($('wizard'));
    hide($('questionnaires-screen'));
    hide($('questionnaire-editor'));
    setSidebarMode('full');
    show($('course-view'));
    setSelectedCourse(course);
    $('course-view-title').textContent = course;
    loadContents(course);
    renderSidebarCourses();
    await renderDashboard();
    updateHelpButton('dashboard');
    setCurrentHelpScreen('dashboard');
    return;
  }
  const wizardMatch = hash.match(/#\/wizard\/([^/]+)(?:\/(\w+))?/);
  if (wizardMatch) {
    const course = wizardMatch[1].replace(/-/g, ' ');
    const substep = wizardMatch[2];
    const sessionsMap = getCourseSessions();
    const allStudents = getAllStudents();
    if (!sessionsMap[course] || !allStudents.length || allStudents[0]?.curso !== course) {
      initFromHashCourse(course, 'wizard', substep);
      return;
    }
    if (getSelectedCourse() !== course) {
      setSelectedCourse(course);
      if (!allStudents.length || allStudents[0]?.curso !== course) {
        loadStudentsForCourse(course).then(() => {
          showWizardFromHash(substep);
        });
        return;
      }
    }
    hide($('questionnaires-screen'));
    hide($('questionnaire-editor'));
    showWizardFromHash(substep);
    return;
  }
  if (hash === '#/questionnaires') {
    if (!$('questionnaires-screen').classList.contains('hidden') && $('questionnaire-editor').classList.contains('hidden')) return;
    hideHero();
    hideOnboarding();
    hideMainContentScreens();
    hide($('course-view'));
    hide($('wizard'));
    hide($('questionnaire-editor'));
    setSidebarMode('compact');
    show($('questionnaires-screen'));
    import('./questionnaire-editor.js').then(mod => mod.loadQuestionnairesList());
    updateHelpButton('');
    setCurrentHelpScreen('');
    return;
  }
  const qeMatch = hash.match(/#\/questionnaires\/(new|edit)\/?(.*)/);
  if (qeMatch) {
    const mode = qeMatch[1];
    const id = mode === 'edit' ? qeMatch[2] : null;
    hideHero();
    hideOnboarding();
    hideMainContentScreens();
    hide($('course-view'));
    hide($('wizard'));
    hide($('questionnaires-screen'));
    setSidebarMode('compact');
    show($('questionnaire-editor'));
    const mod = await import('./questionnaire-editor.js');
    const state = await import('./state.js');
    if (mode === 'new' && !state.getEditingQuestionnaireId()) {
      mod.openQuestionnaireEditor(null);
    } else if (mode === 'edit' && state.getEditingQuestionnaireId() !== id) {
      mod.openQuestionnaireEditor(id);
    }
    updateHelpButton('');
    setCurrentHelpScreen('');
    return;
  }
}

function renderModelRow(m) {
  const iconName = m.isCloud ? 'cloud' : 'monitor';
  const tagClass = m.isCloud ? 'tag-cloud' : 'tag-local';
  const tagText = m.isCloud ? 'Nube' : 'Local';
  const descHtml = m.isRecommended
    ? m.desc + ' <span style="color:var(--success-text);font-weight:600;">(Recomendado)</span>'
    : m.desc;
  const specs = m.specs || [];
  const specsHtml = specs.map(function(s) {
    return '<span class="selection-row-spec-label">' + s.label + '</span>' +
      '<span class="selection-row-spec-value">' + s.value + '</span>';
  }).join('');
  return '<div class="selection-row" role="radio" aria-selected="false" tabindex="0" data-value="' + m.rawName + '" aria-label="' + m.name + '">' +
    '<span class="selection-indicator"></span>' +
    '<span class="selection-content">' +
    '<span class="selection-row-header">' +
    '<span class="selection-row-icon">' + icon(iconName, 16) + '</span>' +
    '<span class="selection-row-name">' + m.name + '</span>' +
    '<span class="selection-row-tag ' + tagClass + '">' + tagText + '</span>' +
    '<button class="btn-spec-toggle" aria-label="Ver detalles de ' + m.name + '" data-action="toggle-specs" data-model="' + m.rawName + '" onclick="event.stopPropagation()">' + icon('help-circle', 14) + '</button>' +
    '</span>' +
    '<span class="selection-row-desc">' + descHtml + '</span>' +
    '</span>' +
    '</div>' +
    '<div class="selection-row-specs hidden" data-specs-for="' + m.rawName + '">' +
    '<div class="selection-row-specs-grid">' + specsHtml + '</div>' +
    '</div>';
}

function renderEmptyModelState() {
  return '<div class="selection-empty">' +
    '<span class="selection-empty-icon">' + icon('alert-circle', 20) + '</span>' +
    '<div class="selection-empty-message">' +
    '<div class="selection-empty-title">No hay modelos instalados</div>' +
    '<p>Instala un modelo para generar informes. Abri una terminal y ejecuta:</p>' +
    '<div class="selection-empty-instructions">' +
    '<code class="selection-empty-code">ollama pull gemma3</code>' +
    '<p style="font-size:.75rem;color:var(--text-tertiary);">Despues de instalarlo, volve a esta pantalla.</p>' +
    '</div>' +
    '</div>' +
    '</div>';
}

function renderErrorModelState() {
  return '<div class="selection-empty">' +
    '<span class="selection-empty-icon">' + icon('alert-triangle', 20) + '</span>' +
    '<div class="selection-empty-message">' +
    '<div class="selection-empty-title">Ollama no esta disponible</div>' +
    '<p class="selection-empty-error">El servidor de Ollama no esta corriendo.</p>' +
    '<div class="selection-empty-action">' +
    '<button class="btn-secondary btn-sm" onclick="loadModelSelect()">Reintentar</button>' +
    '</div>' +
    '<p style="font-size:.75rem;color:var(--text-tertiary);margin-top:var(--space-2);">Abri Ollama o ejecuta <code>ollama serve</code> en una terminal.</p>' +
    '</div>' +
    '</div>';
}

async function loadModelSelect() {
  const container = $('model-cards');
  const extraContainer = $('model-cards-extra');
  const btnMore = $('btn-show-more-models');
  if (!container) return;
  container.innerHTML = '<div class="selection-skeleton"><div class="selection-skeleton-bar"></div><div class="selection-skeleton-bar"></div><div class="selection-skeleton-bar"></div></div>';
  hide(extraContainer);
  hide(btnMore);

  function selectModelRow(row) {
    const model = row.dataset.value;
    document.querySelectorAll('#model-cards .selection-row, #model-cards-extra .selection-row').forEach(function(r) {
      r.setAttribute('aria-selected', 'false');
    });
    row.setAttribute('aria-selected', 'true');
    setSelectedModel(model);
  }

  try {
    const data = await apiGet('/ollama/status');
    const rawModels = data.models || [];
    if (rawModels.length === 0) {
      container.innerHTML = renderEmptyModelState();
      hide(extraContainer);
      hide(btnMore);
      setSelectedModel(null);
      const btn2 = $('btn-step-2');
      if (btn2) btn2.disabled = true;
      return;
    }
    const modelEntries = rawModels.map(function(rawName) {
      const baseName = normalizeModelName(rawName);
      const info = MODEL_INFO[baseName];
      const isCloud = info ? (info.name.indexOf('(Cloud)') !== -1 || info.desc.indexOf('Requiere conexion') !== -1) : false;
      if (info) {
        return { rawName, baseName, name: info.name, desc: info.desc, isRecommended: baseName === 'gemma4', isCloud, specs: info.specs || getModelSpecs(rawName, info) };
      }
      return { rawName, baseName, name: rawName, desc: 'Modelo instalado en Ollama.', isRecommended: false, isCloud, specs: getModelSpecs(rawName, null) };
    });
    modelEntries.sort(function(a, b) {
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      if (a.isCloud !== b.isCloud) return a.isCloud ? -1 : 1;
      return (a.baseName || a.name).localeCompare(b.baseName || b.name);
    });
    const firstFour = modelEntries.slice(0, 4);
    const rest = modelEntries.slice(4);
    container.innerHTML = firstFour.map(function(m) { return renderModelRow(m); }).join('');
    if (rest.length > 0) {
      extraContainer.innerHTML = rest.map(function(m) { return renderModelRow(m); }).join('');
      show(btnMore);
      hide(extraContainer);
    } else {
      hide(btnMore);
      hide(extraContainer);
    }
    function wireRows(el) {
      el.querySelectorAll('.selection-row').forEach(function(row) {
        row.addEventListener('click', function() { selectModelRow(row); });
        row.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectModelRow(row); }
        });
      });
    }
    wireRows(container);
    wireRows(extraContainer);
    const preferred = modelEntries.find(function(m) { return m.isRecommended; }) || modelEntries[0];
    if (preferred) {
      const preferredRow = container.querySelector('.selection-row[data-value="' + preferred.rawName + '"]') || extraContainer.querySelector('.selection-row[data-value="' + preferred.rawName + '"]');
      if (preferredRow) selectModelRow(preferredRow);
    }
  } catch (err) {
    console.error('Error loading models:', err);
    container.innerHTML = renderErrorModelState();
  }
}

export async function loadVariantsInner() {
  await loadModelSelect();
  try {
    const data = await apiGet('/variants');
    const container = $('variants-list');
    function selectVariantRow(row) {
      const id = row.dataset.value;
      container.querySelectorAll('.selection-row').forEach(function(r) {
        r.setAttribute('aria-selected', 'false');
      });
      row.setAttribute('aria-selected', 'true');
      setSelectedVariant(id);
    }
    container.innerHTML = data.map(function(v) {
      let wordHint = '';
      if (v.word_count_target) {
        wordHint = v.word_count_target.indexOf('Media') >= 0 ? 'Media carilla' : (v.word_count_target.indexOf('Una') >= 0 ? 'Una carilla' : 'Un parrafo');
      }
      return '<div class="selection-row" role="radio" aria-selected="false" tabindex="0" data-value="' + v.id + '" aria-label="Variante ' + v.name + '">' +
        '<span class="selection-variant-badge">' + v.id + '</span>' +
        '<span class="selection-content">' +
        '<span class="selection-row-header">' +
        '<span class="selection-row-name">' + v.name + '</span>' +
        '</span>' +
        '<span class="selection-row-desc">' + (wordHint ? wordHint + '. ' : '') + v.description + '</span>' +
        '</span>' +
        '</div>';
    }).join('');
    container.querySelectorAll('.selection-row').forEach(function(row) {
      row.addEventListener('click', function() { selectVariantRow(row); });
      row.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectVariantRow(row); }
      });
    });
    if (data.length > 0) {
      const firstRow = container.querySelector('.selection-row');
      if (firstRow) selectVariantRow(firstRow);
    }
  } catch (err) {
    console.error('Error loading variants:', err);
  }
}

function saveContents() {
  return saveCourseContents();
}

function exportToWindow() {
  Object.assign(window, {
    navigateTo, showHero, hideHero, showHelp, showConfirm, showToast, setLoading,
    openCoursesMenu, loadCoursesGrid, loadModelSelect,
    showWizard, hideWizard, goToWizardStep,
    selectStudent, triggerStudentAction, applyFormat, togglePreview, handleAutoSave,
    navigateToCourse, createCourseFromSidebar, toggleMobileSidebar, closeMobileSidebar,
    startWizardForStudent, loadStudentContext, showObservationsPanel,
    skipObservationsAndContinue, parseQuickObservations, addEmptyObsRow,
    saveObservationsAndContinue, saveQuestionnaire,
    finishQuestionnaire, skipAllAndGenerate,
    skipQuestion, goToPreviousQuestion, renderQuestion, handleAnswer,
    doGenerateReport, doRegenerateWithCustomization,
    downloadReport, downloadAllReports, goToNextStudent, downloadReportForIndex,
    showQuestionnairesScreen, loadQuestionnairesList,
    openQuestionnaireEditor, saveQuestionnaireEditor, closeQuestionnaireEditor,
    duplicateQuestionnaire, deleteQuestionnaire,
    runOnboarding, updateStatusDot, preloadSystemStatus,
    completeOnboarding, handleHashChange, setSidebarMode, updateSidebarNavActive,
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function init() {
  exportToWindow();

  if (window.lucide) {
    lucide.createIcons();
  }

  const { loadAuthState, saveAuthState, initAuth } = await import('./auth.js');
  await initAuth();
  const authState = getAuthState();

  if (authState.loggedIn) {
    await preloadSystemStatus();
  }

  // If no hash, decide what to show based on auth state
  if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#') {
    if (authState.loggedIn) {
      const status = getSystemStatus();
      if (!status.ollamaRunning || !status.folderOk) {
        navigateTo('#/onboarding');
      } else {
        navigateTo('#/courses');
      }
    } else {
      showHero();
    }
  }

  $('btn-back-to-menu').addEventListener('click', openCoursesMenu);

  const qSelector = $('dashboard-questionnaire-selector');
  if (qSelector) {
    qSelector.addEventListener('click', (e) => {
      if (e.target.tagName === 'LABEL' || e.target.tagName === 'H4') {
        qSelector.classList.toggle('hidden');
      }
    });
  }

  const courseContents = $('course-contents');
  if (courseContents) {
    courseContents.addEventListener('input', updateSaveContentsButton);
  }
  const btnSaveCourseContents = $('btn-save-course-contents');
  if (btnSaveCourseContents) {
    btnSaveCourseContents.addEventListener('click', saveCourseContents);
  }
  const btnToggleContents = $('btn-toggle-contents');
  if (btnToggleContents) {
    btnToggleContents.addEventListener('click', () => {
      const body = $('course-contents-body');
      const expanded = btnToggleContents.getAttribute('aria-expanded') === 'true';
      btnToggleContents.setAttribute('aria-expanded', String(!expanded));
      if (body) body.classList.toggle('hidden', expanded);
      if (!expanded && window.lucide) lucide.createIcons({ nodes: [$('course-contents-section')] });
    });
  }

  $('prev-question-btn').addEventListener('click', () => import('./wizard.js').then(m => m.goToPreviousQuestion()));
  $('btn-save-questionnaire').addEventListener('click', () => import('./wizard.js').then(m => m.saveQuestionnaire()));
  $('question-skip-text').addEventListener('click', () => import('./wizard.js').then(m => m.skipQuestion()));
  $('btn-skip-all-questions').addEventListener('click', () => import('./wizard.js').then(m => m.skipAllAndGenerate()));
  $('btn-parse-obs').addEventListener('click', () => import('./wizard.js').then(m => m.parseQuickObservations()));
  $('btn-add-obs-row').addEventListener('click', () => import('./wizard.js').then(m => m.addEmptyObsRow()));
  $('btn-skip-obs').addEventListener('click', () => import('./wizard.js').then(m => m.skipObservationsAndContinue()));
  $('btn-exit-without-save').addEventListener('click', async () => {
    const ok = await showConfirm('Los cambios no guardados se perderan. ¿Salir?');
    if (ok) import('./wizard.js').then(m => m.hideWizard());
  });
  $('btn-save-obs').addEventListener('click', () => import('./wizard.js').then(m => m.saveObservationsAndContinue()));
  $('obs-attendance-total').addEventListener('input', () => {
    const total = parseInt($('obs-attendance-total').value) || 0;
    const absences = parseInt($('obs-attendance-absences').value) || 0;
    const pct = total > 0 ? ((absences / total) * 100).toFixed(1) : 0;
    $('obs-attendance-percentage').textContent = total > 0
      ? `Inasistencia: ${pct}% (${absences} de ${total} clases)`
      : '';
  });
  $('obs-attendance-absences').addEventListener('input', () => {
    const total = parseInt($('obs-attendance-total').value) || 0;
    const absences = parseInt($('obs-attendance-absences').value) || 0;
    const pct = total > 0 ? ((absences / total) * 100).toFixed(1) : 0;
    $('obs-attendance-percentage').textContent = total > 0
      ? `Inasistencia: ${pct}% (${absences} de ${total} clases)`
      : '';
  });

  document.querySelectorAll('#progress-bar .step').forEach(step => {
    step.addEventListener('click', async () => {
      const targetStep = parseInt(step.dataset.step);
      const { getCurrentWizardStep } = await import('./state.js');
      if (targetStep < getCurrentWizardStep()) {
        import('./wizard.js').then(m => {
          m.goToWizardStep(targetStep);
          if (targetStep === 1) {
            // Attendance/observations step: show panel
            show($('observations-panel'));
            hide($('question-card'));
            hide(document.querySelector('.question-progress-bar'));
            hide($('question-counter'));
          } else if (targetStep === 2) {
            // Questionnaire step
            hide($('observations-panel'));
            show($('question-card'));
            show(document.querySelector('.question-progress-bar'));
            show($('question-counter'));
          } else {
            // Config or report step: hide both panels
            hide($('observations-panel'));
            hide($('question-card'));
            hide(document.querySelector('.question-progress-bar'));
            hide($('question-counter'));
          }
        });
      }
    });
  });

  $('btn-show-more-models').addEventListener('click', () => {
    show($('model-cards-extra'));
    hide($('btn-show-more-models'));
  });

  // Step 3 button: go to step 4 (report) + generate
  $('btn-step-3').addEventListener('click', async () => {
    import('./wizard.js').then(m => m.goToWizardStep(4));
    import('./report.js').then(m => m.doGenerateReport());
  });

  // Back to questionnaire: step 2 (questionnaire), show question card + progress bar
  $('btn-back-to-questionnaire').addEventListener('click', async () => {
    import('./wizard.js').then(m => {
      m.goToWizardStep(2);
      show($('question-card'));
      show(document.querySelector('.question-progress-bar'));
      show($('question-counter'));
      hide($('observations-panel'));
    });
  });

  $('btn-download').addEventListener('click', () => import('./report.js').then(m => m.downloadReport()));
  $('btn-modify-report').addEventListener('click', () => {
    const panel = $('customization-panel');
    panel.classList.toggle('hidden');
  });
  $('btn-next-student').addEventListener('click', () => import('./report.js').then(m => m.goToNextStudent()));
  $('btn-go-dashboard').addEventListener('click', () => import('./wizard.js').then(m => m.hideWizard()));
  $('btn-finish').addEventListener('click', openCoursesMenu);
  $('btn-regenerate-custom').addEventListener('click', () => import('./report.js').then(m => m.doRegenerateWithCustomization()));
  $('btn-toggle-advanced').addEventListener('click', () => {
    const sliders = $('advanced-sliders');
    const btn = $('btn-toggle-advanced');
    if (sliders.classList.contains('hidden')) {
      show(sliders);
      btn.textContent = 'Ocultar ajustes avanzados';
    } else {
      hide(sliders);
      btn.textContent = 'Ajustes avanzados';
    }
  });

  document.querySelectorAll('.length-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      setSelectedVariant(e.currentTarget.dataset.length);
      document.querySelectorAll('.length-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      e.currentTarget.classList.add('active');
      e.currentTarget.setAttribute('aria-pressed', 'true');
    });
  });

  const sliderLabel = (value, labels) => {
    if (value <= 25) return labels[0];
    if (value <= 50) return labels[1];
    if (value <= 75) return labels[2];
    return labels[3];
  };

  const updateCustomizationText = () => {
    const textarea = $('customization-text');
    if (textarea.dataset.manual === 'true') return;
    const formality = parseInt($('slider-formality').value);
    const empathy = parseInt($('slider-empathy').value);
    const detail = parseInt($('slider-detail').value);
    const naturalness = parseInt($('slider-naturalness').value);
    const parts = [];
    parts.push(sliderLabel(formality, ['tono muy casual y cercano', 'tono moderadamente informal', 'tono profesional y neutro', 'tono muy formal y académico']));
    parts.push(sliderLabel(empathy, ['enfoque objetivo y descriptivo', 'algo objetivo, con ligero acompañamiento', 'empatía moderada, reconociendo esfuerzos', 'muy empático, destacando logros y apoyando dificultades']));
    parts.push(sliderLabel(detail, ['extremadamente conciso, solo lo esencial', 'breve, con puntos clave', 'desarrollado, con ejemplos moderados', 'muy detallado, con análisis profundo']));
    parts.push(sliderLabel(naturalness, ['estructurado, formato clásico de informe', 'algo estructurado con flexibilidad', 'natural, como nota de seguimiento', 'muy conversacional, como charla con colega']));
    textarea.value = parts.join('. ') + '.';
  };

  ['formality', 'empathy', 'detail', 'naturalness'].forEach(name => {
    const slider = $(`slider-${name}`);
    if (slider) slider.addEventListener('input', updateCustomizationText);
  });

  $('customization-text').addEventListener('input', () => {
    const hasText = $('customization-text').value.trim().length > 0;
    $('customization-text').dataset.manual = hasText ? 'true' : 'false';
    ['formality', 'empathy', 'detail', 'naturalness'].forEach(name => {
      const slider = $(`slider-${name}`);
      if (slider) slider.disabled = hasText;
    });
  });

  $('btn-download-all').addEventListener('click', () => import('./report.js').then(m => m.downloadAllReports()));

  // Sidebar footer event bindings
  const btnSidebarUserMenu = $('btn-sidebar-user-menu');
  const sidebarUserMenuExpanded = $('sidebar-user-menu-expanded');
  if (btnSidebarUserMenu && sidebarUserMenuExpanded) {
    btnSidebarUserMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebarUserMenuExpanded.classList.toggle('hidden');
      const chevron = btnSidebarUserMenu.querySelector('[data-lucide]');
      if (chevron) {
        const isHidden = sidebarUserMenuExpanded.classList.contains('hidden');
        chevron.setAttribute('data-lucide', isHidden ? 'chevron-up' : 'chevron-down');
        if (window.lucide) lucide.createIcons({ nodes: [btnSidebarUserMenu] });
      }
    });
  }

  const sidebarMenuProfile = $('sidebar-menu-profile');
  if (sidebarMenuProfile) {
    sidebarMenuProfile.addEventListener('click', (e) => {
      e.preventDefault();
      if (sidebarUserMenuExpanded) sidebarUserMenuExpanded.classList.add('hidden');
      import('./auth.js').then(m => m.openProfileModal());
    });
  }

  const sidebarMenuHelp = $('sidebar-menu-help');
  if (sidebarMenuHelp) {
    sidebarMenuHelp.addEventListener('click', (e) => {
      e.preventDefault();
      if (sidebarUserMenuExpanded) sidebarUserMenuExpanded.classList.add('hidden');
      showHelp(getCurrentHelpScreen());
    });
  }

  const sidebarMenuLogout = $('sidebar-menu-logout');
  if (sidebarMenuLogout) {
    sidebarMenuLogout.addEventListener('click', (e) => {
      e.preventDefault();
      if (sidebarUserMenuExpanded) sidebarUserMenuExpanded.classList.add('hidden');
      import('./auth.js').then(m => m.doLogout());
    });
  }

  const sidebarChangePath = $('sidebar-change-path');
  if (sidebarChangePath) {
    sidebarChangePath.addEventListener('click', (e) => {
      e.preventDefault();
      import('./auth.js').then(m => m.openProfileModal());
    });
  }

  const sidebarLinkCourses = $('sidebar-link-courses');
  if (sidebarLinkCourses) sidebarLinkCourses.addEventListener('click', () => navigateTo('#/courses'));
  const sidebarLinkQuestionnaires = $('sidebar-link-questionnaires');
  if (sidebarLinkQuestionnaires) sidebarLinkQuestionnaires.addEventListener('click', () => navigateTo('#/questionnaires'));

  // FAB visibility on resize
  window.addEventListener('resize', () => {
    const fab = $('btn-mobile-sidebar-toggle');
    const layoutBody = $('layout-body');
    if (!fab || !layoutBody || layoutBody.classList.contains('hidden')) return;
    if (window.innerWidth <= 768) show(fab);
    else hide(fab);
  });

  window.addEventListener('hashchange', handleHashChange);
  if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
    handleHashChange();
  }

  $('btn-close-questionnaires').addEventListener('click', () => navigateTo('#/courses'));
  $('btn-new-questionnaire').addEventListener('click', () => navigateTo('#/questionnaires/new/'));
  $('btn-save-questionnaire-editor').addEventListener('click', () => import('./questionnaire-editor.js').then(m => m.saveQuestionnaireEditor()));
  $('btn-cancel-questionnaire-editor').addEventListener('click', () => navigateTo('#/questionnaires'));
  $('qe-textarea').addEventListener('input', () => {
    import('./questionnaire-editor.js').then(m => {
      m.renderMarkdownPreview(m.parseMarkdownQuestions($('qe-textarea').value));
    });
  });


  const mobileToggle = $('btn-mobile-sidebar-toggle');
  if (mobileToggle) mobileToggle.addEventListener('click', () => import('./sidebar.js').then(m => m.toggleMobileSidebar()));
  const sidebarClose = $('btn-sidebar-close');
  if (sidebarClose) sidebarClose.addEventListener('click', () => import('./sidebar.js').then(m => m.closeMobileSidebar()));

  const btnNew = $('btn-sidebar-new-course');
  const createForm = $('sidebar-create-course');
  if (btnNew && createForm) {
    btnNew.addEventListener('click', async () => {
      const { show, hide, refreshIcons } = await import('./utils.js');
      if (createForm.classList.contains('hidden')) {
        show(createForm);
        btnNew.classList.add('adding');
        btnNew.setAttribute('aria-label', 'Cancelar');
        btnNew.innerHTML = '<i data-lucide="x" style="width:18px;height:18px;"></i>';
        if (window.lucide) lucide.createIcons({ nodes: [btnNew] });
      } else {
        hide(createForm);
        btnNew.classList.remove('adding');
        btnNew.setAttribute('aria-label', 'Nuevo curso');
        btnNew.innerHTML = '<i data-lucide="plus" style="width:18px;height:18px;"></i>';
        if (window.lucide) lucide.createIcons({ nodes: [btnNew] });
      }
    });
  }

  const btnCreate = $('btn-sidebar-create-confirm');
  const btnCancel = $('btn-sidebar-create-cancel');
  if (btnCreate) btnCreate.addEventListener('click', () => import('./sidebar.js').then(m => m.createCourseFromSidebar()));
  if (btnCancel) {
    btnCancel.addEventListener('click', async () => {
      const { hide } = await import('./utils.js');
      hide(createForm);
      if (btnNew) {
        btnNew.classList.remove('adding');
        btnNew.setAttribute('aria-label', 'Nuevo curso');
        btnNew.innerHTML = '<i data-lucide="plus" style="width:18px;height:18px;"></i>';
        if (window.lucide) lucide.createIcons({ nodes: [btnNew] });
      }
    });
  }

  document.addEventListener('keydown', async (e) => {
    if (e.key === 'Escape') {
      const sidebarUserMenuExpanded = $('sidebar-user-menu-expanded');
      if (sidebarUserMenuExpanded && !sidebarUserMenuExpanded.classList.contains('hidden')) {
        sidebarUserMenuExpanded.classList.add('hidden');
        const chevronBtn = $('btn-sidebar-user-menu');
        if (chevronBtn) {
          const chevron = chevronBtn.querySelector('[data-lucide]');
          if (chevron) chevron.setAttribute('data-lucide', 'chevron-up');
          if (window.lucide) lucide.createIcons({ nodes: [chevronBtn] });
        }
      }
      const studentDrawer = document.getElementById('student-drawer');
      if (studentDrawer && !studentDrawer.classList.contains('hidden')) {
        import('./dashboard.js').then(m => m.closeStudentDrawer());
      }
    } else if (e.key === 'ArrowLeft') {
      const studentDrawer = document.getElementById('student-drawer');
      if (studentDrawer && !studentDrawer.classList.contains('hidden')) {
        const { getSelectedStudentIndex } = await import('./state.js');
        const idx = getSelectedStudentIndex();
        if (idx > 0) import('./dashboard.js').then(m => m.selectStudent(idx - 1));
      }
    } else if (e.key === 'ArrowRight') {
      const studentDrawer = document.getElementById('student-drawer');
      if (studentDrawer && !studentDrawer.classList.contains('hidden')) {
        const { getSelectedStudentIndex, getAllStudents } = await import('./state.js');
        const idx = getSelectedStudentIndex();
        if (idx < getAllStudents().length - 1) import('./dashboard.js').then(m => m.selectStudent(idx + 1));
      }
    }
  });

  document.addEventListener('click', function(e) {
    const toggle = e.target.closest('[data-action="toggle-specs"]');
    if (!toggle) return;
    e.stopPropagation();
    const panel = document.querySelector('[data-specs-for="' + toggle.dataset.model + '"]');
    if (!panel) return;
    const isOpen = !panel.classList.contains('hidden');
    document.querySelectorAll('.selection-row-specs:not(.hidden)').forEach(function(p) { p.classList.add('hidden'); });
    document.querySelectorAll('.btn-spec-toggle.active').forEach(function(b) { b.classList.remove('active'); });
    if (!isOpen) {
      panel.classList.remove('hidden');
      toggle.classList.add('active');
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.selection-row-specs:not(.hidden)').forEach(function(p) { p.classList.add('hidden'); });
    document.querySelectorAll('.btn-spec-toggle.active').forEach(function(b) { b.classList.remove('active'); });
  });
}
