import { apiGet, apiPut, apiPost } from './api.js';
import { $, show, hide, showToast, setLoading, escapeHtml } from './utils.js';
import { getEditingQuestionnaireId, setEditingQuestionnaireId } from './state.js';
import { navigateTo } from './auth.js';
import { renderSidebarCourses } from './sidebar.js';

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

export { ALL_QUESTIONS };

export function showQuestionnairesScreen() {
  import('./utils.js').then(mod => mod.hideMainContentScreens());
  show(document.getElementById('layout-body'));
  hide($('course-view'));
  hide($('wizard'));
  show($('questionnaires-screen'));
  loadQuestionnairesList();
}

export async function loadQuestionnairesList() {
  setLoading(true);
  try {
    const data = await apiGet('/questionnaires');
    const container = $('questionnaires-list');
    if (!data || data.length === 0) {
      container.innerHTML = '<p class="hint">No hay cuestionarios personalizados.</p>';
      setLoading(false);
      return;
    }
    container.innerHTML = data.map(q => `
    <div class="questionnaire-card" data-id="${q.id}">
    <div class="questionnaire-card-header">
    <h4>${escapeHtml(q.name)}</h4>
    <span class="badge badge-subtle">${q.question_count || 0} preguntas</span>
    </div>
    <p class="hint">${escapeHtml(q.description || '')}</p>
    <div class="questionnaire-card-actions">
    <button class="btn-ghost btn-sm qe-action-edit" data-id="${q.id}">Editar</button>
    <button class="btn-ghost btn-sm qe-action-duplicate" data-id="${q.id}">Duplicar</button>
    <button class="btn-ghost btn-sm qe-action-versions" data-id="${q.id}">Versiones</button>
    <button class="btn-danger btn-sm qe-action-delete" data-id="${q.id}">Eliminar</button>
    </div>
    </div>
    `).join('');
    container.querySelectorAll('.qe-action-edit').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(`#/questionnaires/edit/${btn.dataset.id}`));
    });
    container.querySelectorAll('.qe-action-duplicate').forEach(btn => {
      btn.addEventListener('click', () => duplicateQuestionnaire(btn.dataset.id));
    });
    container.querySelectorAll('.qe-action-versions').forEach(btn => {
      btn.addEventListener('click', () => openQuestionnaireEditor(btn.dataset.id, true));
    });
    container.querySelectorAll('.qe-action-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteQuestionnaire(btn.dataset.id));
    });
  } catch (err) {
    console.error('Error cargando cuestionarios:', err);
  } finally {
    setLoading(false);
  }
}

export function questionsToMarkdown(questions) {
  return questions.map(q => {
    const lines = [];
    lines.push(`# ${q.title || ''}`);
    lines.push(`> section: ${q.section || 'pedagogical'}`);
    lines.push(`> type: ${q.answer_type || 'frequency_4'}`);
    if (q.text && q.text !== q.title) lines.push(q.text);
    if (q.labels) {
      q.labels.forEach(l => lines.push(`- ${l}`));
    }
    return lines.join('\n');
  }).join('\n\n');
}

export function parseMarkdownQuestions(text) {
  const questions = [];
  const blocks = text.split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) continue;
    const q = { title: '', section: 'pedagogical', text: '', answer_type: 'frequency_4', options: [], labels: [] };
    let i = 0;
    if (lines[i].startsWith('# ')) {
      q.title = lines[i].substring(2).trim();
      i++;
    }
    while (i < lines.length && lines[i].startsWith('> ')) {
      const meta = lines[i].substring(2).trim();
      if (meta.startsWith('section:')) q.section = meta.substring(8).trim();
      else if (meta.startsWith('type:')) q.answer_type = meta.substring(5).trim();
      i++;
    }
    const bodyLines = [];
    while (i < lines.length && !lines[i].startsWith('- ')) {
      bodyLines.push(lines[i]);
      i++;
    }
    q.text = bodyLines.join(' ').trim() || q.title;
    while (i < lines.length && lines[i].startsWith('- ')) {
      q.labels.push(lines[i].substring(2).trim());
      i++;
    }
    if (q.answer_type === 'tea_tep_ted') {
      q.options = ['TEA', 'TEP', 'TED'];
      if (!q.labels.length) q.labels = ['TEA - Trayectoria Educativa Alcanzada', 'TEP - Trayectoria Educativa en Proceso', 'TED - Trayectoria Educativa Discontinua'];
    } else if (q.answer_type === 'frequency_4') {
      q.options = [1, 2, 3, 4];
      if (!q.labels.length) q.labels = ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'];
    } else if (q.answer_type === 'achievement_3') {
      q.options = [1, 2, 3];
      if (!q.labels.length) q.labels = ['1 - No Logrado', '2 - En Proceso', '3 - Logrado'];
    } else if (q.answer_type === 'free_text') {
      q.options = null;
      q.labels = null;
    }
    questions.push(q);
  }
  return questions;
}

