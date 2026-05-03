import { apiGet, apiPost } from './api.js';
import { $, show, hide, showToast, setLoading, refreshIcons, icon, showConfirm } from './utils.js';
import { getSelectedCourse, setAllStudents, getAllStudents, getCurrentStudentIndex, setCurrentStudentIndex, getCourseSessions, setCourseSessions, getSessionReports, setSessionReports, getQuestionnaireAnswers, setQuestionnaireAnswers, getCurrentQuestionIndex, setCurrentQuestionIndex, getCurrentQuestionnaire, setCurrentQuestionnaire, getCurrentQuestions, setCurrentQuestions, getTotalQuestions, setTotalQuestions, getAttendanceData, setAttendanceData, getLastReportDownloaded, getSelectedModel, getSelectedVariant, getCurrentWizardStep, setCurrentWizardStep } from './state.js';
import { navigateTo } from './auth.js';

let currentObservations = [];

export function getCurrentObservations() { return currentObservations; }
export function setCurrentObservations(v) { currentObservations = v; }

export function showWizard() {
  const selectedCourse = getSelectedCourse();
  hide($('course-view'));
  show($('wizard'));
  import('./utils.js').then(mod => mod.updateHelpButton('wizard_obs'));
  import('./state.js').then(mod => mod.setCurrentHelpScreen('wizard_obs'));
  navigateTo(`#/wizard/${selectedCourse.replace(/\s+/g, '-')}`);
}

export function hideWizard() {
  hide($('wizard'));
  show($('course-view'));
  import('./dashboard.js').then(mod => mod.renderDashboard());
  import('./utils.js').then(mod => mod.updateHelpButton('dashboard'));
  import('./state.js').then(mod => mod.setCurrentHelpScreen('dashboard'));
  const selectedCourse = getSelectedCourse();
  navigateTo(`#/course/${selectedCourse.replace(/\s+/g, '-')}`);
  $('report-preview').innerHTML = '<p class="hint">Completá los pasos anteriores para generar un informe.</p>';
  hide($('report-actions'));
  hide($('customization-panel'));
}

export function goToWizardStep(step) {
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
  setCurrentWizardStep(step);
  // 4-step map: 1=attendance, 2=questionnaire, 3=config, 4=report
  const helpMap = { 1: 'wizard_obs', 2: 'wizard_q', 3: 'wizard_cfg', 4: 'wizard_report' };
  const helpScreen = helpMap[step] || 'wizard_obs';
  import('./utils.js').then(mod => mod.updateHelpButton(helpScreen));
  import('./state.js').then(mod => mod.setCurrentHelpScreen(helpScreen));
  import('./utils.js').then(mod => mod.announceStep(step));
  const selectedCourse = getSelectedCourse();
  const slug = selectedCourse.replace(/\s+/g, '-');
  const stepNames = { 1: 'attendance', 2: 'questionnaire', 3: 'config', 4: 'report' };
  navigateTo(`#/wizard/${slug}/${stepNames[step] || ''}`);
  setTimeout(() => {
    const stepEl = $(`step-${step}`);
    const heading = stepEl ? stepEl.querySelector('h2, h3, h4') : null;
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
  }, 100);
}

export async function startWizardForStudent(continuar = false) {
  showWizard();
  setQuestionnaireAnswers({});
  setCurrentQuestionIndex(0);
  const allStudents = getAllStudents();
  const currentStudentIndex = getCurrentStudentIndex();
  const selectedCourse = getSelectedCourse();
  const student = allStudents[currentStudentIndex];
  if (student) {
    try {
      const data = await apiGet(`/courses/${encodeURIComponent(selectedCourse)}/students/${encodeURIComponent(student.filename)}/questionnaire`);
      const qid = data.questionnaire_id;
      if (qid) {
        const qData = await apiGet(`/questionnaires/${qid}`);
        if (qData && qData.questions && qData.questions.length > 0) {
          setCurrentQuestionnaire(qData);
          setCurrentQuestions(qData.questions);
          setTotalQuestions(qData.questions.length);
        }
      }
    } catch (err) {
      console.error('Error cargando cuestionario del alumno:', err);
    }
  }
  if (continuar) {
    continueQuestionnaireForCurrentStudent();
  } else {
    setupQuestionnaireForCurrentStudent();
  }
}

