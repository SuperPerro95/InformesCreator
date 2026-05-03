import { apiGet, apiPost } from './api.js';
import { $, show, hide, showToast, setLoading, renderMarkdownToHtml, showRetryableError } from './utils.js';
import { getSelectedCourse, getAllStudents, getCurrentStudentIndex, getSessionReports, setSessionReports, getSelectedVariant, getSelectedModel, getCourseSessions, setCourseSessions } from './state.js';

export async function doGenerateReport() {
  const allStudents = getAllStudents();
  const currentStudentIndex = getCurrentStudentIndex();
  const selectedCourse = getSelectedCourse();
  const selectedVariant = getSelectedVariant();
  const selectedModel = getSelectedModel();
  const student = allStudents[currentStudentIndex];
  if (!student || !selectedCourse || !selectedVariant) {
    showToast('Faltan datos para generar el informe.', 'warning');
    return;
  }
  if (!selectedModel) {
    showToast('Selecciona un modelo para generar el informe.', 'warning');
    return;
  }
  const { collectAnswers } = await import('./wizard.js');
  const answers = collectAnswers();
  const model = selectedModel;
  const contents = $('course-contents') ? $('course-contents').value : '';
  setLoading(true, 'Enviando respuestas al modelo de IA...');
  try {
    const data = await apiPost('/reports/generate', {
      course: selectedCourse,
      filename: student.filename || `${student.nombre_completo.replace(/\s+/g, '_')}.md`,
      contents,
      answers,
      variant_id: selectedVariant,
      model
    });
    const sessionReports = getSessionReports();
    const existingIndex = sessionReports.findIndex(r => r.studentIndex === currentStudentIndex);
    const { getQuestionnaireAnswers } = await import('./state.js');
    const reportData = {
      studentIndex: currentStudentIndex,
      nombre_completo: student.nombre_completo,
      filename: student.filename || `${student.nombre_completo.replace(/\s+/g, '_')}.md`,
      report_content: data.report_content,
      saved_path: data.saved_path,
      completed: true,
      answers: { ...getQuestionnaireAnswers() },
      variant: selectedVariant
    };
    if (existingIndex >= 0) {
      sessionReports[existingIndex] = reportData;
    } else {
      sessionReports.push(reportData);
    }
    setSessionReports(sessionReports);
    const refreshedSession = await apiGet(`/courses/${encodeURIComponent(selectedCourse)}/session`);
    const sessions = getCourseSessions();
    sessions[selectedCourse] = refreshedSession;
    setCourseSessions(sessions);
    $('report-preview').innerHTML = renderMarkdownToHtml(data.report_content);
    import('./state.js').then(mod => mod.setLastReportDownloaded(false));
    show($('report-actions'));
    const preview = $('report-preview');
    if (preview) { preview.setAttribute('tabindex', '-1'); preview.focus(); }
    const btnNext = $('btn-next-student');
    if (currentStudentIndex < allStudents.length - 1) {
      btnNext.textContent = `Siguiente alumno (${currentStudentIndex + 2}/${allStudents.length})`;
      btnNext.disabled = false;
      show(btnNext);
    } else {
      hide(btnNext);
    }
    setLoading(false);
  } catch (err) {
    setLoading(false);
    showRetryableError('No se pudo generar el informe.', err, doGenerateReport);
  }
}

function sliderLabel(value, labels) {
  if (value <= 25) return labels[0];
  if (value <= 50) return labels[1];
  if (value <= 75) return labels[2];
  return labels[3];
}

function updateCustomizationText() {
  const textarea = $('customization-text');
  if (textarea.dataset.manual === 'true') return;
  const formality = parseInt($('slider-formality').value);
  const empathy = parseInt($('slider-empathy').value);
  const detail = parseInt($('slider-detail').value);
  const naturalness = parseInt($('slider-naturalness').value);
  const parts = [];
  parts.push(sliderLabel(formality, [
    'tono muy casual y cercano',
    'tono moderadamente informal',
    'tono profesional y neutro',
    'tono muy formal y académico'
  ]));
  parts.push(sliderLabel(empathy, [
    'enfoque objetivo y descriptivo',
    'algo objetivo, con ligero acompañamiento',
    'empatía moderada, reconociendo esfuerzos',
    'muy empático, destacando logros y apoyando dificultades'
  ]));
  parts.push(sliderLabel(detail, [
    'extremadamente conciso, solo lo esencial',
    'breve, con puntos clave',
    'desarrollado, con ejemplos moderados',
    'muy detallado, con análisis profundo'
  ]));
  parts.push(sliderLabel(naturalness, [
    'estructurado, formato clásico de informe',
    'algo estructurado con flexibilidad',
    'natural, como nota de seguimiento',
    'muy conversacional, como charla con colega'
  ]));
  textarea.value = parts.join('. ') + '.';
}

