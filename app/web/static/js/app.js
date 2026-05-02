(function initParticles() {
const canvas = document.getElementById('bg-particles');
if (!canvas) return;
const ctx = canvas.getContext('2d');
let particles = [];
let animationId;
function resize() {
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
}
function drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
let rot = Math.PI / 2 * 3;
let x = cx;
let y = cy;
let step = Math.PI / spikes;
ctx.beginPath();
ctx.moveTo(cx, cy - outerRadius);
for (let i = 0; i < spikes; i++) {
x = cx + Math.cos(rot) * outerRadius;
y = cy + Math.sin(rot) * outerRadius;
ctx.lineTo(x, y);
rot += step;
x = cx + Math.cos(rot) * innerRadius;
y = cy + Math.sin(rot) * innerRadius;
ctx.lineTo(x, y);
rot += step;
}
ctx.lineTo(cx, cy - outerRadius);
ctx.closePath();
ctx.fillStyle = color;
ctx.fill();
}
function drawCheckmark(cx, cy, size, color) {
ctx.beginPath();
ctx.strokeStyle = color;
ctx.lineWidth = 2.5;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.moveTo(cx - size * 0.3, cy);
ctx.lineTo(cx - size * 0.05, cy + size * 0.25);
ctx.lineTo(cx + size * 0.35, cy - size * 0.25);
ctx.stroke();
}
function drawDiamond(cx, cy, size, color) {
ctx.beginPath();
ctx.moveTo(cx, cy - size);
ctx.lineTo(cx + size * 0.7, cy);
ctx.lineTo(cx, cy + size);
ctx.lineTo(cx - size * 0.7, cy);
ctx.closePath();
ctx.fillStyle = color;
ctx.fill();
}
function drawBook(cx, cy, size, color) {
const w = size * 1.2;
const h = size * 0.9;
ctx.beginPath();
ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 3);
ctx.fillStyle = color;
ctx.fill();
ctx.beginPath();
ctx.moveTo(cx, cy - h / 2);
ctx.lineTo(cx, cy + h / 2);
ctx.strokeStyle = 'rgba(255,255,255,0.4)';
ctx.lineWidth = 1.5;
ctx.stroke();
}
function drawNumber(cx, cy, size, color) {
const num = Math.floor(Math.random() * 3) + 1;
ctx.font = `700 ${size * 2.5}px var(--font-body), sans-serif`;
ctx.fillStyle = color;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText(String(num), cx, cy);
}
function drawPencil(cx, cy, size, color) {
const w = size * 0.5;
const h = size * 1.4;
ctx.beginPath();
ctx.roundRect(cx - w / 2, cy - h / 2, w, h * 0.75, 2);
ctx.fillStyle = color;
ctx.fill();
ctx.beginPath();
ctx.moveTo(cx - w / 2, cy + h * 0.25);
ctx.lineTo(cx + w / 2, cy + h * 0.25);
ctx.lineTo(cx, cy + h / 2 + size * 0.15);
ctx.closePath();
ctx.fillStyle = color;
ctx.fill();
ctx.beginPath();
ctx.roundRect(cx - w / 2, cy - h / 2 - size * 0.15, w, size * 0.2, 2);
ctx.fillStyle = color;
ctx.globalAlpha = 0.6;
ctx.fill();
ctx.globalAlpha = 1;
}
function drawPaper(cx, cy, size, color) {
const w = size * 1.1;
const h = size * 1.3;
ctx.beginPath();
ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 2);
ctx.fillStyle = color;
ctx.fill();
ctx.strokeStyle = 'rgba(255,255,255,0.3)';
ctx.lineWidth = 1;
for (let i = 1; i <= 3; i++) {
const ly = cy - h * 0.25 + (i * h * 0.18);
ctx.beginPath();
ctx.moveTo(cx - w * 0.3, ly);
ctx.lineTo(cx + w * 0.3, ly);
ctx.stroke();
}
}
function drawGraduationCap(cx, cy, size, color) {
const s = size * 0.8;
ctx.beginPath();
ctx.moveTo(cx - s, cy);
ctx.lineTo(cx, cy - s * 0.5);
ctx.lineTo(cx + s, cy);
ctx.lineTo(cx, cy + s * 0.5);
ctx.closePath();
ctx.fillStyle = color;
ctx.fill();
ctx.beginPath();
ctx.moveTo(cx, cy);
ctx.quadraticCurveTo(cx + s * 0.8, cy + s * 0.3, cx + s * 1.2, cy + s * 0.8);
ctx.strokeStyle = color;
ctx.lineWidth = 1.5;
ctx.stroke();
ctx.beginPath();
ctx.arc(cx + s * 1.2, cy + s * 0.8, size * 0.15, 0, Math.PI * 2);
ctx.fillStyle = color;
ctx.fill();
}
const SHAPES = ['star', 'letterA', 'check', 'book', 'diamond', 'number', 'pencil', 'paper', 'graduationCap'];
class Particle {
constructor() {
this.x = Math.random() * canvas.width;
this.y = Math.random() * canvas.height;
this.vx = (Math.random() - 0.5) * 0.25;
this.vy = (Math.random() - 0.5) * 0.25;
this.size = Math.random() * 8 + 10;
this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
this.color = Math.random() > 0.5
? `rgba(37, 99, 235, ${Math.random() * 0.12 + 0.08})`
: `rgba(5, 150, 105, ${Math.random() * 0.1 + 0.06})`;
}
update() {
this.x += this.vx;
this.y += this.vy;
if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
}
draw() {
switch (this.shape) {
case 'star':
drawStar(this.x, this.y, 5, this.size, this.size * 0.4, this.color);
break;
case 'letterA':
ctx.font = `600 ${this.size * 2.2}px var(--font-body), sans-serif`;
ctx.fillStyle = this.color;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('A', this.x, this.y);
break;
case 'check':
drawCheckmark(this.x, this.y, this.size, this.color);
break;
case 'book':
drawBook(this.x, this.y, this.size, this.color);
break;
case 'diamond':
drawDiamond(this.x, this.y, this.size, this.color);
break;
case 'number':
drawNumber(this.x, this.y, this.size, this.color);
break;
case 'pencil':
drawPencil(this.x, this.y, this.size, this.color);
break;
case 'paper':
drawPaper(this.x, this.y, this.size, this.color);
break;
case 'graduationCap':
drawGraduationCap(this.x, this.y, this.size, this.color);
break;
default:
ctx.beginPath();
ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
ctx.fillStyle = this.color;
ctx.fill();
}
}
}
function init() {
resize();
const isHeroVisible = document.getElementById('hero-screen') && !document.getElementById('hero-screen').classList.contains('hidden');
const density = isHeroVisible ? 18000 : 25000;
const count = Math.min(100, Math.floor((canvas.width * canvas.height) / density));
particles = [];
for (let i = 0; i < count; i++) {
particles.push(new Particle());
}
}
function animate() {
	var heroScreen = document.getElementById('hero-screen');
	if (heroScreen && heroScreen.classList.contains('hidden')) {
		animationId = requestAnimationFrame(animate);
		return;
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);
particles.forEach(p => {
p.update();
p.draw();
});
for (let i = 0; i < particles.length; i++) {
for (let j = i + 1; j < particles.length; j++) {
const dx = particles[i].x - particles[j].x;
const dy = particles[i].y - particles[j].y;
const dist = Math.sqrt(dx * dx + dy * dy);
if (dist < 120) {
ctx.beginPath();
ctx.strokeStyle = `rgba(37, 99, 235, ${0.05 * (1 - dist / 120)})`;
ctx.lineWidth = 0.5;
ctx.moveTo(particles[i].x, particles[i].y);
ctx.lineTo(particles[j].x, particles[j].y);
ctx.stroke();
}
}
}
animationId = requestAnimationFrame(animate);
}
window.addEventListener('resize', () => {
resize();
init();
});
init();
animate();
})();
const _ICON_SVGS = {
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
};
function icon(name, size = 16) {
const body = _ICON_SVGS[name];
if (!body) return '';
return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
function $(id) { return document.getElementById(id); }
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }
const TOAST_ICONS = {
success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
warning: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
};
function showToast(msg, kind) {
kind = kind || 'info';
const container = $('toast-container');
const toast = document.createElement('div');
toast.className = 'toast toast-' + kind;
toast.innerHTML = TOAST_ICONS[kind] + '<span class="toast-msg">' + _escapeHtml(msg) + '</span><button class="toast-dismiss" aria-label="Cerrar">&times;</button>';
toast.querySelector('.toast-dismiss').addEventListener('click', () => _dismissToast(toast));
container.appendChild(toast);
const timer = setTimeout(() => _dismissToast(toast), kind === 'error' ? 7000 : 4500);
toast._timer = timer;
}
function _dismissToast(toast) {
if (toast._dismissed) return;
toast._dismissed = true;
clearTimeout(toast._timer);
toast.classList.add('toast-removing');
toast.addEventListener('animationend', () => toast.remove());
}
function _escapeHtml(s) {
const div = document.createElement('div');
div.textContent = s;
return div.innerHTML;
}
function _refreshIcons(container) {
if (!window.lucide || !container) return;
var icons = container.querySelectorAll('[data-lucide]');
if (icons.length) window.lucide.createIcons(icons);
}
function showConfirm(message) {
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
function showRetryableError(msg, err, retryFn) {
const container = $('toast-container');
const toast = document.createElement('div');
toast.className = 'toast toast-error';
toast.innerHTML =
TOAST_ICONS.error +
'<span class="toast-msg">' + _escapeHtml(msg) + ' <button class="toast-retry">Reintentar</button></span>' +
'<button class="toast-dismiss" aria-label="Cerrar">&times;</button>';
toast.querySelector('.toast-retry').addEventListener('click', () => {
_dismissToast(toast);
retryFn();
});
toast.querySelector('.toast-dismiss').addEventListener('click', () => _dismissToast(toast));
container.appendChild(toast);
const retryBtn = toast.querySelector('.toast-retry');
if (retryBtn) retryBtn.focus();
const timer = setTimeout(() => _dismissToast(toast), 12000);
toast._timer = timer;
}
function setLoading(isLoading, message) {
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
function toggleUserDropdown() {
const dd = $('user-dropdown');
if (dd.classList.contains('hidden')) {
show(dd);
document.addEventListener('click', closeUserDropdownOutside);
} else {
hide(dd);
document.removeEventListener('click', closeUserDropdownOutside);
}
}
function closeUserDropdownOutside(e) {
const menu = $('header-user-menu');
if (menu && !menu.contains(e.target)) {
hide($('user-dropdown'));
document.removeEventListener('click', closeUserDropdownOutside);
}
}
function closeUserDropdownOnItemClick() {
hide($('user-dropdown'));
document.removeEventListener('click', closeUserDropdownOutside);
}
function _announceStep(step) {
  var labels = { 1: 'Paso 1: Cuestionario y observaciones', 2: 'Paso 2: Configuracion del informe', 3: 'Paso 3: Informe generado' };
  var el = $('step-announcement');
  if (el) el.textContent = labels[step] || '';
}
const HELP_CONTENT = {
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
let currentHelpScreen = '';
function showHelp(screen) {
currentHelpScreen = screen;
const content = HELP_CONTENT[screen] || '<p>No hay ayuda disponible para esta pantalla.</p>';
$('help-content').innerHTML = content;
show($('help-modal'));
}
function hideHelp() {
hide($('help-modal'));
}
function updateHelpButton(screen) {
}
let onboardingComplete = false;
let currentWizardStep = 1;
let selectedCourse = '';
let allStudents = [];
let currentStudentIndex = 0;
let selectedVariant = null;
let selectedModel = null;
let attendanceData = { include: false, total_classes: 0, absences: 0 };
let courseSessions = {};
let sessionReports = [];
let questionnaireAnswers = {};
let currentQuestionIndex = 0;
let currentQuestionnaire = null;
let lastReportDownloaded = false;
let currentQuestions = null;
let totalQuestions = 0;
let cachedQuestionnaires = null;
let authState = { loggedIn: false, username: '' };
let isNavigating = false;
function navigateTo(hash) {
if (isNavigating) return;
isNavigating = true;
window.location.hash = hash;
setTimeout(() => { isNavigating = false; }, 0);
}
function hideMainContentScreens() {
hide($('courses-grid'));
}
async function handleHashChange() {
const hash = window.location.hash || '#/';
if (hash === '#/login') {
show($('login-screen'));
hide($('register-screen'));
hideHero();
hide($('onboarding-overlay'));
hide(document.querySelector('header'));
hideMainContentScreens(); hide($('layout-body'));
hide($('course-view'));
hide($('wizard'));
hide($('questionnaires-screen'));
hide($('questionnaire-editor'));
updateHelpButton('');
currentHelpScreen = '';
return;
}
if (hash === '#/register') {
hide($('login-screen'));
show($('register-screen'));
hideHero();
hide($('onboarding-overlay'));
hide(document.querySelector('header'));
hideMainContentScreens(); hide($('layout-body'));
hide($('course-view'));
hide($('wizard'));
hide($('questionnaires-screen'));
hide($('questionnaire-editor'));
updateHelpButton('');
currentHelpScreen = '';
return;
}
if (hash === '' || hash === '#' || hash === '#/') {
return;
}
if (hash === '#/onboarding') {
if (!$('onboarding-overlay').classList.contains('hidden')) {
await runOnboarding();
return;
}
hideHero();
hideMainContentScreens(); hide($('layout-body'));
hide($('course-view'));
hide($('wizard'));
hide($('questionnaires-screen'));
hide($('questionnaire-editor'));
show(document.querySelector('header'));
show($('onboarding-overlay'));
updateHelpButton('onboarding');
currentHelpScreen = 'onboarding';
await runOnboarding();
return;
}
if (hash === '#/courses') {
if (!$('courses-grid').classList.contains('hidden') && $('course-view').classList.contains('hidden') && $('wizard').classList.contains('hidden') && $('questionnaires-screen').classList.contains('hidden') && $('questionnaire-editor').classList.contains('hidden')) return;
hideHero();
hide($('onboarding-overlay'));
hide($('course-view'));
hide($('wizard'));
hide($('questionnaires-screen'));
hide($('questionnaire-editor'));
show(document.querySelector('header'));
show($('layout-body')); show($('courses-grid')); renderSidebarCourses();
loadCoursesGrid();
updateHelpButton('courses');
currentHelpScreen = 'courses';
return;
}
const courseMatch = hash.match(/#\/course\/(.+)/);
if (courseMatch) {
const course = courseMatch[1].replace(/-/g, ' ');
if (selectedCourse === course && !$('course-view').classList.contains('hidden') && $('wizard').classList.contains('hidden') && $('questionnaires-screen').classList.contains('hidden') && $('questionnaire-editor').classList.contains('hidden')) {
return;
}
if (!courseSessions[course] || !allStudents.length || allStudents[0]?.curso !== course) {
initFromHashCourse(course, 'dashboard');
return;
}
hideHero();
hide($('onboarding-overlay'));
hideMainContentScreens(); show($('layout-body'));
hide($('wizard'));
hide($('questionnaires-screen'));
hide($('questionnaire-editor'));
show(document.querySelector('header'));
show($('course-view'));
selectedCourse = course;
$('course-view-title').textContent = course;
renderSidebarCourses();
await renderDashboard();
updateHelpButton('dashboard');
currentHelpScreen = 'dashboard';
return;
}
const wizardMatch = hash.match(/#\/wizard\/([^/]+)(?:\/(\w+))?/);
if (wizardMatch) {
const course = wizardMatch[1].replace(/-/g, ' ');
const substep = wizardMatch[2];
if (!courseSessions[course] || !allStudents.length || allStudents[0]?.curso !== course) {
initFromHashCourse(course, 'wizard', substep);
return;
}
if (selectedCourse !== course) {
selectedCourse = course;
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
hide($('onboarding-overlay'));
hideMainContentScreens(); show($('layout-body'));
hide($('course-view'));
hide($('wizard'));
hide($('questionnaire-editor'));
show(document.querySelector('header'));
show($('questionnaires-screen'));
loadQuestionnairesList();
updateHelpButton('');
currentHelpScreen = '';
return;
}
const qeMatch = hash.match(/#\/questionnaires\/(new|edit)\/?(.*)/);
if (qeMatch) {
const mode = qeMatch[1];
const id = mode === 'edit' ? qeMatch[2] : null;
hideHero();
hide($('onboarding-overlay'));
hideMainContentScreens(); show($('layout-body'));
hide($('course-view'));
hide($('wizard'));
hide($('questionnaires-screen'));
show(document.querySelector('header'));
show($('questionnaire-editor'));
if (mode === 'new' && !editingQuestionnaireId) {
openQuestionnaireEditor(null);
} else if (mode === 'edit' && editingQuestionnaireId !== id) {
openQuestionnaireEditor(id);
}
updateHelpButton('');
currentHelpScreen = '';
return;
}
}
async function loadQuestionnaireForCourse(course) {
try {
const data = await apiGet(`/courses/${encodeURIComponent(course)}/questionnaire`);
const qid = data.questionnaire_id;
if (qid && qid !== 'default') {
const qData = await apiGet(`/questionnaires/${qid}`);
if (qData && qData.questions && qData.questions.length > 0) {
currentQuestionnaire = qData;
currentQuestions = qData.questions;
totalQuestions = qData.questions.length;
return;
}
}
} catch (err) {
console.error('Error cargando cuestionario del curso:', err);
}
currentQuestionnaire = null;
currentQuestions = ALL_QUESTIONS;
totalQuestions = ALL_QUESTIONS.length;
}
async function loadStudentsForCourse(course) {
try {
const data = await apiGet(`/courses/${encodeURIComponent(course)}/students`);
allStudents = data.students;
currentStudentIndex = 0;
} catch (err) {
console.error('Error cargando alumnos:', err);
}
}
function showWizardFromHash(substep) {
hideHero();
hide($('onboarding-overlay'));
hideMainContentScreens(); show($('layout-body'));
hide($('course-view'));
show(document.querySelector('header'));
show($('wizard'));
const stepMap = { config: 2, report: 3 };
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
currentWizardStep = step;
const helpMap = { 1: 'wizard_obs', 2: 'wizard_cfg', 3: 'wizard_report' };
const helpScreen = helpMap[step] || 'wizard_obs';
updateHelpButton(helpScreen);
currentHelpScreen = helpScreen;
_announceStep(step);
}
async function initFromHashCourse(course, target, substep) {
setLoading(true);
try {
const session = await apiGet(`/courses/${encodeURIComponent(course)}/session`);
courseSessions[course] = session;
const data = await apiGet(`/courses/${encodeURIComponent(course)}/students`);
allStudents = data.students;
currentStudentIndex = 0;
selectedCourse = course;
await loadQuestionnaireForCourse(course);
hideHero();
hide($('onboarding-overlay'));
hideMainContentScreens(); show($('layout-body'));
hide($('wizard'));
hide($('questionnaires-screen'));
hide($('questionnaire-editor'));
show(document.querySelector('header'));
show($('course-view'));
$('course-view-title').textContent = course;
renderSidebarCourses();
await renderDashboard();
updateHelpButton('dashboard');
currentHelpScreen = 'dashboard';
} catch (err) {
console.error('Error inicializando curso desde hash:', err);
navigateTo('#/courses');
} finally {
setLoading(false);
}
}
const MODEL_INFO = {
'gemma4': { name: 'Gemma 4 (31B Cloud)', desc: 'Recomendado. Creado por Google (EE.UU.). Excelente calidad en espanol para textos educativos. Requiere conexion a internet.' },
'qwen3.5': { name: 'Qwen 3.5 (Cloud)', desc: 'Creado por Alibaba (China). Muy buen rendimiento en espanol y texto educativo. Requiere conexion a internet.' },
'nemotron-3-super': { name: 'Nemotron 3 Super (Cloud)', desc: 'Creado por NVIDIA (EE.UU.). Destaca en razonamiento complejo, matematicas y tareas avanzadas. Requiere conexion a internet.' },
'gemini-3-flash-preview': { name: 'Gemini 3 Flash Preview (Cloud)', desc: 'Creado por Google (EE.UU.). Extremadamente rapido y eficiente, con capacidades multimodales. Requiere conexion a internet.' },
'deepseek-v4-flash': { name: 'DeepSeek V4 Flash (Cloud)', desc: 'Creado por DeepSeek (China). Excelente en razonamiento profundo, matematicas y generacion de codigo. Requiere conexion a internet.' },
'gemma3': { name: 'Gemma 3 (Local)', desc: 'Creado por Google (EE.UU.). Modelo local ligero. Funciona sin internet.' },
'llama3.1': { name: 'Llama 3.1 (Local)', desc: 'Creado por Meta (EE.UU.). Buen soporte multilingue y razonamiento. Funciona sin internet.' },
};
function loadAnswersFromSaved(saved) {
if (!saved) return;
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
}
function getReportFilename(nombreCompleto) {
return 'Informe_' + nombreCompleto.replace(/, /g, '_').replace(/ /g, '_') + '.md';
}
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
currentQuestions = ALL_QUESTIONS;
totalQuestions = ALL_QUESTIONS.length;
async function apiGet(path) {
const res = await fetch(`/api${path}`);
if (!res.ok) throw new ApiError(res.status, await _tryParseError(res));
return res.json();
}
async function apiPut(path, body) {
const res = await fetch(`/api${path}`, {
method: 'PUT',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(body)
});
if (!res.ok) throw new ApiError(res.status, await _tryParseError(res));
return res.json();
}
async function apiPost(path, body) {
const res = await fetch(`/api${path}`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(body)
});
if (!res.ok) throw new ApiError(res.status, await _tryParseError(res));
return res.json();
}
class ApiError extends Error {
constructor(status, detail) {
super(detail || `Error del servidor (${status})`);
this.name = 'ApiError';
this.status = status;
this.detail = detail;
}
}
async function _tryParseError(res) {
try {
const body = await res.json();
return body.detail || body.message || null;
} catch {
return null;
}
}
let systemStatus = { ollamaRunning: false, ollamaError: null, basePath: '', folderPath: '', folderOk: false };
function showHero() {
const hero = $('hero-screen');
const bg = $('hero-bg');
hero.classList.remove('hidden');
hero.style.opacity = '1';
hero.style.pointerEvents = 'auto';
if (bg) {
bg.classList.remove('hidden');
bg.style.opacity = '1';
}
hide(document.querySelector('header'));
if (window.lucide) lucide.createIcons();
const particles = $('bg-particles');
if (particles) particles.classList.remove('hidden');
}
function hideHero() {
const hero = $('hero-screen');
const bg = $('hero-bg');
hero.style.opacity = '0';
hero.style.pointerEvents = 'none';
if (bg) {
bg.style.opacity = '0';
setTimeout(() => bg.classList.add('hidden'), 600);
}
setTimeout(() => {
hero.classList.add('hidden');
}, 600);

const particles = $('bg-particles');
if (particles) particles.classList.add('hidden');
}
async function preloadSystemStatus() {
try {
const cfg = await apiGet('/config');
systemStatus.basePath = cfg.base_path || '';
if ($('base-path')) $('base-path').value = systemStatus.basePath;
updateFolderIndicator(systemStatus.basePath);
} catch (err) {
console.error('Error loading config:', err);
}
try {
const data = await apiGet('/ollama/status');
systemStatus.ollamaRunning = data.running;
if (data.running) {
systemStatus.ollamaError = null;
} else {
systemStatus.ollamaError = data.installed ? 'Ollama detenido' : 'Ollama no instalado';
}
} catch (err) {
systemStatus.ollamaError = 'Error al verificar Ollama';
}
updateStatusDot();
if (window.lucide) lucide.createIcons();}
async function runOnboarding() {
try {
const cfg = await apiGet('/config');
$('base-path').value = cfg.base_path || '';
updateFolderIndicator(cfg.base_path);
} catch (err) {
console.error('Error loading config:', err);
}
await checkOllamaStatus();
const ollamaOk = systemStatus.ollamaRunning;
const folderOk = $('base-path').value.trim().length > 0;
$('btn-start').disabled = !(ollamaOk && folderOk);
}
async function checkOllamaStatus() {
try {
const data = await apiGet('/ollama/status');
const statusBox = $('onboarding-ollama-status');
const setupDiv = $('onboarding-ollama-setup');
if (data.running) {
systemStatus.ollamaRunning = true;
systemStatus.ollamaError = null;
statusBox.className = 'status-box ok';
statusBox.innerHTML = `<p><strong>Ollama esta activo.</strong> Modelos disponibles: ${data.models.length}</p>`;
hide(setupDiv);
} else if (data.installed) {
systemStatus.ollamaRunning = false;
systemStatus.ollamaError = 'Ollama detenido';
statusBox.className = 'status-box error';
statusBox.innerHTML = `<p><strong>Ollama esta instalado pero no esta corriendo.</strong></p>`;
show(setupDiv);
setupDiv.innerHTML = `<div class="setup-instructions"><h4>Como iniciar Ollama</h4><p>Abri una terminal y ejecuta:</p><code>ollama serve</code><p class="hint">Dejala corriendo en segundo plano.</p></div>`;
} else {
systemStatus.ollamaRunning = false;
systemStatus.ollamaError = 'Ollama no instalado';
statusBox.className = 'status-box error';
statusBox.innerHTML = `<p><strong>Ollama no esta instalado.</strong></p>`;
show(setupDiv);
setupDiv.innerHTML = `<div class="setup-instructions"><h4>Como instalar Ollama</h4><p><strong>Windows (PowerShell admin):</strong></p><code>irm https://ollama.com/install.ps1 | iex</code><p><strong>macOS / Linux:</strong></p><code>curl -fsSL https://ollama.com/install.sh | sh</code><p>Mas info en <a href="https://ollama.com" target="_blank">ollama.com</a></p></div>`;
}
} catch (err) {
systemStatus.ollamaRunning = false;
systemStatus.ollamaError = 'Error al verificar Ollama';
$('onboarding-ollama-status').innerHTML = `<p>Error al verificar Ollama: ${err.message}</p>`;
}
updateStatusDot();
if (window.lucide) lucide.createIcons();}
function updateFolderIndicator(path) {
systemStatus.folderPath = path || '';
systemStatus.folderOk = !!(path && path.trim());
updateStatusDot();
}
function updateStatusDot() {
const btn = $('btn-user-menu');
const ddDot = $('dropdown-status-dot');
const ddText = $('dropdown-status-text');
const ddAlias = $('dropdown-path-alias');
if (!btn) return;
const ollamaOk = systemStatus.ollamaRunning;
const folderOk = systemStatus.folderOk;
let statusLabel, btnClass;
if (ollamaOk && folderOk) {
btnClass = 'status-ok';
statusLabel = 'Ollama activo';
} else if (!ollamaOk && !folderOk) {
btnClass = 'status-error';
statusLabel = 'Problemas detectados';
} else if (!ollamaOk) {
btnClass = 'status-error';
statusLabel = systemStatus.ollamaError || 'Ollama desconectado';
} else {
btnClass = 'status-pending';
statusLabel = 'Carpeta no configurada';
}
btn.classList.remove('status-ok', 'status-pending', 'status-error');
btn.classList.add(btnClass);
if (ddDot) ddDot.className = `dropdown-status-dot ${btnClass.replace('status-', '')}`;
if (ddText) ddText.textContent = statusLabel;
if (ddAlias) {
if (systemStatus.folderPath) {
const alias = systemStatus.folderPath.split(/[\\\\/]/).filter(Boolean).pop() || systemStatus.folderPath;
ddAlias.textContent = alias;
ddAlias.title = systemStatus.folderPath;
} else {
ddAlias.textContent = 'Sin ruta';
ddAlias.title = '';
}
}
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
systemStatus.basePath = basePath;
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
onboardingComplete = true;
hide($('onboarding-overlay'));
show(document.querySelector('header'));
show($('layout-body')); show($('courses-grid')); renderSidebarCourses();
loadCoursesGrid();
updateHelpButton('courses');
currentHelpScreen = 'courses';
navigateTo('#/courses');
}
async function loadCoursesGrid() {
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
courses.forEach((c, i) => {
courseSessions[c.name || c] = sessions[i];
});
container.innerHTML = courses.map((c, i) => {
const session = sessions[i];
const existingReports = session.informes_existentes?.length || 0;
const completedCount = session.progreso?.completados?.length || 0;
const totalStudents = c.student_count || 0;
const progressPct = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;
const hasData = (session.respuestas && Object.keys(session.respuestas).length > 0) || existingReports > 0;
const stateClass = existingReports > 0 ? 'has-reports' : (hasData ? 'has-data' : '');
const stateBadge = existingReports > 0 ? '<div class="badge badge-success">'+existingReports+' informe(s)</div>' : (hasData ? '<div class="badge badge-warning">Tiene datos guardados</div>' : '');
return `
<div class="course-card ${stateClass}" data-course="${c.name || c}">
${stateBadge}
<div class="course-card-name">${c.name || c}</div>
<div class="course-card-progress">${c.student_count || '?'} alumno(s)${completedCount > 0 ? ' &middot; '+completedCount+' completado(s)' : ''}</div>
<div class="course-card-progress-bar">
<div class="course-card-progress-fill" style="width: ${progressPct}%"></div>
</div>
<button class="btn-primary course-card-btn" data-course="${c.name || c}">Entrar</button>
</div>
`;
}).join('');
container.querySelectorAll('.course-card').forEach(card => {
card.addEventListener('click', (e) => {
if (e.target.closest('button')) return;
const course = card.dataset.course;
navigateTo(`#/course/${course.replace(/\s+/g, '-')}`);
});
});
container.querySelectorAll('.course-card-btn').forEach(btn => {
btn.addEventListener('click', (e) => {
e.stopPropagation();
const course = e.currentTarget.dataset.course;
navigateTo(`#/course/${course.replace(/\s+/g, '-')}`);
});
});
_refreshIcons(container);} catch (err) {
showToast('No se pudieron cargar los cursos. Revisa la conexion e intenta de nuevo.', 'error');
} finally {
setLoading(false);
}
}
async function openCourse(course) {
selectedCourse = course;
setLoading(true);
try {
const session = await apiGet(`/courses/${encodeURIComponent(course)}/session`);
courseSessions[course] = session;
const data = await apiGet(`/courses/${encodeURIComponent(course)}/students`);
allStudents = data.students;
currentStudentIndex = 0;
await loadQuestionnaireForCourse(course);
loadContents(course);
hideMainContentScreens(); show($('layout-body'));
show($('course-view'));
hide($('wizard'));
$('course-view-title').textContent = course;
await renderDashboard();
updateHelpButton('dashboard');
currentHelpScreen = 'dashboard';
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
 const contentsPanel = $('sidebar-contents-panel');
 if (contentsPanel) contentsPanel.classList.add('hidden');
 show($('layout-body')); show($('courses-grid')); renderSidebarCourses();
 loadCoursesGrid();
 updateHelpButton('courses');
 currentHelpScreen = 'courses';
 navigateTo('#/courses');
 }
let _dashboardPrevCompleted = -1;
async function renderDashboard() {
 if (!cachedQuestionnaires) {
 try {
 cachedQuestionnaires = await apiGet('/questionnaires');
 } catch (err) {
 cachedQuestionnaires = [];
 }
 }
 const session = courseSessions[selectedCourse] || {};
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
 _refreshIcons(container);renderQuestionnaireSelector();
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
async function saveStudentQuestionnaire(filename, qid) {
try {
await apiPost(`/courses/${encodeURIComponent(selectedCourse)}/students/${encodeURIComponent(filename)}/questionnaire`, { questionnaire_id: qid });
courseSessions[selectedCourse].student_questionnaires = courseSessions[selectedCourse].student_questionnaires || {};
courseSessions[selectedCourse].student_questionnaires[filename] = qid;
} catch (err) {
console.error('Error guardando cuestionario del alumno:', err);
}
}
async function toggleStudentDetails(index) {
const row = document.querySelector(`.list-row[data-index="${index}"]`);
if (!row) return;
const isExpanded = row.classList.contains('expanded');
document.querySelectorAll('.list-row.expanded').forEach(r => {
if (r !== row) r.classList.remove('expanded');
});
if (!isExpanded) {
const details = row.querySelector('.student-details');
if (details && !details.hasChildNodes()) {
renderStudentDetails(index);
}
const student = allStudents[index];
if (!student) return;
const textarea = document.getElementById(`textarea-${index}`);
if (!textarea) return;
const reportFilename = getReportFilename(student.nombre_completo);
try {
const data = await apiGet(`/reports/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(reportFilename)}`);
if (data.content && !textarea.value.trim()) {
textarea.value = data.content;
}
} catch (err) {
}
}
row.classList.toggle('expanded', !isExpanded);
_refreshIcons(row.querySelector('.student-details'));
}
function renderStudentDetails(index) {
const row = document.querySelector(`.list-row[data-index="${index}"]`);
if (!row) return;
const detailsEl = row.querySelector('.student-details');
if (!detailsEl) return;
const s = allStudents[index];
if (!s) return;
const session = courseSessions[selectedCourse] || {};
const backendCompletados = new Set(session.progreso?.completados || []);
sessionReports.forEach(r => {
if (r.completed) backendCompletados.add(r.filename);
});
const isCompleted = backendCompletados.has(s.filename);
detailsEl.innerHTML = `
<div class="details-grid" onclick="event.stopPropagation()">
<div class="report-editor-container">
<div class="editor-header">
<span class="label">Informe del alumno:</span>
<span id="save-status-${index}" class="save-status"></span>
</div>
<div class="markdown-toolbar">
<button onclick="applyFormat(${index}, 'bold')" title="Negrita"><b>B</b></button>
<button onclick="applyFormat(${index}, 'italic')" title="Cursiva"><i>I</i></button>
<button onclick="applyFormat(${index}, 'list')" title="Lista">• List</button>
<div class="toolbar-divider"></div>
<button class="preview-btn" onclick="togglePreview(${index})" id="preview-btn-${index}">Vista Previa</button>
</div>
<div class="editor-wrapper">
<textarea id="textarea-${index}" class="report-textarea" placeholder="Escribe el informe aqui..."
oninput="handleAutoSave(${index})"
>${s.report || ''}</textarea>
<div id="preview-${index}" class="markdown-preview hidden"></div>
</div>
</div>
<div class="action-sidebar">
<button class="action-btn btn-wizard" onclick="triggerStudentAction(${index}, 'wizard')">
<i data-lucide="clipboard-list" style="width:14px;height:14px;"></i> Cuestionario
</button>
<button class="action-btn btn-download" onclick="triggerStudentAction(${index}, 'download')">
<i data-lucide="download" style="width:14px;height:14px;"></i> Descargar
</button>
<button class="action-btn btn-modify" onclick="triggerStudentAction(${index}, 'modify')">
<i data-lucide="sliders-horizontal" style="width:14px;height:14px;"></i> Modificar
</button>
<button class="action-btn btn-redo" onclick="triggerStudentAction(${index}, 'redo')">
<i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> Rehacer
</button>
<button class="action-btn btn-danger" onclick="triggerStudentAction(${index}, 'clear')">
<i data-lucide="trash-2" style="width:14px;height:14px;"></i> Borrar
</button>
</div>
</div>
`;
_refreshIcons(detailsEl);
}
let _saveTimeouts = {};
function handleAutoSave(index) {
const statusEl = document.getElementById(`save-status-${index}`);
const textarea = document.getElementById(`textarea-${index}`);
if (statusEl) {
statusEl.textContent = 'Escribiendo...';
statusEl.className = 'save-status';
}
clearTimeout(_saveTimeouts[index]);
_saveTimeouts[index] = setTimeout(() => {
if (statusEl) {
statusEl.textContent = 'Guardando...';
statusEl.className = 'save-status saving';
}
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
}
if (statusEl) {
statusEl.textContent = '✓ Guardado';
statusEl.className = 'save-status saved';
}
}, 1500);
}
function applyFormat(index, type) {
const textarea = document.getElementById(`textarea-${index}`);
if (!textarea) return;
const start = textarea.selectionStart;
const end = textarea.selectionEnd;
const text = textarea.value;
const selected = text.substring(start, end);
let formatted = '';
if (type === 'bold') formatted = `**${selected}**`;
else if (type === 'italic') formatted = `*${selected}*`;
else if (type === 'list') formatted = `\n- ${selected}`;
textarea.value = text.substring(0, start) + formatted + text.substring(end);
textarea.focus();
textarea.setSelectionRange(start + formatted.length, start + formatted.length);
handleAutoSave(index);
}
function togglePreview(index) {
const textarea = document.getElementById(`textarea-${index}`);
const preview = document.getElementById(`preview-${index}`);
const btn = document.getElementById(`preview-btn-${index}`);
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
function simpleMarkdownToHtml(text) {
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
async function triggerStudentAction(index, action) {
const student = allStudents[index];
currentStudentIndex = index;
if (action === 'complete') {
await startWizardForStudent(false);
return;
} else if (action === 'continue') {
await startWizardForStudent(true);
return;
} else if (action === 'quick') {
const ok = await showConfirm(`Generar informe para ${student.nombre_completo} con cuestionario predeterminado?`);
if (!ok) return;
sessionReports = sessionReports.filter(r => r.studentIndex !== index);
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
sessionReports = sessionReports.filter(r => r.studentIndex !== index);
startWizardForStudent();
} else if (action === 'modify') {
const reportFilename = getReportFilename(student.nombre_completo);
let reportContent = null;
const cachedReport = sessionReports.find(r => r.studentIndex === index);
if (cachedReport && cachedReport.report_content) {
reportContent = cachedReport.report_content;
if (cachedReport.variant) selectedVariant = cachedReport.variant;
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
} catch (err) {
showToast('No se pudo cargar el informe. Intenta de nuevo.', 'error');
return;
}
}
currentStudentIndex = index;
await loadStudentContext();
$('report-preview').innerHTML = renderMarkdownToHtml(reportContent);
show($('report-actions'));
show($('customization-panel'));
hide($('btn-next-student'));
goToWizardStep(3);
showWizard();
} else if (action === 'clear') {
const ok = await showConfirm(`Borrar todas las respuestas de ${student.nombre_completo}?`);
if (!ok) return;
try {
await apiPost(`/students/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(student.filename)}/clear`, {});
const refreshed = await apiGet(`/courses/${encodeURIComponent(selectedCourse)}/session`);
courseSessions[selectedCourse] = refreshed;
await renderDashboard();
} catch (err) {
showToast('No se pudieron borrar las respuestas. Intenta de nuevo.', 'error');
}
} else if (action === 'wizard') {
closeStudentDrawer();
await startWizardForStudent(false);
return;
}
closeStudentDrawer();
}
async function renderQuestionnaireSelector() {
const select = $('active-questionnaire');
if (!select) return;
try {
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
await loadQuestionnaireForCourse(selectedCourse);
} catch (err) {
showToast('No se pudo cambiar el cuestionario. Intenta de nuevo.', 'error');
}
};
} catch (err) {
console.error('Error cargando cuestionarios:', err);
}
}
function showWizard() {
hide($('course-view'));
show($('wizard'));
updateHelpButton('wizard_obs');
currentHelpScreen = 'wizard_obs';
navigateTo(`#/wizard/${selectedCourse.replace(/\s+/g, '-')}`);
}
function hideWizard() {
hide($('wizard'));
show($('course-view'));
renderDashboard();
updateHelpButton('dashboard');
currentHelpScreen = 'dashboard';
navigateTo(`#/course/${selectedCourse.replace(/\s+/g, '-')}`);
$('report-preview').innerHTML = '<p class="hint">Completá los pasos anteriores para generar un informe.</p>';
hide($('report-actions'));
hide($('customization-panel'));
}
function goToWizardStep(step) {
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
currentWizardStep = step;
const helpMap = { 1: 'wizard_obs', 2: 'wizard_cfg', 3: 'wizard_report' };
const helpScreen = helpMap[step] || 'wizard_obs';
updateHelpButton(helpScreen);
currentHelpScreen = helpScreen;
_announceStep(step);
const slug = selectedCourse.replace(/\s+/g, '-');
const extra = step === 2 ? '/config' : (step === 3 ? '/report' : '');
navigateTo(`#/wizard/${slug}${extra}`);
setTimeout(() => {
  const stepEl = $(`step-${step}`);
  const heading = stepEl ? stepEl.querySelector('h2, h3, h4') : null;
  if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
}, 100);
}
async function startWizardForStudent(continuar = false) {
showWizard();
questionnaireAnswers = {};
currentQuestionIndex = 0;
const student = allStudents[currentStudentIndex];
if (student) {
try {
const data = await apiGet(`/courses/${encodeURIComponent(selectedCourse)}/students/${encodeURIComponent(student.filename)}/questionnaire`);
const qid = data.questionnaire_id;
if (qid) {
const qData = await apiGet(`/questionnaires/${qid}`);
if (qData && qData.questions && qData.questions.length > 0) {
currentQuestionnaire = qData;
currentQuestions = qData.questions;
totalQuestions = qData.questions.length;
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
async function loadContents(course) {
 try {
 const data = await apiGet(`/courses/${encodeURIComponent(course)}/contents`);
 const textarea = $('sidebar-contents');
 if (textarea) {
 textarea.value = data.contents || '';
 textarea.dataset.savedValue = textarea.value;
 updateSaveContentsButton();
 }
 } catch (err) {
 console.error('Error loading contents:', err);
 }
 }
async function saveSidebarContents() {
 if (!selectedCourse) return;
 const textarea = $('sidebar-contents');
 if (!textarea) return;
 setLoading(true);
 try {
 await apiPost(`/courses/${encodeURIComponent(selectedCourse)}/contents`, {
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
 const textarea = $('sidebar-contents');
 const btn = $('btn-sidebar-save-contents');
 if (!textarea || !btn) return;
 const hasChanges = textarea.value !== (textarea.dataset.savedValue || '');
 btn.disabled = !hasChanges;
 }
async function saveContents() {
 return saveSidebarContents();
 }
function parseStudentNames(rawText) {
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
let currentObservations = [];
async function loadStudentContext() {
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
async function showObservationsPanel() {
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
_refreshIcons(container);}
function addEmptyObsRow() {
currentObservations.push({ fecha: '', codigo: '', tipo: '', comentario: '' });
renderObservationsTable();
}
function parseQuickObservations() {
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
var sumEl = $('obs-attendance-summary');
sumEl.textContent = totalObs > 0
  ? totalObs + ' observacion' + (totalObs !== 1 ? 'es' : '') + ' registrada' + (totalObs !== 1 ? 's' : '')
  : 'Sin observaciones registradas';
sumEl.classList.toggle('has-data', totalObs > 0);
}
function updateObsAttendancePercentage() {
const total = parseInt($('obs-attendance-total').value) || 0;
const absences = parseInt($('obs-attendance-absences').value) || 0;
const pct = total > 0 ? ((absences / total) * 100).toFixed(1) : 0;
$('obs-attendance-percentage').textContent = total > 0
? `Inasistencia: ${pct}% (${absences} de ${total} clases)`
: '';
}
async function saveObservationsAndContinue() {
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
attendanceData = {
include: true,
total_classes: totalClasses,
absences: absences
};
var obsPanel = $('observations-panel');
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
function skipObservationsAndContinue() {
var obsPanel = $('observations-panel');
obsPanel.classList.add('exiting');
setTimeout(function() {
  hide(obsPanel);
  obsPanel.classList.remove('exiting');
  startQuestionnaireForCurrentStudent();
}, 200);
}
function continueQuestionnaireForCurrentStudent() {
const student = allStudents[currentStudentIndex];
if (!student) return;
$('sticky-student-name').textContent = `${student.nombre_completo} — ${student.curso}`;
$('sticky-student-counter').textContent = `Alumno ${currentStudentIndex + 1} de ${allStudents.length}`;
questionnaireAnswers = {};
currentQuestionIndex = 0;
$('wizard-substep-label').textContent = 'Paso 1b: Cuestionario pedagogico';
hide($('observations-panel'));
show($('question-card'));
show(document.querySelector('.question-progress-bar'));
show($('question-counter'));
const session = courseSessions[selectedCourse];
const inProgress = session?.progreso?.inProgress?.[student.filename];
if (inProgress && inProgress.answers) {
questionnaireAnswers = { ...inProgress.answers };
currentQuestionIndex = inProgress.lastQuestionIndex || 0;
renderQuestion(currentQuestionIndex);
return;
}
const savedAnswers = session?.respuestas?.[student.filename];
if (savedAnswers) {
loadAnswersFromSaved(savedAnswers);
}
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
const student = allStudents[currentStudentIndex];
if (!student) return;
questionnaireAnswers = {};
currentQuestionIndex = 0;
$('wizard-substep-label').textContent = 'Paso 1b: Cuestionario pedagogico';
show($('question-card'));
show(document.querySelector('.question-progress-bar'));
show($('question-counter'));
const session = courseSessions[selectedCourse];
const savedAnswers = session?.respuestas?.[student.filename];
if (savedAnswers) {
const reuse = await showConfirm(`Este alumno ya tiene respuestas guardadas. Queres reutilizarlas?`);
if (reuse) {
loadAnswersFromSaved(savedAnswers);
}
}
renderQuestion(0);
}
function _getQuestionTitle(q) {
if (q.title) return q.title;
const colonIdx = q.text.indexOf(':');
if (colonIdx > 0) return q.text.substring(0, colonIdx).trim();
return q.text;
}
function _getQuestionBody(q) {
const colonIdx = q.text.indexOf(':');
if (colonIdx > 0) return q.text.substring(colonIdx + 1).trim();
return '';
}
function _getSectionDisplayName(section) {
const names = {
valoracion: 'Valoracion',
pedagogical: 'Pedagogico',
socioemotional: 'Socioemocional',
content: 'Contenidos',
observaciones: 'Observaciones'
};
return names[section] || section;
}
function _getOptionIcon(answerType, index) {
const icons = {
tea_tep_ted: ['award', 'clock', 'alert-triangle'],
frequency_4: ['circle', 'circle-dot', 'check-circle-2', 'check-check'],
achievement_3: ['circle', 'clock', 'check-circle']
};
const list = icons[answerType];
if (!list) return null;
return list[index] || null;
}
function _cleanLabel(label) {
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
function setupQuestionnaireForCurrentStudent() {
showObservationsPanel();
}
function renderQuestion(index) {
currentQuestionIndex = index;
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
$('question-section-header').textContent = _getSectionDisplayName(q.section);
const title = _getQuestionTitle(q);
const body = _getQuestionBody(q);
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
questionnaireAnswers[index] = textarea.value;
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
const iconName = _getOptionIcon(q.answer_type, i);
const { prefix, text } = _cleanLabel(q.labels[i]);

// Use prefix as badge text if it's not just a number, OR if there's no icon
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
_refreshIcons(optionsContainer);
$('prev-question-btn').disabled = index === 0;
show($('prev-question-btn'));
// Animation: trigger entering
var qCard = $('question-card');
var optionsEl = $('current-question-options');
var sectionHeader = $('question-section-header');
[qCard, optionsEl, sectionHeader].forEach(function(el) { el.classList.remove('entering'); });
requestAnimationFrame(function() {
  requestAnimationFrame(function() {
    qCard.classList.add('entering');
    optionsEl.classList.add('entering');
    sectionHeader.classList.add('entering');
  });
});
var counterEl = $('question-counter');
if (counterEl) {
  counterEl.classList.remove('entering');
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      counterEl.classList.add('entering');
    });
  });
}
}
function handleAnswer(value) {
if (handleAnswer._pending) {
clearTimeout(handleAnswer._pending);
handleAnswer._pending = null;
}
questionnaireAnswers[currentQuestionIndex] = value;
const allBtns = document.querySelectorAll('.answer-btn');
allBtns.forEach(b => {
if (b.dataset.value === value) {
  b.classList.add('selected');
} else {
  b.classList.remove('selected');
}
});
handleAnswer._pending = setTimeout(() => {
handleAnswer._pending = null;
if (currentQuestionIndex >= totalQuestions - 1) {
finishQuestionnaire();
} else {
renderQuestion(currentQuestionIndex + 1);
}
}, 150);
}
function skipQuestion() {
if (currentQuestionIndex >= totalQuestions - 1) {
finishQuestionnaire();
} else {
renderQuestion(currentQuestionIndex + 1);
}
}
function goToPreviousQuestion() {
if (currentQuestionIndex > 0) {
renderQuestion(currentQuestionIndex - 1);
}
}
async function saveQuestionnaire() {
if (!selectedCourse || !allStudents[currentStudentIndex]) return;
const filename = allStudents[currentStudentIndex].filename;
const answers = collectAnswers();
setLoading(true);
try {
const session = courseSessions[selectedCourse] || {};
session.respuestas = session.respuestas || {};
session.respuestas[filename] = answers;
session.progreso = session.progreso || { completados: [] };
session.progreso.inProgress = session.progreso.inProgress || {};
session.progreso.inProgress[filename] = {
answers: { ...questionnaireAnswers },
lastQuestionIndex: currentQuestionIndex
};
await apiPost(`/courses/${encodeURIComponent(selectedCourse)}/session`, {
respuestas: session.respuestas,
progreso: session.progreso
});
courseSessions[selectedCourse] = session;
showToast('Cuestionario guardado.', 'success');
hideWizard();
} catch (err) {
showToast('No se pudo guardar el cuestionario. Intenta de nuevo.', 'error');
} finally {
setLoading(false);
}
}
async function finishQuestionnaire() {
await saveQuestionnaireBackend();
var qCard = $('question-card');
var progBar = document.querySelector('.question-progress-bar');
var qCounter = $('question-counter');
[qCard, progBar, qCounter].forEach(function(el) { if (el) el.classList.add('exiting'); });
await new Promise(function(r) { return setTimeout(r, 200); });
hide(qCard); hide(progBar); hide(qCounter);
[qCard, progBar, qCounter].forEach(function(el) { if (el) el.classList.remove('exiting'); });
goToWizardStep(2);
await loadVariants();
}
async function saveQuestionnaireBackend() {
if (!selectedCourse || !allStudents[currentStudentIndex]) return;
const filename = allStudents[currentStudentIndex].filename;
const answers = collectAnswers();
try {
const session = courseSessions[selectedCourse] || {};
session.respuestas = session.respuestas || {};
session.respuestas[filename] = answers;
session.progreso = session.progreso || { completados: [] };
session.progreso.inProgress = session.progreso.inProgress || {};
session.progreso.inProgress[filename] = {
answers: { ...questionnaireAnswers },
lastQuestionIndex: currentQuestionIndex
};
await apiPost(`/courses/${encodeURIComponent(selectedCourse)}/session`, {
respuestas: session.respuestas,
progreso: session.progreso
});
courseSessions[selectedCourse] = session;
} catch (err) {
console.error('Error guardando cuestionario:', err);
}
}
async function skipAllAndGenerate() {
const ok = await showConfirm('Se generara el informe usando solo las observaciones del archivo. Las preguntas no respondidas se ignoraran. Continuar?');
if (!ok) return;
hide($('question-card'));
hide(document.querySelector('.question-progress-bar'));
hide($('question-counter'));
goToWizardStep(2);
await loadVariants();
}
function collectAnswers() {
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
let availableModels = [];
function normalizeModelName(name) {
return name.split(':')[0];
}
async function loadModelSelect() {
try {
var container = $('model-cards');
var extraContainer = $('model-cards-extra');
var btnMore = $('btn-show-more-models');
var descEl = $('model-description');
container.innerHTML = '<p class="hint">Cargando modelos disponibles...</p>';
hide(extraContainer);
hide(btnMore);
function selectModelCard(card) {
  var model = card.dataset.model;
  document.querySelectorAll('.selection-card').forEach(function(c) { c.classList.remove('selected'); c.setAttribute('aria-selected', 'false'); });
  card.classList.add('selected');
  card.setAttribute('aria-selected', 'true');
  selectedModel = model;
  var entry = modelEntries.find(function(e) { return e.rawName === model; });
  if (entry) {
    descEl.innerHTML = '<strong>' + entry.name + '</strong> &mdash; ' + entry.desc + (entry.desc.indexOf('Cloud') !== -1 ? ' <span style="color:var(--tertiary);font-size:0.8125rem;">(Requiere internet, puede tardar ~30 seg)</span>' : '');
  }
}
const data = await apiGet('/ollama/status');
const rawModels = data.models || [];
if (rawModels.length === 0) {
container.innerHTML = '<p class="hint">No hay modelos instalados. Abrí Ollama e instalá un modelo (ej. <code>ollama pull gemma3</code>).</p>';
hide(extraContainer);
hide(btnMore);
selectedModel = null;
descEl.innerHTML = '<span style="color: var(--danger-text);">Ningun modelo instalado.</span>';
var btn2 = $('btn-step-2');
if (btn2) btn2.disabled = true;
return;
}
let modelEntries = rawModels.map(function(rawName) {
var baseName = normalizeModelName(rawName);
var info = MODEL_INFO[baseName];
if (info) {
return { rawName: rawName, name: info.name, desc: info.desc, isRecommended: baseName === 'gemma4' };
}
return { rawName: rawName, name: rawName, desc: 'Modelo instalado en Ollama.', isRecommended: false };
});
modelEntries.sort(function(a, b) {
if (a.isRecommended && !b.isRecommended) return -1;
if (!a.isRecommended && b.isRecommended) return 1;
return 0;
});
var firstThree = modelEntries.slice(0, 3);
var rest = modelEntries.slice(3);
var hasCloud = firstThree.some(function(m) { return m.desc.indexOf('Cloud') !== -1; });
var hasLocal = firstThree.some(function(m) { return m.desc.indexOf('Local') !== -1; });
var hintHtml = (hasCloud && hasLocal)
    ? '<p class="hint" style="margin-bottom:12px;">Los modelos en la nube escriben mejor pero necesitan internet. Los locales funcionan sin conexion y son mas rapidos.</p>'
    : '';
container.innerHTML = hintHtml + firstThree.map(function(m) {
return '<div class="selection-card model-card" data-model="' + m.rawName + '" tabindex="0" role="radio" aria-selected="false" aria-label="Seleccionar modelo ' + m.name + '">' +
(m.isRecommended ? '<span class="recommended-badge">Recomendado</span>' : '') +
'<h4>' + m.name + '</h4>' +
'<p>' + m.desc + '</p>' +
'</div>';
}).join('');
if (rest.length > 0) {
extraContainer.innerHTML = rest.map(function(m) {
return '<div class="selection-card model-card" data-model="' + m.rawName + '" tabindex="0" role="radio" aria-selected="false" aria-label="Seleccionar modelo ' + m.name + '">' +
'<h4>' + m.name + '</h4>' +
'<p>' + m.desc + '</p>' +
'</div>';
}).join('');
show(btnMore);
hide(extraContainer);
} else {
hide(btnMore);
hide(extraContainer);
}
var preferred = modelEntries.find(function(m) { return m.isRecommended; }) || modelEntries[0];
if (preferred) {
var preferredCard = container.querySelector('.selection-card[data-model="' + preferred.rawName + '"]') || extraContainer.querySelector('.selection-card[data-model="' + preferred.rawName + '"]');
if (preferredCard) selectModelCard(preferredCard);
}
[container, extraContainer].forEach(function(cont) {
cont.querySelectorAll('.selection-card').forEach(function(card) {
card.addEventListener('click', function() { selectModelCard(card); });
card.addEventListener('keydown', function(e) {
if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectModelCard(card); }
});
});
});
} catch (err) {
console.error('Error loading models:', err);
var container = $('model-cards');
container.innerHTML = '<p class="hint" style="color:var(--danger-text);">Error al cargar modelos. Verificá que Ollama esté funcionando.</p>';
}
}
async function loadVariants() {
try {
await loadModelSelect();
const data = await apiGet('/variants');
const container = $('variants-list');
function selectVariantCard(card) {
  container.querySelectorAll('.selection-card').forEach(function(c) { c.classList.remove('selected'); c.setAttribute('aria-selected', 'false'); });
  card.classList.add('selected');
  card.setAttribute('aria-selected', 'true');
  selectedVariant = card.dataset.id;
}
container.innerHTML = data.map(function(v) {
return '<div class="selection-card variant-card" data-id="' + v.id + '" tabindex="0" role="radio" aria-selected="false" aria-label="Variante ' + v.name + '">' +
'<h4>' + v.id + ') ' + v.name + '</h4>' +
'<p>' + v.description + '</p>' +
'</div>';
}).join('');
container.querySelectorAll('.selection-card').forEach(function(card) {
card.addEventListener('click', function() { selectVariantCard(card); });
card.addEventListener('keydown', function(e) {
if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectVariantCard(card); }
});
});
if (data.length > 0) {
container.querySelector('.selection-card').click();
}
} catch (err) {
console.error('Error loading variants:', err);
}
}
function renderMarkdownToHtml(md) {
var out = md
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
async function doGenerateReport() {
const student = allStudents[currentStudentIndex];
if (!student || !selectedCourse || !selectedVariant) {
showToast('Faltan datos para generar el informe.', 'warning');
return;
}
if (!selectedModel) {
showToast('Selecciona un modelo para generar el informe.', 'warning');
return;
}
const answers = collectAnswers();
const model = selectedModel;
const contents = $('sidebar-contents') ? $('sidebar-contents').value : '';
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
const existingIndex = sessionReports.findIndex(r => r.studentIndex === currentStudentIndex);
const reportData = {
studentIndex: currentStudentIndex,
nombre_completo: student.nombre_completo,
filename: student.filename || `${student.nombre_completo.replace(/\s+/g, '_')}.md`,
report_content: data.report_content,
saved_path: data.saved_path,
completed: true,
answers: { ...questionnaireAnswers },
variant: selectedVariant
};
if (existingIndex >= 0) {
sessionReports[existingIndex] = reportData;
} else {
sessionReports.push(reportData);
}
const refreshedSession = await apiGet(`/courses/${encodeURIComponent(selectedCourse)}/session`);
courseSessions[selectedCourse] = refreshedSession;
$('report-preview').innerHTML = renderMarkdownToHtml(data.report_content);
lastReportDownloaded = false;
show($('report-actions'));
var preview = $('report-preview'); if (preview) { preview.setAttribute('tabindex', '-1'); preview.focus(); }
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
function _sliderLabel(value, labels) {
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
parts.push(_sliderLabel(formality, [
'tono muy casual y cercano',
'tono moderadamente informal',
'tono profesional y neutro',
'tono muy formal y académico'
]));
parts.push(_sliderLabel(empathy, [
'enfoque objetivo y descriptivo',
'algo objetivo, con ligero acompañamiento',
'empatía moderada, reconociendo esfuerzos',
'muy empático, destacando logros y apoyando dificultades'
]));
parts.push(_sliderLabel(detail, [
'extremadamente conciso, solo lo esencial',
'breve, con puntos clave',
'desarrollado, con ejemplos moderados',
'muy detallado, con análisis profundo'
]));
parts.push(_sliderLabel(naturalness, [
'estructurado, formato clásico de informe',
'algo estructurado con flexibilidad',
'natural, como nota de seguimiento',
'muy conversacional, como charla con colega'
]));
textarea.value = parts.join('. ') + '.';
}
async function doRegenerateWithCustomization() {
const student = allStudents[currentStudentIndex];
if (!student || !selectedCourse) {
showToast('Faltan datos para generar el informe.', 'warning');
return;
}
const variant = selectedVariant || 'A';
const answers = collectAnswers();
const model = selectedModel;
const contents = $('sidebar-contents') ? $('sidebar-contents').value : '';
const customization = $('customization-text').value.trim() || null;
setLoading(true, 'Enviando respuestas al modelo de IA...');
try {
const data = await apiPost('/reports/generate', {
course: selectedCourse,
filename: student.filename || `${student.nombre_completo.replace(/\s+/g, '_')}.md`,
contents,
answers,
variant_id: variant,
model,
customization
});
const existingIndex = sessionReports.findIndex(r => r.studentIndex === currentStudentIndex);
const reportData = {
studentIndex: currentStudentIndex,
nombre_completo: student.nombre_completo,
filename: student.filename || `${student.nombre_completo.replace(/\s+/g, '_')}.md`,
report_content: data.report_content,
saved_path: data.saved_path,
completed: true,
answers: { ...questionnaireAnswers },
variant: selectedVariant
};
if (existingIndex >= 0) {
sessionReports[existingIndex] = reportData;
} else {
sessionReports.push(reportData);
}
const refreshedSession = await apiGet(`/courses/${encodeURIComponent(selectedCourse)}/session`);
courseSessions[selectedCourse] = refreshedSession;
$('report-preview').innerHTML = renderMarkdownToHtml(data.report_content);
lastReportDownloaded = false;
show($('report-actions'));
var preview = $('report-preview'); if (preview) { preview.setAttribute('tabindex', '-1'); preview.focus(); }
setLoading(false);
} catch (err) {
setLoading(false);
showRetryableError('No se pudo regenerar el informe.', err, doRegenerateWithCustomization);
}
}
function downloadReportForIndex(studentIndex) {
lastReportDownloaded = true;
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
function downloadReport() {
downloadReportForIndex(currentStudentIndex);
}
function downloadAllReports() {
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
async function goToNextStudent() {
if (!lastReportDownloaded && sessionReports.some(r => r.studentIndex === currentStudentIndex)) {
const ok = await showConfirm('No descargaste este informe. ¿Pasar al siguiente alumno igual?');
if (!ok) return;
}
if (currentStudentIndex < allStudents.length - 1) {
currentStudentIndex++;
$('report-preview').innerHTML = '<p>Generando informe...</p>';
hide($('report-actions'));
goToWizardStep(1);
setupQuestionnaireForCurrentStudent();
setTimeout(function() {
  var firstFocusable = document.querySelector('#step-1 button, #step-1 input, #step-1 select, #step-1 textarea');
  if (firstFocusable) firstFocusable.focus();
}, 100);
}
}
	// ====== Sidebar ======
	async function renderSidebarCourses() {
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
	if (emptyEl) emptyEl.classList.remove('hidden');
	} else {
	if (emptyEl) emptyEl.classList.add('hidden');
	list.innerHTML = courses.map(c => {
	const name = c.name || c;
	const total = c.student_count || 0;
	const completed = c.completed_count || 0;
	const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
	const completeClass = pct >= 100 ? ' complete' : '';
	const active = selectedCourse === name ? ' active' : '';
	return `<div class="sidebar-course-item${active}" data-course="${name.replace(/"/g, '&quot;')}" onclick="navigateToCourse('${name.replace(/'/g, "\\'")}')" tabindex="0" role="button" aria-pressed="${selectedCourse === name}">
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
	</div>`;
	}).join('');
	}
	} catch (err) {
	console.error('Error loading sidebar courses:', err);
	}
	const contentsPanel = $('sidebar-contents-panel');
	if (contentsPanel) {
	if (selectedCourse) {
	contentsPanel.classList.remove('hidden');
	if (window.lucide) lucide.createIcons({ nodes: [contentsPanel] });
	loadContents(selectedCourse);
	} else {
	contentsPanel.classList.add('hidden');
	}
	}
	}
	function navigateToCourse(name) {
	closeMobileSidebar();
	navigateTo(`#/course/${name.replace(/\s+/g, '-')}`);
	}
	function toggleMobileSidebar() {
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
	function closeMobileSidebar() {
	const sidebar = $('sidebar');
	if (sidebar) sidebar.classList.remove('open');
	const backdrop = document.getElementById('sidebar-backdrop');
	if (backdrop) backdrop.classList.remove('visible');
	}
	// ====== Student Selection ======
	let selectedStudentIndex = -1;
	function selectStudent(index) {
	if (index === selectedStudentIndex) {
	deselectStudent();
	return;
	}
	selectedStudentIndex = index;
	document.querySelectorAll('.list-row.selected').forEach(r => r.classList.remove('selected'));
	const row = document.querySelector(`.list-row[data-index="${index}"]`);
	if (row) row.classList.add('selected');
	openStudentDrawer(index);
	}
	function deselectStudent() {
	selectedStudentIndex = -1;
	document.querySelectorAll('.list-row.selected').forEach(r => r.classList.remove('selected'));
	closeStudentDrawer();
}
	async function openStudentDrawer(index) {
	const student = allStudents[index];
	if (!student) return;
	$('student-drawer-name').textContent = student.nombre_completo;
	renderStudentEditor('student-drawer-content', index);
	show($('student-drawer'));
	document.body.style.overflow = 'hidden';
	$('btn-close-drawer').focus();
	const textarea = document.getElementById('textarea-student-drawer-content');
	if (textarea && !textarea.value.trim()) {
		const reportFilename = getReportFilename(student.nombre_completo);
		try {
			const data = await apiGet(`/reports/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(reportFilename)}`);
			if (data.content) {
				textarea.value = data.content;
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
			}
		} catch (err) {
		}
	}
	}
	function closeStudentDrawer() {
	hide($('student-drawer'));
	document.body.style.overflow = '';
	}
	// ====== Container-based Student Editor ======
	function renderStudentEditor(containerId, index) {
	const container = document.getElementById(containerId);
	if (!container) return;
	const s = allStudents[index];
	if (!s) return;
	const session = courseSessions[selectedCourse] || {};
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
	_refreshIcons(container);
	}
	const _origApplyFormat = applyFormat;
	applyFormat = function(containerId, indexOrType, type) {
	if (typeof type === 'string') {
	_applyFormatContainer(containerId, indexOrType, type);
	} else {
	_origApplyFormat(containerId, indexOrType);
	}
	};
	function _applyFormatContainer(containerId, index, type) {
	const textarea = document.getElementById(`textarea-${containerId}`);
	if (!textarea) return;
	const start = textarea.selectionStart;
	const end = textarea.selectionEnd;
	const text = textarea.value;
	const selected = text.substring(start, end);
	let formatted = '';
	if (type === 'bold') formatted = `**${selected}**`;
	else if (type === 'italic') formatted = `*${selected}*`;
	else if (type === 'list') formatted = `\n- ${selected}`;
	textarea.value = text.substring(0, start) + formatted + text.substring(end);
	textarea.focus();
	textarea.setSelectionRange(start + formatted.length, start + formatted.length);
	handleAutoSave(containerId, index);
	}
	const _origTogglePreview = togglePreview;
	togglePreview = function(containerId) {
	const textarea = document.getElementById(`textarea-${containerId}`);
	const preview = document.getElementById(`preview-${containerId}`);
	const btn = document.getElementById(`preview-btn-${containerId}`);
	if (!textarea || !preview || !btn) return _origTogglePreview(containerId);
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
	};
	const _origHandleAutoSave = handleAutoSave;
	handleAutoSave = function(containerId, index) {
	if (typeof index !== 'number') return _origHandleAutoSave(containerId);
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
	}
	if (statusEl) {
	statusEl.textContent = '\u2713 Guardado';
	statusEl.className = 'save-status saved';
	}
	}, 1500);
	};
	async function createCourseFromSidebar() {
	const courseName = $('sidebar-new-course-name').value.trim();
	const rawNames = $('sidebar-new-students-list').value.trim();
	if (!courseName) { showToast('Ingresa un nombre para el curso.', 'warning'); return; }
	if (!rawNames) { showToast('Ingresa al menos un alumno.', 'warning'); return; }
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
	btnNew.innerHTML = '<i data-lucide="plus" style="width:18px;height:18px;"></i>';
	if (window.lucide) lucide.createIcons({ nodes: [btnNew] });
	}
	renderSidebarCourses();
	} catch (err) {
	showToast('No se pudo crear el curso. Verifica la carpeta y los permisos.', 'error');
	} finally { setLoading(false); }
	}
	
// ====== Init ======

document.addEventListener('DOMContentLoaded', () => {
if (window.lucide) {
lucide.createIcons();
}
loadAuthState();
if (authState.loggedIn) {
showHero();
preloadSystemStatus();
}
if ($('btn-hero-start')) {
$('btn-hero-start').addEventListener('click', () => {
if (authState.loggedIn) {
navigateTo('#/onboarding');
} else {
navigateTo('#/login');
}
});
}
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
const ollamaOk = systemStatus.ollamaRunning;
const folderOk = e.target.value === 'existing'
? $('base-path').value.trim().length > 0
: $('new-course-name').value.trim().length > 0 && $('new-students-list').value.trim().length > 0;
$('btn-start').disabled = !(ollamaOk && folderOk);
});
});
$('base-path').addEventListener('input', () => {
updateFolderIndicator($('base-path').value);
const ollamaOk = systemStatus.ollamaRunning;
$('btn-start').disabled = !(ollamaOk && $('base-path').value.trim().length > 0);
});
$('btn-pick-folder').addEventListener('click', async () => {
try {
setLoading(true);
const data = await apiGet('/pick-folder');
setLoading(false);
if (data.error) {
showToast('No se pudo abrir el selector. Intenta de nuevo.', 'error');;
return;
}
if (data.cancelled) {
return;
}
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
 $('btn-back-to-menu').addEventListener('click', openCoursesMenu);
 const qSelector = $('dashboard-questionnaire-selector');
 if (qSelector) {
 qSelector.addEventListener('click', (e) => {
 if (e.target.tagName === 'LABEL' || e.target.tagName === 'H4') {
 const isHidden = qSelector.classList.contains('hidden');
 if (isHidden) {
 qSelector.classList.remove('hidden');
 } else {
 qSelector.classList.add('hidden');
 }
 }
 });
 }
 const sidebarContents = $('sidebar-contents');
 if (sidebarContents) {
 sidebarContents.addEventListener('input', updateSaveContentsButton);
 }
 const btnSaveSidebarContents = $('btn-sidebar-save-contents');
 if (btnSaveSidebarContents) {
 btnSaveSidebarContents.addEventListener('click', saveSidebarContents);
 }
$('prev-question-btn').addEventListener('click', goToPreviousQuestion);
$('btn-save-questionnaire').addEventListener('click', saveQuestionnaire);
$('question-skip-text').addEventListener('click', skipQuestion);
$('btn-skip-all-questions').addEventListener('click', skipAllAndGenerate);
$('btn-parse-obs').addEventListener('click', parseQuickObservations);
$('btn-add-obs-row').addEventListener('click', addEmptyObsRow);
$('btn-skip-obs').addEventListener('click', skipObservationsAndContinue);
$('btn-exit-without-save').addEventListener('click', async () => {
const ok = await showConfirm('Los cambios no guardados se perderan. ¿Salir?');
if (ok) hideWizard();
});
$('btn-save-obs').addEventListener('click', saveObservationsAndContinue);
$('obs-attendance-total').addEventListener('input', updateObsAttendancePercentage);
$('obs-attendance-absences').addEventListener('input', updateObsAttendancePercentage);
document.querySelectorAll('#progress-bar .step').forEach(step => {
step.addEventListener('click', () => {
const targetStep = parseInt(step.dataset.step);
if (targetStep < currentWizardStep) {
goToWizardStep(targetStep);
if (targetStep === 1) {
show($('question-card'));
show(document.querySelector('.question-progress-bar'));
show($('question-counter'));
hide($('observations-panel'));
}
}
});
});
$('btn-show-more-models').addEventListener('click', () => {
show($('model-cards-extra'));
hide($('btn-show-more-models'));
});
$('btn-step-2').addEventListener('click', () => {
goToWizardStep(3);
doGenerateReport();
});
$('btn-back-to-questionnaire').addEventListener('click', () => {
goToWizardStep(1);
show($('question-card'));
show(document.querySelector('.question-progress-bar'));
show($('question-counter'));
hide($('observations-panel'));
});
$('btn-download').addEventListener('click', downloadReport);
$('btn-modify-report').addEventListener('click', () => {
const panel = $('customization-panel');
if (panel.classList.contains('hidden')) {
show(panel);
} else {
hide(panel);
}
});
$('btn-next-student').addEventListener('click', goToNextStudent);
$('btn-go-dashboard').addEventListener('click', hideWizard);
$('btn-finish').addEventListener('click', () => {
openCoursesMenu();
});
$('btn-regenerate-custom').addEventListener('click', doRegenerateWithCustomization);
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
selectedVariant = e.currentTarget.dataset.length;
document.querySelectorAll('.length-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
e.currentTarget.classList.add('active');
e.currentTarget.setAttribute('aria-pressed', 'true');
});
});
['formality', 'empathy', 'detail', 'naturalness'].forEach(name => {
const slider = $(`slider-${name}`);
if (slider) {
slider.addEventListener('input', updateCustomizationText);
}
});
$('customization-text').addEventListener('input', () => {
const hasText = $('customization-text').value.trim().length > 0;
$('customization-text').dataset.manual = hasText ? 'true' : 'false';
['formality', 'empathy', 'detail', 'naturalness'].forEach(name => {
const slider = $(`slider-${name}`);
if (slider) slider.disabled = hasText;
});
});
$('btn-download-all').addEventListener('click', downloadAllReports);
$('btn-close-help').addEventListener('click', hideHelp);
$('help-modal').addEventListener('click', (e) => {
if (e.target === $('help-modal') || e.target.classList.contains('help-overlay')) {
hideHelp();
}
});
$('btn-user-menu').addEventListener('click', (e) => {
e.stopPropagation();
toggleUserDropdown();
});
$('dropdown-courses').addEventListener('click', (e) => {
hide($('user-dropdown'));
});
$('dropdown-questionnaires').addEventListener('click', (e) => {
hide($('user-dropdown'));
});
$('dropdown-profile').addEventListener('click', (e) => {
e.preventDefault();
hide($('user-dropdown'));
openProfileModal();
});
$('dropdown-help').addEventListener('click', (e) => {
e.preventDefault();
hide($('user-dropdown'));
showHelp(currentHelpScreen);
});
$('dropdown-logout').addEventListener('click', (e) => {
e.preventDefault();
hide($('user-dropdown'));
doLogout();
});
$('dropdown-change-path').addEventListener('click', (e) => {
e.preventDefault();
hide($('user-dropdown'));
openProfileModal();
});
window.addEventListener('hashchange', handleHashChange);
if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
handleHashChange();
}
$('btn-close-profile').addEventListener('click', closeProfileModal);
$('btn-change-folder').addEventListener('click', doChangeFolder);
$('btn-logout').addEventListener('click', doLogout);
$('profile-modal').addEventListener('click', (e) => {
if (e.target === $('profile-modal') || e.target.classList.contains('help-overlay')) {
closeProfileModal();
}
});
$('profile-edit-form').addEventListener('submit', (e) => { e.preventDefault(); saveProfile(); });
['profile-new-password', 'profile-confirm-password'].forEach(id => {
$(id).addEventListener('input', () => {
_clearFieldErrors(['profile-password-error', 'profile-confirm-password-error']);
$('profile-save-error').textContent = '';
});
});
$('login-form').addEventListener('submit', (e) => { e.preventDefault(); doLogin(); });
$('register-form').addEventListener('submit', (e) => { e.preventDefault(); doRegister(); });
$('link-register').addEventListener('click', (e) => { e.preventDefault(); navigateTo('#/register'); });
$('link-login').addEventListener('click', (e) => { e.preventDefault(); navigateTo('#/login'); });
['login-username', 'login-password'].forEach(id => {
$(id).addEventListener('input', () => {
_clearFieldErrors(['login-username-error', 'login-password-error']);
$('login-error').textContent = '';
});
});
['reg-username', 'reg-password', 'reg-password-confirm'].forEach(id => {
$(id).addEventListener('input', () => {
_clearFieldErrors(['reg-username-error', 'reg-password-error', 'reg-password-confirm-error']);
$('register-error').textContent = '';
});
});
$('btn-close-questionnaires').addEventListener('click', () => navigateTo('#/courses'));
$('btn-new-questionnaire').addEventListener('click', () => navigateTo('#/questionnaires/new/'));
$('btn-save-questionnaire-editor').addEventListener('click', saveQuestionnaireEditor);
$('btn-cancel-questionnaire-editor').addEventListener('click', () => navigateTo('#/questionnaires'));
$('qe-textarea').addEventListener('input', () => {
renderMarkdownPreview(parseMarkdownQuestions($('qe-textarea').value));
});
initAuth();
	// Sidebar mobile toggle
	const mobileToggle = $('btn-mobile-sidebar-toggle');
	if (mobileToggle) mobileToggle.addEventListener('click', toggleMobileSidebar);
	const sidebarClose = $('btn-sidebar-close');
	if (sidebarClose) sidebarClose.addEventListener('click', closeMobileSidebar);
	// Sidebar create course
	const btnNew = $('btn-sidebar-new-course');
	const createForm = $('sidebar-create-course');
	if (btnNew && createForm) {
	btnNew.addEventListener('click', () => {
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
	if (btnCreate) btnCreate.addEventListener('click', createCourseFromSidebar);
	if (btnCancel) {
	btnCancel.addEventListener('click', () => {
	hide(createForm);
	if (btnNew) {
	btnNew.classList.remove('adding');
	btnNew.setAttribute('aria-label', 'Nuevo curso');
	btnNew.innerHTML = '<i data-lucide="plus" style="width:18px;height:18px;"></i>';
	if (window.lucide) lucide.createIcons({ nodes: [btnNew] });
	}
	});
	}
	// Drawer close
	const btnCloseDrawer = $('btn-close-drawer');
	if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeStudentDrawer);
	const drawerOverlay = $('student-drawer-overlay');
	if (drawerOverlay) drawerOverlay.addEventListener('click', closeStudentDrawer);
	// Drawer prev/next navigation
	const btnPrevStudent = $('btn-drawer-prev-student');
	const btnNextStudent = $('btn-drawer-next-student');
	if (btnPrevStudent) btnPrevStudent.addEventListener('click', () => {
	if (selectedStudentIndex > 0) selectStudent(selectedStudentIndex - 1);
	});
	if (btnNextStudent) btnNextStudent.addEventListener('click', () => {
	if (selectedStudentIndex < allStudents.length - 1) selectStudent(selectedStudentIndex + 1);
	});
	// Keyboard: Escape closes drawer, arrows navigate
	document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
	if (!$('student-drawer').classList.contains('hidden')) closeStudentDrawer();
	} else if (!$('student-drawer').classList.contains('hidden') && e.key === 'ArrowLeft') {
	if (selectedStudentIndex > 0) selectStudent(selectedStudentIndex - 1);
	} else if (!$('student-drawer').classList.contains('hidden') && e.key === 'ArrowRight') {
	if (selectedStudentIndex < allStudents.length - 1) selectStudent(selectedStudentIndex + 1);
	}
	});

});
function loadAuthState() {
try {
const raw = localStorage.getItem('informescreator_auth');
if (raw) {
authState = JSON.parse(raw);
}
} catch (e) {
authState = { loggedIn: false, username: '' };
}
}
function saveAuthState() {
localStorage.setItem('informescreator_auth', JSON.stringify(authState));
}
async function initAuth() {
loadAuthState();
if (authState.loggedIn) {
const headerUsername = $('header-username');
if (headerUsername) headerUsername.textContent = authState.username;
return;
}
try {
const profile = await apiGet('/auth/me');
if (profile.username) {
authState = { loggedIn: true, username: profile.display_name || profile.username };
saveAuthState();
const headerUsername = $('header-username');
if (headerUsername) headerUsername.textContent = profile.display_name || profile.username;
}
} catch (err) {
}
}
async function doLogin() {
const username = $('login-username').value.trim();
const password = $('login-password').value;
const formErrorEl = $('login-error');
formErrorEl.textContent = '';
_clearFieldErrors(['login-username-error', 'login-password-error']);
let valid = true;
if (!username) {
_showFieldError('login-username-error', 'Ingresa tu usuario.');
valid = false;
}
if (!password) {
_showFieldError('login-password-error', 'Ingresa tu contraseña.');
valid = false;
} else if (password.length < 4) {
_showFieldError('login-password-error', 'La contraseña debe tener al menos 4 caracteres.');
valid = false;
}
if (!valid) return;
setLoading(true);
try {
const res = await apiPost('/auth/login', { username, password });
authState = { loggedIn: true, username: res.username };
saveAuthState();
$('header-username').textContent = res.display_name || res.username;
hide($('login-screen'));
navigateTo('#/');
showHero();
preloadSystemStatus();
} catch (err) {
if (err.status === 401) {
formErrorEl.textContent = 'Usuario o contraseña incorrectos.';
} else {
formErrorEl.textContent = 'No se pudo iniciar sesión. ' + (err.message || '');
}
} finally {
setLoading(false);
}
}
async function doRegister() {
const username = $('reg-username').value.trim();
const displayName = $('reg-display-name').value.trim();
const password = $('reg-password').value;
const passwordConfirm = $('reg-password-confirm').value;
const formErrorEl = $('register-error');
formErrorEl.textContent = '';
_clearFieldErrors(['reg-username-error', 'reg-password-error', 'reg-password-confirm-error']);
let valid = true;
if (!username) {
_showFieldError('reg-username-error', 'Elegi un usuario.');
valid = false;
}
if (!password) {
_showFieldError('reg-password-error', 'Elegí una contraseña.');
valid = false;
} else if (password.length < 4) {
_showFieldError('reg-password-error', 'La contraseña debe tener al menos 4 caracteres.');
valid = false;
}
if (!passwordConfirm) {
_showFieldError('reg-password-confirm-error', 'Repetí la contraseña.');
valid = false;
} else if (password !== passwordConfirm) {
_showFieldError('reg-password-confirm-error', 'Las contraseñas no coinciden.');
valid = false;
}
if (!valid) return;
setLoading(true);
try {
await apiPost('/auth/register', { username, password, display_name: displayName || undefined });
showToast('Perfil creado exitosamente. Por favor, iniciá sesión.', 'success');

// Clear form
$('reg-username').value = '';
$('reg-display-name').value = '';
$('reg-password').value = '';
$('reg-password-confirm').value = '';

// Navigate to login
hide($('register-screen'));
navigateTo('#/login');
} catch (err) {
formErrorEl.textContent = (err.detail || err.message) || 'No se pudo crear el perfil.';
} finally {
setLoading(false);
}
}
function _showFieldError(id, msg) {
	var el = $(id);
	if (el) {
		el.textContent = msg;
		var input = el.previousElementSibling;
		if (!input || !input.tagName) input = el.parentElement && el.parentElement.querySelector('input');
		if (input) {
			input.setAttribute('aria-invalid', 'true');
			input.setAttribute('aria-describedby', id);
		}
	}
}
function _clearFieldErrors(ids) {
	for (var i = 0; i < ids.length; i++) {
		var el = $(ids[i]);
		if (el) {
			el.textContent = '';
			var input = el.previousElementSibling;
			if (!input || !input.tagName) input = el.parentElement && el.parentElement.querySelector('input');
			if (input) {
				input.removeAttribute('aria-invalid');
				input.removeAttribute('aria-describedby');
			}
		}
	}
}
async function doLogout() {
try {
await apiPost('/auth/logout', {});
} catch (err) {
}
authState = { loggedIn: false, username: '' };
saveAuthState();
hide($('profile-modal'));
navigateTo('#/login');
}
async function openProfileModal() {
try {
const cfg = await apiGet('/config');
$('profile-folder-path').textContent = cfg.base_path || 'Sin configurar';
} catch (err) {
$('profile-folder-path').textContent = 'Error cargando config';
}
try {
const profile = await apiGet('/auth/me');
$('profile-username').textContent = profile.username || authState.username || '';
$('profile-display-name').value = profile.display_name || '';
} catch (err) {
$('profile-username').textContent = authState.username || '';
$('profile-display-name').value = '';
}
$('profile-new-password').value = '';
$('profile-confirm-password').value = '';
_clearFieldErrors(['profile-password-error', 'profile-confirm-password-error']);
$('profile-save-error').textContent = '';
const btn = $('btn-save-profile');
btn.classList.remove('btn-saved');
btn.innerHTML = '<i data-lucide="save" style="width:16px;height:16px;"></i> Guardar cambios';
if (window.lucide) lucide.createIcons({ nodes: [btn] });
show($('profile-modal'));
if (window.lucide) lucide.createIcons({ nodes: [$('profile-modal')] });
}
function closeProfileModal() {
hide($('profile-modal'));
}
async function saveProfile() {
const displayName = $('profile-display-name').value.trim();
const newPassword = $('profile-new-password').value;
const confirmPassword = $('profile-confirm-password').value;
const errorEl = $('profile-save-error');
errorEl.textContent = '';
_clearFieldErrors(['profile-password-error', 'profile-confirm-password-error']);
if (newPassword && newPassword.length < 4) {
_showFieldError('profile-password-error', 'La contraseña debe tener al menos 4 caracteres.');
return;
}
if (newPassword && newPassword !== confirmPassword) {
_showFieldError('profile-confirm-password-error', 'Las contraseñas no coinciden.');
return;
}
const payload = {};
if (displayName) payload.display_name = displayName;
if (newPassword) payload.password = newPassword;
if (!payload.display_name && !payload.password) {
showToast('No hay cambios para guardar.', 'info');
return;
}
try {
const res = await apiPut('/auth/profile', payload);
if (res.display_name) {
$('header-username').textContent = res.display_name;
}
const btn = $('btn-save-profile');
btn.classList.add('btn-saved');
btn.innerHTML = '<i data-lucide="check" style="width:16px;height:16px;"></i> Guardado';
if (window.lucide) lucide.createIcons({ nodes: [btn] });
$('profile-new-password').value = '';
$('profile-confirm-password').value = '';
showToast('Perfil actualizado correctamente.', 'success');
setTimeout(() => {
btn.classList.remove('btn-saved');
btn.innerHTML = '<i data-lucide="save" style="width:16px;height:16px;"></i> Guardar cambios';
if (window.lucide) lucide.createIcons({ nodes: [btn] });
}, 2000);
} catch (err) {
errorEl.textContent = (err.detail || err.message) || 'No se pudo actualizar el perfil.';
}
}
async function doChangeFolder() {
try {
setLoading(true);
const data = await apiGet('/pick-folder');
setLoading(false);
if (data.error) {
showToast('No se pudo abrir el selector. Intenta de nuevo.', 'error');;
return;
}
if (data.cancelled || !data.path) {
return;
}
await apiPost('/config', { base_path: data.path });
$('profile-folder-path').textContent = data.path;
showToast('Carpeta actualizada.', 'success');
if (!$('courses-grid').classList.contains('hidden')) {
loadCoursesGrid();
}
} catch (err) {
setLoading(false);
showToast('No se pudo cambiar la carpeta. Intenta de nuevo.', 'error');
}
}
let editingQuestionnaireId = null;
let editorQuestions = [];
function showQuestionnairesScreen() {
hideMainContentScreens(); show($('layout-body'));
hide($('course-view'));
hide($('wizard'));
show($('questionnaires-screen'));
loadQuestionnairesList();
}
function hideQuestionnairesScreen() {
hide($('questionnaires-screen'));
show($('layout-body')); show($('courses-grid')); renderSidebarCourses();
}
async function loadQuestionnairesList() {
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
<h4>${q.name}</h4>
<span class="badge badge-subtle">${q.question_count || 0} preguntas</span>
</div>
<p class="hint">${q.description || ''}</p>
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
function questionsToMarkdown(questions) {
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
function parseMarkdownQuestions(text) {
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
function renderMarkdownPreview(questions) {
const container = $('qe-preview');
if (!questions.length) {
container.innerHTML = '<p class="hint">Sin preguntas. Escribe markdown valido.</p>';
return;
}
container.innerHTML = questions.map((q, i) => `
<div class="qe-preview-item">
<div class="qe-preview-title">${i + 1}. ${q.title || '(sin titulo)'}</div>
<div class="qe-preview-meta">${q.section} | ${q.answer_type}</div>
<div class="qe-preview-text">${q.text || ''}</div>
${q.labels ? `<ul class="qe-preview-options">${q.labels.map(l => `<li>${l}</li>`).join('')}</ul>` : '<span class="qe-preview-meta">Texto libre</span>'}
</div>
`).join('');
}
async function openQuestionnaireEditor(id) {
editingQuestionnaireId = id;
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
function closeQuestionnaireEditor() {
editingQuestionnaireId = null;
navigateTo('#/questionnaires');
}
async function saveQuestionnaireEditor() {
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
if (editingQuestionnaireId) {
await apiPut(`/questionnaires/${editingQuestionnaireId}`, payload);
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
async function duplicateQuestionnaire(id) {
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
async function deleteQuestionnaire(id) {
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