export async function loadStudentContext() {
  const allStudents = getAllStudents();
  const currentStudentIndex = getCurrentStudentIndex();
  const selectedCourse = getSelectedCourse();
  const student = allStudents[currentStudentIndex];
  if (!student) return;
  $('sticky-student-name').textContent = `${student.nombre_completo} — ${student.curso}`;
  $('sticky-student-counter').textContent = `Alumno ${currentStudentIndex + 1} de ${allStudents.length}`;
  try {
    const data = await apiGet(`/students/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(student.filename)}/observations`);
    currentObservations = data.observaciones || [];
  } catch (err) {
    currentObservations = [];
  }
  const totalClases = (student.total_presentes || 0) + (student.total_ausencias || 0);
  $('obs-attendance-total').value = totalClases;
  $('obs-attendance-absences').value = student.total_ausencias || 0;
  updateObsAttendancePercentage();
  renderObservationsTable();
  updateObsAttendanceSummary();
}

export async function showObservationsPanel() {
  await loadStudentContext();
  hide($('question-card'));
  hide(document.querySelector('.question-progress-bar'));
  hide($('question-counter'));
  show($('observations-panel'));
  $('wizard-substep-label').textContent = 'Paso 1a: Observaciones y asistencia';
  $('btn-skip-obs').textContent = 'Despues lo completo — Ir al cuestionario ahora';
}

function renderObservationsTable() {
  const container = $('obs-table-body');
  if (currentObservations.length === 0) {
    container.innerHTML = '<p class="hint" style="padding: 8px 0;">No hay observaciones.</p>';
    return;
  }
  container.innerHTML = currentObservations.map((obs, i) => {
    const codigo = (obs.codigo || '').toString().toUpperCase();
    return `
    <div class="obs-row" data-index="${i}">
    <input type="text" class="obs-fecha" value="${obs.fecha || ''}" placeholder="15/3" aria-label="Fecha de observacion">
    <select class="obs-codigo" aria-label="Codigo de observacion">
    <option value="" ${codigo === '' ? 'selected' : ''}>Seleccionar</option>
    <option value="P" ${codigo === 'P' ? 'selected' : ''} aria-label="P: Presente">P</option>
    <option value="A" ${codigo === 'A' ? 'selected' : ''} aria-label="A: Ausente">A</option>
    <option value="P-EXC" ${codigo === 'P-EXC' ? 'selected' : ''} aria-label="P-EXC: Presente Excelente">P-EXC</option>
    <option value="P-X" ${codigo === 'P-X' ? 'selected' : ''} aria-label="P-X: Presente sin material">P-X</option>
    <option value="T" ${codigo === 'T' ? 'selected' : ''} aria-label="T: Tardanza">T</option>
    </select>
    <input type="text" class="obs-comentario" value="${obs.comentario || ''}" placeholder="Comentario" aria-label="Comentario de observacion">
    <button class="btn-remove-row" data-index="${i}"><i data-lucide="x" style="width:14px;height:14px;"></i></button>
    </div>
    `;
  }).join('');
  container.querySelectorAll('.btn-remove-row').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.closest('button').dataset.index);
      currentObservations.splice(idx, 1);
      renderObservationsTable();
      updateObsAttendanceSummary();
    });
  });
  refreshIcons(container);
}

export function addEmptyObsRow() {
  currentObservations.push({ fecha: '', codigo: '', tipo: '', comentario: '' });
  renderObservationsTable();
}

export function parseQuickObservations() {
  const raw = $('obs-quick-text').value.trim();
  if (!raw) return;
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  lines.forEach(line => {
    const match = line.match(/^([\d/]+)\s*-\s*(.+)$/);
    if (match) {
      currentObservations.push({
        fecha: match[1].trim(),
        codigo: '',
        tipo: '',
        comentario: match[2].trim()
      });
    } else {
      currentObservations.push({ fecha: '', codigo: '', tipo: '', comentario: line });
    }
  });
  $('obs-quick-text').value = '';
  renderObservationsTable();
  updateObsAttendanceSummary();
}

function updateObsAttendanceSummary() {
  const totalObs = currentObservations.length;
  const sumEl = $('obs-attendance-summary');
  sumEl.textContent = totalObs > 0
    ? totalObs + ' observacion' + (totalObs !== 1 ? 'es' : '') + ' registrada' + (totalObs !== 1 ? 's' : '')
    : 'Sin observaciones registradas';
  sumEl.classList.toggle('has-data', totalObs > 0);
}