export function renderMarkdownPreview(questions) {
  const container = $('qe-preview');
  if (!questions.length) {
    container.innerHTML = '<p class="hint">Sin preguntas. Escribe markdown valido.</p>';
    return;
  }
  container.innerHTML = questions.map((q, i) => `
  <div class="qe-preview-item">
  <div class="qe-preview-title">${i + 1}. ${escapeHtml(q.title || '(sin titulo)')}</div>
  <div class="qe-preview-meta">${q.section} | ${q.answer_type}</div>
  <div class="qe-preview-text">${escapeHtml(q.text || '')}</div>
  ${q.labels ? `<ul class="qe-preview-options">${q.labels.map(l => `<li>${escapeHtml(l)}</li>`).join('')}</ul>` : '<span class="qe-preview-meta">Texto libre</span>'}
  </div>
  `).join('');
}

export async function openQuestionnaireEditor(id) {
  setEditingQuestionnaireId(id);
  $('editor-title').textContent = id ? 'Editar cuestionario' : 'Nuevo cuestionario';
  $('qe-name').value = '';
  $('qe-textarea').value = '';
  if (id) {
    setLoading(true);
    try {
      const data = await apiGet(`/questionnaires/${id}`);
      $('qe-name').value = data.name || '';
      const questions = data.questions || [];
      $('qe-textarea').value = questionsToMarkdown(questions);
      renderMarkdownPreview(parseMarkdownQuestions($('qe-textarea').value));
    } catch (err) {
      console.error('Error cargando cuestionario:', err);
    } finally {
      setLoading(false);
    }
  } else {
    $('qe-textarea').value = questionsToMarkdown(ALL_QUESTIONS);
    renderMarkdownPreview(parseMarkdownQuestions($('qe-textarea').value));
  }
  hide($('questionnaires-screen'));
  show($('questionnaire-editor'));
}

export function closeQuestionnaireEditor() {
  setEditingQuestionnaireId(null);
  navigateTo('#/questionnaires');
}

export async function saveQuestionnaireEditor() {
  const name = $('qe-name').value.trim();
  if (!name) {
    showToast('Ingresa un nombre para el cuestionario.', 'warning');
    return;
  }
  const questions = parseMarkdownQuestions($('qe-textarea').value);
  if (questions.length === 0) {
    showToast('No se encontraron preguntas en el texto. Revisa el formato markdown.', 'warning');
    return;
  }
  const payload = {
    name,
    description: '',
    questions: questions.map(q => ({
      ...q,
      options: q.options ?? [],
      labels: q.labels ?? []
    }))
  };
  setLoading(true);
  try {
    const editingId = getEditingQuestionnaireId();
    if (editingId) {
      await apiPut(`/questionnaires/${editingId}`, payload);
    } else {
      await apiPost('/questionnaires', payload);
    }
    closeQuestionnaireEditor();
  } catch (err) {
    showToast('No se pudo guardar el cuestionario. Intenta de nuevo.', 'error');
  } finally {
    setLoading(false);
  }
}

export async function duplicateQuestionnaire(id) {
  setLoading(true);
  try {
    const data = await apiGet(`/questionnaires/${id}`);
    const newName = data.name + ' (copia)';
    await apiPost(`/questionnaires/${id}/duplicate`, { new_name: newName });
    loadQuestionnairesList();
  } catch (err) {
    showToast('No se pudo duplicar el cuestionario. Intenta de nuevo.', 'error');
  } finally {
    setLoading(false);
  }
}

export async function deleteQuestionnaire(id) {
  const { showConfirm } = await import('./utils.js');
  const ok = await showConfirm('Eliminar este cuestionario? No se puede recuperar.');
  if (!ok) return;
  setLoading(true);
  try {
    await fetch(`/api/questionnaires/${id}`, { method: 'DELETE' });
    loadQuestionnairesList();
  } catch (err) {
    showToast('No se pudo eliminar el cuestionario. Intenta de nuevo.', 'error');
  } finally {
    setLoading(false);
  }
}