export async function doRegenerateWithCustomization() {
  const allStudents = getAllStudents();
  const currentStudentIndex = getCurrentStudentIndex();
  const selectedCourse = getSelectedCourse();
  const student = allStudents[currentStudentIndex];
  if (!student || !selectedCourse) {
    showToast('Faltan datos para generar el informe.', 'warning');
    return;
  }
  const selectedVariant = getSelectedVariant() || 'A';
  const { collectAnswers } = await import('./wizard.js');
  const answers = collectAnswers();
  const model = getSelectedModel();
  const contents = $('course-contents') ? $('course-contents').value : '';
  const customization = $('customization-text').value.trim() || null;
  setLoading(true, 'Enviando respuestas al modelo de IA...');
  try {
    const data = await apiPost('/reports/generate', {
      course: selectedCourse,
      filename: student.filename || `${student.nombre_completo.replace(/\s+/g, '_')}.md`,
      contents,
      answers,
      variant_id: selectedVariant,
      model,
      customization
    });
    const sessionReports = getSessionReports();
    const existingIndex = sessionReports.findIndex(r => r.studentIndex === currentStudentIndex);
    const { getQuestionnaireAnswers } = await import('./state.js');
    const reportData = {
      studentIndex: currentStudentIndex,
      nombre_completo: student.nombre_completo,
      filename: student.filename || `${student.nombre_completo.replace(/\s+/g, '_')}.md`,
      report_content: data.report_content,
      saved_path: data.saved_path,
      completed: true,
      answers: { ...getQuestionnaireAnswers() },
      variant: selectedVariant
    };
    if (existingIndex >= 0) {
      sessionReports[existingIndex] = reportData;
    } else {
      sessionReports.push(reportData);
    }
    setSessionReports(sessionReports);
    const refreshedSession = await apiGet(`/courses/${encodeURIComponent(selectedCourse)}/session`);
    const sessions = getCourseSessions();
    sessions[selectedCourse] = refreshedSession;
    setCourseSessions(sessions);
    $('report-preview').innerHTML = renderMarkdownToHtml(data.report_content);
    import('./state.js').then(mod => mod.setLastReportDownloaded(false));
    show($('report-actions'));
    const preview = $('report-preview');
    if (preview) { preview.setAttribute('tabindex', '-1'); preview.focus(); }
    setLoading(false);
  } catch (err) {
    setLoading(false);
    showRetryableError('No se pudo regenerar el informe.', err, doRegenerateWithCustomization);
  }
}

export function downloadReport() {
  downloadReportForIndex(getCurrentStudentIndex());
}

export function downloadReportForIndex(studentIndex) {
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

export function downloadAllReports() {
  const sessionReports = getSessionReports();
  const selectedCourse = getSelectedCourse();
  if (sessionReports.length === 0) {
    showToast('No hay informes generados en esta sesion. Genera al menos un informe primero.', 'warning');
    return;
  }
  const header = `# Informes de Avance - ${selectedCourse}\n\n_Generado automaticamente por InformesCreator_\n\n`;
  const body = sessionReports
    .sort((a, b) => a.studentIndex - b.studentIndex)
    .map(r => r.report_content)
    .join('\n\n---\n\n');
  const fullContent = header + body;
  const blob = new Blob([fullContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeCourse = selectedCourse.replace(/[^a-zA-Z0-9]/g, '_');
  a.href = url;
  a.download = `Informes_${safeCourse}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function goToNextStudent() {
  const sessionReports = getSessionReports();
  const currentStudentIndex = getCurrentStudentIndex();
  const allStudents = getAllStudents();
  const lastReportDownloaded = await import('./state.js').then(mod => mod.getLastReportDownloaded());
  if (!lastReportDownloaded && sessionReports.some(r => r.studentIndex === currentStudentIndex)) {
    const { showConfirm } = await import('./utils.js');
    const ok = await showConfirm('No descargaste este informe. ¿Pasar al siguiente alumno igual?');
    if (!ok) return;
  }
  if (currentStudentIndex < allStudents.length - 1) {
    import('./state.js').then(mod => {
      mod.setCurrentStudentIndex(currentStudentIndex + 1);
    });
    $('report-preview').innerHTML = '<p>Generando informe...</p>';
    hide($('report-actions'));
    const { goToWizardStep } = await import('./wizard.js');
    goToWizardStep(1);
    import('./wizard.js').then(mod => mod.setupQuestionnaireForCurrentStudent());
    setTimeout(function() {
      const firstFocusable = document.querySelector('#step-1 button, #step-1 input, #step-1 select, #step-1 textarea');
      if (firstFocusable) firstFocusable.focus();
    }, 100);
  }
}