export function updateObsAttendancePercentage() {
  const total = parseInt($('obs-attendance-total').value) || 0;
  const absences = parseInt($('obs-attendance-absences').value) || 0;
  const pct = total > 0 ? ((absences / total) * 100).toFixed(1) : 0;
  $('obs-attendance-percentage').textContent = total > 0
    ? `Inasistencia: ${pct}% (${absences} de ${total} clases)`
    : '';
}

export async function saveObservationsAndContinue() {
  const rows = document.querySelectorAll('.obs-row');
  currentObservations = [];
  rows.forEach(row => {
    currentObservations.push({
      fecha: row.querySelector('.obs-fecha').value,
      codigo: row.querySelector('.obs-codigo').value,
      tipo: '',
      comentario: row.querySelector('.obs-comentario').value,
    });
  });
  const allStudents = getAllStudents();
  const currentStudentIndex = getCurrentStudentIndex();
  const selectedCourse = getSelectedCourse();
  const student = allStudents[currentStudentIndex];
  const totalClasses = parseInt($('obs-attendance-total').value) || 0;
  const absences = parseInt($('obs-attendance-absences').value) || 0;
  setLoading(true);
  try {
    await apiPost(`/students/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(student.filename)}/observations`, {
      observaciones: currentObservations
    });
    student.total_presentes = totalClasses - absences;
    student.total_ausencias = absences;
    setAttendanceData({
      include: true,
      total_classes: totalClasses,
      absences: absences
    });
    const obsPanel = $('observations-panel');
    obsPanel.classList.add('exiting');
    await new Promise(function(r) { return setTimeout(r, 200); });
    hide(obsPanel);
    obsPanel.classList.remove('exiting');
    startQuestionnaireForCurrentStudent();
  } catch (err) {
    showToast('No se pudieron guardar las observaciones. Intenta de nuevo.', 'error');
  } finally {
    setLoading(false);
  }
}

export function skipObservationsAndContinue() {
  const obsPanel = $('observations-panel');
  obsPanel.classList.add('exiting');
  setTimeout(function() {
    hide(obsPanel);
    obsPanel.classList.remove('exiting');
    startQuestionnaireForCurrentStudent();
  }, 200);
}

function continueQuestionnaireForCurrentStudent() {
  const allStudents = getAllStudents();
  const currentStudentIndex = getCurrentStudentIndex();
  const selectedCourse = getSelectedCourse();
  const student = allStudents[currentStudentIndex];
  if (!student) return;
  $('sticky-student-name').textContent = `${student.nombre_completo} — ${student.curso}`;
  $('sticky-student-counter').textContent = `Alumno ${currentStudentIndex + 1} de ${allStudents.length}`;
  setQuestionnaireAnswers({});
  setCurrentQuestionIndex(0);
  $('wizard-substep-label').textContent = 'Paso 1b: Cuestionario pedagogico';
  hide($('observations-panel'));
  show($('question-card'));
  show(document.querySelector('.question-progress-bar'));
  show($('question-counter'));
  const session = getCourseSessions()[selectedCourse];
  const inProgress = session?.progreso?.inProgress?.[student.filename];
  if (inProgress && inProgress.answers) {
    setQuestionnaireAnswers({ ...inProgress.answers });
    const idx = inProgress.lastQuestionIndex || 0;
    setCurrentQuestionIndex(idx);
    renderQuestion(idx);
    return;
  }
  const savedAnswers = session?.respuestas?.[student.filename];
  if (savedAnswers) {
    loadAnswersFromSaved(savedAnswers);
  }
  const totalQuestions = getTotalQuestions();
  const questionnaireAnswers = getQuestionnaireAnswers();
  let startIndex = 0;
  for (let i = 0; i < totalQuestions; i++) {
    if (questionnaireAnswers[i] === undefined) {
      startIndex = i;
      break;
    }
  }
  if (startIndex >= totalQuestions) startIndex = totalQuestions - 1;
  renderQuestion(startIndex);
}

async function startQuestionnaireForCurrentStudent() {
  const allStudents = getAllStudents();
  const currentStudentIndex = getCurrentStudentIndex();
  const selectedCourse = getSelectedCourse();
  const student = allStudents[currentStudentIndex];
  if (!student) return;
  setQuestionnaireAnswers({});
  setCurrentQuestionIndex(0);
  $('wizard-substep-label').textContent = 'Paso 1b: Cuestionario pedagogico';
  show($('question-card'));
  show(document.querySelector('.question-progress-bar'));
  show($('question-counter'));
  const session = getCourseSessions()[selectedCourse];
  const savedAnswers = session?.respuestas?.[student.filename];
  if (savedAnswers) {
    const reuse = await showConfirm(`Este alumno ya tiene respuestas guardadas. Queres reutilizarlas?`);
    if (reuse) {
      loadAnswersFromSaved(savedAnswers);
    }
  }
  renderQuestion(0);
}

