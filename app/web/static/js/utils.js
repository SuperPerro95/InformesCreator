export const ICON_SVGS = {
  'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'circle': '<circle cx="12" cy="12" r="10"/>',
  'circle-dot': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'minus': '<path d="M5 12h14"/>',
  'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'check': '<path d="M20 6 9 17l-5-5"/>',
  'check-circle-2': '<circle cx="12" cy="12" r="10"/><path d="M8 12.5 11 15.5 16 9"/>',
  'check-check': '<path d="M18 6 7 17l-5-5"/><path d="m22 10-5 5-3-3"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'award': '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  'cloud': '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  'monitor': '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
};

export function icon(name, size = 16) {
  const body = ICON_SVGS[name];
  if (!body) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

export function $(id) { return document.getElementById(id); }

export function show(el) { el.classList.remove('hidden'); }
export function hide(el) { el.classList.add('hidden'); }

export function refreshIcons(container) {
  if (!window.lucide || !container) return;
  const icons = container.querySelectorAll('[data-lucide]');
  if (icons.length) window.lucide.createIcons(icons);
}

export function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

const TOAST_ICONS = {
  success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  warning: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
};

function dismissToast(toast) {
  if (toast._dismissed) return;
  toast._dismissed = true;
  clearTimeout(toast._timer);
  toast.classList.add('toast-removing');
  toast.addEventListener('animationend', () => toast.remove());
}

export function showToast(msg, kind) {
  kind = kind || 'info';
  const container = $('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + kind;
  toast.innerHTML = TOAST_ICONS[kind] + '<span class="toast-msg">' + escapeHtml(msg) + '</span><button class="toast-dismiss" aria-label="Cerrar">&times;</button>';
  toast.querySelector('.toast-dismiss').addEventListener('click', () => dismissToast(toast));
  container.appendChild(toast);
  const timer = setTimeout(() => dismissToast(toast), kind === 'error' ? 7000 : 4500);
  toast._timer = timer;
}

export function showRetryableError(msg, err, retryFn) {
  const container = $('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast toast-error';
  toast.innerHTML =
    TOAST_ICONS.error +
    '<span class="toast-msg">' + escapeHtml(msg) + ' <button class="toast-retry">Reintentar</button></span>' +
    '<button class="toast-dismiss" aria-label="Cerrar">&times;</button>';
  toast.querySelector('.toast-retry').addEventListener('click', () => {
    dismissToast(toast);
    retryFn();
  });
  toast.querySelector('.toast-dismiss').addEventListener('click', () => dismissToast(toast));
  container.appendChild(toast);
  const retryBtn = toast.querySelector('.toast-retry');
  if (retryBtn) retryBtn.focus();
  const timer = setTimeout(() => dismissToast(toast), 12000);
  toast._timer = timer;
}

export function showConfirm(message) {
  return new Promise((resolve) => {
    $('confirm-message').textContent = message;
    show($('confirm-overlay'));
    $('confirm-ok').focus();
    function cleanup() {
      hide($('confirm-overlay'));
      $('confirm-ok').removeEventListener('click', onOk);
      $('confirm-cancel').removeEventListener('click', onCancel);
      document.removeEventListener('keydown', onKey);
    }
    function onOk() { cleanup(); resolve(true); }
    function onCancel() { cleanup(); resolve(false); }
    function onKey(e) {
      if (e.key === 'Escape') { cleanup(); resolve(false); }
      if (e.key === 'Enter' && document.activeElement === $('confirm-ok')) { cleanup(); resolve(true); }
    }
    $('confirm-ok').addEventListener('click', onOk);
    $('confirm-cancel').addEventListener('click', onCancel);
    document.addEventListener('keydown', onKey);
  });
}

export function setLoading(isLoading, message) {
  const loader = $('loading');
  const wizard = $('wizard');
  if (isLoading) {
    show(loader);
    if (message) loader.querySelector('p').textContent = message;
    if (wizard) wizard.setAttribute('aria-busy', 'true');
  } else {
    hide(loader);
    if (wizard) wizard.removeAttribute('aria-busy');
    loader.querySelector('p').textContent = 'Procesando...';
  }
}

export function announceStep(step) {
  const labels = { 1: 'Paso 1: Cuestionario y observaciones', 2: 'Paso 2: Configuracion del informe', 3: 'Paso 3: Informe generado' };
  const el = $('step-announcement');
  if (el) el.textContent = labels[step] || '';
}

export function toggleUserDropdown() {
  const dd = $('user-dropdown');
  if (dd.classList.contains('hidden')) {
    show(dd);
    document.addEventListener('click', closeUserDropdownOutside);
  } else {
    hide(dd);
    document.removeEventListener('click', closeUserDropdownOutside);
  }
}

export function closeUserDropdownOutside(e) {
  const menu = $('header-user-menu');
  if (menu && !menu.contains(e.target)) {
    hide($('user-dropdown'));
    document.removeEventListener('click', closeUserDropdownOutside);
  }
}

export function closeUserDropdownOnItemClick() {
  hide($('user-dropdown'));
  document.removeEventListener('click', closeUserDropdownOutside);
}

export const HELP_CONTENT = {
  onboarding: `
<h4>Configuración inicial</h4>
<p><strong>Ollama</strong> es el motor de IA que genera los informes. Debe estar instalado y corriendo en tu computadora.</p>
<p>Para la carpeta de archivos, seleccioná la ruta donde tenés la carpeta <strong>CURSOS</strong> con tus alumnos. Si no la tenés, podés crear un curso nuevo.</p>
`,
  courses: `
<h4>Seleccionar un curso</h4>
<p>Hacé clic en <strong>Entrar</strong> sobre el curso que querés trabajar.</p>
<p>También podés crear un curso nuevo con el botón <strong>Crear nuevo curso</strong>. Solo necesitás el nombre y la lista de alumnos.</p>
`,
  dashboard: `
<h4>Dashboard del curso</h4>
<p>Cada alumno muestra su estado:</p>
<ul>
<li><strong>Sin empezar</strong> → todavía no se completó el cuestionario.</li>
<li><strong>Cuestionario guardado</strong> → se guardó progreso, pero no se generó el informe.</li>
<li><strong>Informe listo</strong> → el informe ya fue generado y descargado.</li>
</ul>
<p>Usá <strong>Descargar informe completo del curso</strong> para bajar todos los informes en un solo archivo.</p>
`,
  wizard_obs: `
<h4>Observaciones del alumno</h4>
<p>Registrá las observaciones de clase. Cada observación indica que el alumno estuvo presente ese día.</p>
<p><strong>Carga rápida:</strong> escribí <code>dd/mm - Comentario</code> en el cuadro de texto y apretá <strong>Agregar</strong>.</p>
<p>Completá <strong>Total de clases</strong> e <strong>Inasistencias</strong> para que el informe incluya el porcentaje de asistencia.</p>
`,
  wizard_q: `
<h4>Cuestionario</h4>
<p>Respondé las preguntas sobre el desempeño del alumno. Podés usar <strong>Omitir pregunta</strong> si no aplica.</p>
<p>Los códigos de valoración:</p>
<ul>
<li><strong>TEA</strong> → Trabajo en altura (excelente).</li>
<li><strong>TEP</strong> → Trabajo en proceso (normal).</li>
<li><strong>TED</strong> → Trabajo en desarrollo (necesita apoyo).</li>
</ul>
<p>Podés guardar y salir en cualquier momento con <strong>Guardar y salir</strong>.</p>
`,
  wizard_cfg: `
<h4>Configuración del informe</h4>
<p><strong>Modelo de IA:</strong> elegí el modelo con el que querés generar. Los modelos locales (como llama3.1) son más rápidos y privados.</p>
<p><strong>Variante:</strong> determina el estilo del informe:</p>
<ul>
<li><strong>A (Formal)</strong> → Media carilla, tono objetivo. Ideal para informes trimestrales.</li>
<li><strong>B (Detallado)</strong> → Una carilla, más desarrollado. Para informes anuales o completos.</li>
<li><strong>C (Breve)</strong> → Un párrafo, solo lo esencial. Para entregas rápidas.</li>
</ul>
`,
  wizard_report: `
<h4>Informe generado</h4>
<p>Revisá el informe en el cuadro de texto. Si está bien, descargalo con <strong>Descargar este informe</strong>.</p>
<p>Para pasar al siguiente alumno, usá <strong>Siguiente alumno</strong>.</p>
<p>Si querés volver al listado del curso, usá <strong>Volver al curso</strong>.</p>
`
};

const HELP_MODAL_TEMPLATE = `
  <div id="help-modal" class="help-modal">
    <div class="help-overlay"></div>
    <div class="help-panel">
      <div class="help-header">
        <h3>Ayuda</h3>
        <button id="btn-close-help" class="btn-ghost btn-sm">
          <i data-lucide="x" style="width:18px;height:18px;"></i>
        </button>
      </div>
      <div id="help-content"></div>
    </div>
  </div>
`;

export function showHelp(screen) {
  import('./state.js').then(mod => mod.setCurrentHelpScreen(screen));
  let modal = $('help-modal');
  if (!modal) {
    const root = $('help-root');
    if (!root) return;
    root.innerHTML = HELP_MODAL_TEMPLATE;
    modal = $('help-modal');
    $('btn-close-help').addEventListener('click', hideHelp);
    modal.addEventListener('click', function onBackdrop(e) {
      if (e.target === modal || e.target.classList.contains('help-overlay')) {
        hideHelp();
      }
    });
    if (window.lucide) lucide.createIcons({ nodes: [modal] });
  }
  const content = HELP_CONTENT[screen] || '<p>No hay ayuda disponible para esta pantalla.</p>';
  $('help-content').innerHTML = content;
  show(modal);
}

export function hideHelp() {
  const modal = $('help-modal');
  if (modal) hide(modal);
}

export function updateHelpButton(screen) {
}

export function hideMainContentScreens() {
  hide($('courses-grid'));
}

export function simpleMarkdownToHtml(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$1</ul>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

export function renderMarkdownToHtml(md) {
  let out = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  return '<p>' + out + '</p>';
}

export function showFieldError(id, msg) {
  const el = $(id);
  if (el) {
    el.textContent = msg;
    let input = el.previousElementSibling;
    if (!input || !input.tagName) input = el.parentElement && el.parentElement.querySelector('input');
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', id);
    }
  }
}

export function clearFieldErrors(ids) {
  for (let i = 0; i < ids.length; i++) {
    const el = $(ids[i]);
    if (el) {
      el.textContent = '';
      let input = el.previousElementSibling;
      if (!input || !input.tagName) input = el.parentElement && el.parentElement.querySelector('input');
      if (input) {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
      }
    }
  }
}