function loadAnswersFromSaved(saved) {
  if (!saved) return;
  const currentQuestions = getCurrentQuestions();
  const questionnaireAnswers = getQuestionnaireAnswers();
  const sectionCounters = {};
  for (let i = 0; i < currentQuestions.length; i++) {
    const q = currentQuestions[i];
    if (q.section === 'observaciones') {
      questionnaireAnswers[i] = saved.particular_observations || '';
      continue;
    }
    const sectionData = saved[q.section];
    if (!sectionCounters[q.section]) sectionCounters[q.section] = 0;
    const idx = sectionCounters[q.section];
    sectionCounters[q.section]++;
    if (Array.isArray(sectionData) && idx < sectionData.length) {
      questionnaireAnswers[i] = sectionData[idx];
    } else if (idx === 0 && typeof sectionData === 'string') {
      questionnaireAnswers[i] = sectionData;
    }
  }
  setQuestionnaireAnswers(questionnaireAnswers);
}

export function setupQuestionnaireForCurrentStudent() {
  showObservationsPanel();
}

export function renderQuestion(index) {
  const currentQuestions = getCurrentQuestions();
  const totalQuestions = getTotalQuestions();
  const questionnaireAnswers = getQuestionnaireAnswers();
  setCurrentQuestionIndex(index);
  const q = currentQuestions[index];
  const savedValue = questionnaireAnswers[index];
  const pct = ((index + 1) / totalQuestions) * 100;
  const fillEl = $('question-progress-fill');
  const prevPct = parseFloat(fillEl.style.width) || 0;
  if (pct < prevPct) {
    fillEl.style.transition = 'none';
    fillEl.style.width = `${pct}%`;
    fillEl.offsetHeight;
    fillEl.style.transition = '';
  } else {
    fillEl.style.width = `${pct}%`;
  }
  fillEl.setAttribute('aria-valuenow', Math.round(pct));
  fillEl.classList.toggle('complete', pct >= 100);
  $('question-counter').textContent = `Pregunta ${index + 1} de ${totalQuestions}`;
  $('question-section-header').textContent = getSectionDisplayName(q.section);
  const title = getQuestionTitle(q);
  const body = getQuestionBody(q);
  const displayBody = body || (q.text !== title ? q.text : '');
  $('question-title-label').textContent = title;
  $('current-question-text').textContent = displayBody || title;
  if (!displayBody || title === displayBody) {
    hide($('question-title-label'));
  } else {
    show($('question-title-label'));
  }
  const optionsContainer = $('current-question-options');
  optionsContainer.innerHTML = '';
  const isLong = q.answer_type === 'tea_tep_ted' || (q.labels && q.labels.some(l => l.length > 30));
  optionsContainer.classList.toggle('full-mode', !!isLong);

  if (q.answer_type === 'free_text') {
    const textarea = document.createElement('textarea');
    textarea.rows = 4;
    textarea.placeholder = 'Situaciones puntuales...';
    textarea.style.width = '100%';
    textarea.style.gridColumn = '1 / -1';
    textarea.style.padding = '12px';
    textarea.style.borderRadius = 'var(--radius-md)';
    textarea.style.border = '1px solid var(--border-default)';
    textarea.style.fontSize = '0.95rem';
    if (savedValue !== undefined) textarea.value = savedValue;
    textarea.addEventListener('input', () => {
      const qa = getQuestionnaireAnswers();
      qa[index] = textarea.value;
      setQuestionnaireAnswers(qa);
    });
    const continueBtn = document.createElement('button');
    continueBtn.textContent = 'Continuar';
    continueBtn.className = 'btn-primary';
    continueBtn.style.marginTop = '16px';
    continueBtn.style.gridColumn = '1 / -1';
    continueBtn.addEventListener('click', () => handleAnswer(textarea.value));
    optionsContainer.appendChild(textarea);
    optionsContainer.appendChild(continueBtn);
  } else if (q.options) {
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      const iconName = getOptionIcon(q.answer_type, i);
      const { prefix, text } = cleanLabel(q.labels[i]);
      const showTextBadge = prefix && (isNaN(prefix) || !iconName);
      const badgeHtml = showTextBadge ? `<span class="btn-badge">${prefix}</span>` : '';
      const iconHtml = iconName ? `<span class="btn-icon-badge">${icon(iconName, 18)}</span>` : '';
      btn.innerHTML = `${iconHtml}${badgeHtml}<span class="btn-text">${text}</span>`;
      btn.dataset.value = opt;
      if (savedValue === opt || savedValue === q.labels[i]) btn.classList.add('selected');
      btn.addEventListener('click', () => handleAnswer(opt));
      optionsContainer.appendChild(btn);
    });
  }
  refreshIcons(optionsContainer);
  $('prev-question-btn').disabled = index === 0;
  show($('prev-question-btn'));
  const qCard = $('question-card');
  const optionsEl = $('current-question-options');
  const sectionHeader = $('question-section-header');
  [qCard, optionsEl, sectionHeader].forEach(function(el) { el.classList.remove('entering'); });
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      qCard.classList.add('entering');
      optionsEl.classList.add('entering');
      sectionHeader.classList.add('entering');
    });
  });
  const counterEl = $('question-counter');
  if (counterEl) {
    counterEl.classList.remove('entering');
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        counterEl.classList.add('entering');
      });
    });
  }
}

export function handleAnswer(value) {
  if (handleAnswer._pending) {
    clearTimeout(handleAnswer._pending);
    handleAnswer._pending = null;
  }
  const currentQuestionIndex = getCurrentQuestionIndex();
  const questionnaireAnswers = getQuestionnaireAnswers();
  questionnaireAnswers[currentQuestionIndex] = value;
  setQuestionnaireAnswers(questionnaireAnswers);
  const allBtns = document.querySelectorAll('.answer-btn');
  allBtns.forEach(b => {
    if (b.dataset.value === value) {
      b.classList.add('selected');
    } else {
      b.classList.remove('selected');
    }
  });
  const totalQuestions = getTotalQuestions();
  handleAnswer._pending = setTimeout(() => {
    handleAnswer._pending = null;
    if (currentQuestionIndex >= totalQuestions - 1) {
      finishQuestionnaire();
    } else {
      renderQuestion(currentQuestionIndex + 1);
    }
  }, 150);
}

export function skipQuestion() {
  const currentQuestionIndex = getCurrentQuestionIndex();
  const totalQuestions = getTotalQuestions();
  if (currentQuestionIndex >= totalQuestions - 1) {
    finishQuestionnaire();
  } else {
    renderQuestion(currentQuestionIndex + 1);
  }
}

export function goToPreviousQuestion() {
  const currentQuestionIndex = getCurrentQuestionIndex();
  if (currentQuestionIndex > 0) {
    renderQuestion(currentQuestionIndex - 1);
  }
}

export async function saveQuestionnaire() {
  const selectedCourse = getSelectedCourse();
  const allStudents = getAllStudents();
  const currentStudentIndex = getCurrentStudentIndex();
  if (!selectedCourse || !allStudents[currentStudentIndex]) return;
  const filename = allStudents[currentStudentIndex].filename;
  const answers = collectAnswers();
  setLoading(true);
  try {
    let session = getCourseSessions()[selectedCourse] || {};
    session.respuestas = session.respuestas || {};
    session.respuestas[filename] = answers;
    session.progreso = session.progreso || { completados: [] };
    session.progreso.inProgress = session.progreso.inProgress || {};
    const questionnaireAnswers = getQuestionnaireAnswers();
    session.progreso.inProgress[filename] = {
      answers: { ...questionnaireAnswers },
      lastQuestionIndex: getCurrentQuestionIndex()
    };
    await apiPost(`/courses/${encodeURIComponent(selectedCourse)}/session`, {
      respuestas: session.respuestas,
      progreso: session.progreso
    });
    const sessions = getCourseSessions();
    sessions[selectedCourse] = session;
    setCourseSessions(sessions);
    showToast('Cuestionario guardado.', 'success');
    hideWizard();
  } catch (err) {
    showToast('No se pudo guardar el cuestionario. Intenta de nuevo.', 'error');
  } finally {
    setLoading(false);
  }
}

export async function finishQuestionnaire() {
  await saveQuestionnaireBackend();
  const qCard = $('question-card');
  const progBar = document.querySelector('.question-progress-bar');
  const qCounter = $('question-counter');
  [qCard, progBar, qCounter].forEach(function(el) { if (el) el.classList.add('exiting'); });
  await new Promise(function(r) { return setTimeout(r, 200); });
  hide(qCard); hide(progBar); hide(qCounter);
  [qCard, progBar, qCounter].forEach(function(el) { if (el) el.classList.remove('exiting'); });
  goToWizardStep(3);
  await import('./app.js').then(mod => mod.loadVariantsInner());
}

async function saveQuestionnaireBackend() {
  const selectedCourse = getSelectedCourse();
  const allStudents = getAllStudents();
  const currentStudentIndex = getCurrentStudentIndex();
  if (!selectedCourse || !allStudents[currentStudentIndex]) return;
  const filename = allStudents[currentStudentIndex].filename;
  const answers = collectAnswers();
  try {
    let session = getCourseSessions()[selectedCourse] || {};
    session.respuestas = session.respuestas || {};
    session.respuestas[filename] = answers;
    session.progreso = session.progreso || { completados: [] };
    session.progreso.inProgress = session.progreso.inProgress || {};
    const questionnaireAnswers = getQuestionnaireAnswers();
    session.progreso.inProgress[filename] = {
      answers: { ...questionnaireAnswers },
      lastQuestionIndex: getCurrentQuestionIndex()
    };
    await apiPost(`/courses/${encodeURIComponent(selectedCourse)}/session`, {
      respuestas: session.respuestas,
      progreso: session.progreso
    });
    const sessions = getCourseSessions();
    sessions[selectedCourse] = session;
    setCourseSessions(sessions);
  } catch (err) {
    console.error('Error guardando cuestionario:', err);
  }
}

export async function skipAllAndGenerate() {
  const ok = await showConfirm('Se generara el informe usando solo las observaciones del archivo. Las preguntas no respondidas se ignoraran. Continuar?');
  if (!ok) return;
  hide($('question-card'));
  hide(document.querySelector('.question-progress-bar'));
  hide($('question-counter'));
  goToWizardStep(3);
  await import('./app.js').then(mod => mod.loadVariantsInner());
}

export function collectAnswers() {
  const currentQuestions = getCurrentQuestions();
  const totalQuestions = getTotalQuestions();
  const questionnaireAnswers = getQuestionnaireAnswers();
  const attendanceData = getAttendanceData();
  const answers = { attendance: attendanceData };
  for (let i = 0; i < totalQuestions; i++) {
    const q = currentQuestions[i];
    const val = questionnaireAnswers[i];
    if (q.section === 'observaciones') {
      answers.particular_observations = val || '';
      continue;
    }
    if (!answers[q.section]) answers[q.section] = [];
    if (q.section === 'valoracion') {
      answers[q.section] = (val === 'TEA' || val === 'TEP' || val === 'TED') ? val : null;
    } else {
      answers[q.section].push(val !== undefined && val !== 0 ? parseInt(val) : 0);
    }
  }
  return answers;
}

function getQuestionTitle(q) {
  if (q.title) return q.title;
  const colonIdx = q.text.indexOf(':');
  if (colonIdx > 0) return q.text.substring(0, colonIdx).trim();
  return q.text;
}

function getQuestionBody(q) {
  const colonIdx = q.text.indexOf(':');
  if (colonIdx > 0) return q.text.substring(colonIdx + 1).trim();
  return '';
}

function getSectionDisplayName(section) {
  const names = {
    valoracion: 'Valoracion',
    pedagogical: 'Pedagogico',
    socioemotional: 'Socioemocional',
    content: 'Contenidos',
    observaciones: 'Observaciones'
  };
  return names[section] || section;
}

function getOptionIcon(answerType, index) {
  const icons = {
    tea_tep_ted: ['award', 'clock', 'alert-triangle'],
    frequency_4: ['circle', 'circle-dot', 'check-circle-2', 'check-check'],
    achievement_3: ['circle', 'clock', 'check-circle']
  };
  const list = icons[answerType];
  if (!list) return null;
  return list[index] || null;
}

function cleanLabel(label) {
  if (!label) return { prefix: '', text: '' };
  const idx = label.indexOf(' - ');
  if (idx >= 0) {
    return {
      prefix: label.substring(0, idx).trim(),
      text: label.substring(idx + 3).trim()
    };
  }
  return { prefix: '', text: label };
}
