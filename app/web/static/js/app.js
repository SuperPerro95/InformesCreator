/**
 * InformesCreator - Frontend SPA (Vanilla JS)
 *
 * Nueva arquitectura:
 * 1. Onboarding (verificacion inicial) → se ejecuta al cargar
 * 2. Menu de Cursos → seleccionar curso
 * 3. Dashboard del Curso → resumen de alumnos, acciones
 * 4. Wizard (3 pasos): Cuestionario → Configuracion → Informe
 */

// ===================== Particle Background =====================
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
    // Body
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h * 0.75, 2);
    ctx.fillStyle = color;
    ctx.fill();
    // Tip
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, cy + h * 0.25);
    ctx.lineTo(cx + w / 2, cy + h * 0.25);
    ctx.lineTo(cx, cy + h / 2 + size * 0.15);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    // Eraser
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
    // Lines
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
    // Cap top (diamond/square rotated)
    const s = size * 0.8;
    ctx.beginPath();
    ctx.moveTo(cx - s, cy);
    ctx.lineTo(cx, cy - s * 0.5);
    ctx.lineTo(cx + s, cy);
    ctx.lineTo(cx, cy + s * 0.5);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    // Tassel string
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx + s * 0.8, cy + s * 0.3, cx + s * 1.2, cy + s * 0.8);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Tassel end
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    // Draw connections
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

// ===================== Icon Helper =====================
function icon(name, size = 16) {
  if (window.lucide && lucide.icons && lucide.icons[name]) {
    return lucide.icons[name].toSvg({ size, strokeWidth: 2 });
  }
  return '';
}

// ===================== DOM Helpers =====================
function $(id) { return document.getElementById(id); }
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function setLoading(isLoading) {
  const loader = $('loading');
  if (isLoading) show(loader); else hide(loader);
}

// ===================== Help System =====================
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
      <li><strong>A (Formal y conciso)</strong> → ~100-150 palabras, tono objetivo.</li>
      <li><strong>B (Detallado)</strong> → ~200-250 palabras, más desarrollado.</li>
      <li><strong>C (Breve y directo)</strong> → ~50-80 palabras, solo lo esencial.</li>
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
  const btn = $('btn-help');
  if (!screen || screen === 'hero') {
    hide(btn);
  } else {
    show(btn);
  }
}

// ===================== State =====================
let onboardingComplete = false;
let currentWizardStep = 1;
let selectedCourse = '';
let allStudents = [];
let currentStudentIndex = 0;
let selectedVariant = null;
let selectedModel = null;

// Asistencia
let attendanceData = { include: false, total_classes: 0, absences: 0 };

// Cache de sesiones por curso
let courseSessions = {};

// Persistencia de informes en sesion
let sessionReports = [];

// Cuestionario paso a paso
let questionnaireAnswers = {};
let currentQuestionIndex = 0;

// ===================== Router =====================
let isNavigating = false;

function navigateTo(hash) {
  if (isNavigating) return;
  isNavigating = true;
  window.location.hash = hash;
  // El listener de hashchange hará el resto; limpiamos la bandera después de un tick
  setTimeout(() => { isNavigating = false; }, 0);
}

function handleHashChange() {
  const hash = window.location.hash || '#/';

  // Hero screen
  if (hash === '' || hash === '#' || hash === '#/') {
    return;
  }

  // Onboarding
  if (hash === '#/onboarding') {
    if (!$('onboarding-overlay').classList.contains('hidden')) return;
    hide($('hero-screen'));
    show(document.querySelector('header'));
    show($('onboarding-overlay'));
    updateHelpButton('onboarding');
    currentHelpScreen = 'onboarding';
    return;
  }

  // Courses menu
  if (hash === '#/courses') {
    if (!$('courses-menu').classList.contains('hidden') && $('course-view').classList.contains('hidden') && $('wizard').classList.contains('hidden')) return;
    hide($('hero-screen'));
    hide($('onboarding-overlay'));
    hide($('course-view'));
    hide($('wizard'));
    show(document.querySelector('header'));
    show($('courses-menu'));
    loadCoursesGrid();
    updateHelpButton('courses');
    currentHelpScreen = 'courses';
    return;
  }

  // Course dashboard
  const courseMatch = hash.match(/#\/course\/(.+)/);
  if (courseMatch) {
    const course = courseMatch[1].replace(/-/g, ' ');
    if (selectedCourse === course && !$('course-view').classList.contains('hidden') && $('wizard').classList.contains('hidden')) {
      return;
    }
    if (!courseSessions[course] || !allStudents.length || allStudents[0]?.curso !== course) {
      initFromHashCourse(course, 'dashboard');
      return;
    }
    hide($('hero-screen'));
    hide($('onboarding-overlay'));
    hide($('courses-menu'));
    hide($('wizard'));
    show(document.querySelector('header'));
    show($('course-view'));
    selectedCourse = course;
    $('course-view-title').textContent = course;
    renderDashboard();
    updateHelpButton('dashboard');
    currentHelpScreen = 'dashboard';
    return;
  }

  // Wizard
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
    showWizardFromHash(substep);
    return;
  }
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
  hide($('hero-screen'));
  hide($('onboarding-overlay'));
  hide($('courses-menu'));
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
    // Llamar directamente al handler en vez de navigateTo para evitar loop
    handleHashChange();
  } catch (err) {
    console.error('Error inicializando curso desde hash:', err);
    navigateTo('#/courses');
  } finally {
    setLoading(false);
  }
}

// ===================== Model Info =====================
const MODEL_INFO = {
  'gemma4': { name: 'Gemma 4 (31B Cloud)', desc: 'Recomendado. Creado por Google (EE.UU.). Excelente calidad en espanol para textos educativos. Requiere conexion a internet.' },
  'qwen3.5': { name: 'Qwen 3.5 (Cloud)', desc: 'Creado por Alibaba (China). Muy buen rendimiento en espanol y texto educativo. Requiere conexion a internet.' },
  'nemotron-3-super': { name: 'Nemotron 3 Super (Cloud)', desc: 'Creado por NVIDIA (EE.UU.). Destaca en razonamiento complejo, matematicas y tareas avanzadas. Requiere conexion a internet.' },
  'gemini-3-flash-preview': { name: 'Gemini 3 Flash Preview (Cloud)', desc: 'Creado por Google (EE.UU.). Extremadamente rapido y eficiente, con capacidades multimodales. Requiere conexion a internet.' },
  'deepseek-v4-flash': { name: 'DeepSeek V4 Flash (Cloud)', desc: 'Creado por DeepSeek (China). Excelente en razonamiento profundo, matematicas y generacion de codigo. Requiere conexion a internet.' },
  'gemma3': { name: 'Gemma 3 (Local)', desc: 'Creado por Google (EE.UU.). Modelo local ligero. Funciona sin internet.' },
  'llama3.1': { name: 'Llama 3.1 (Local)', desc: 'Creado por Meta (EE.UU.). Buen soporte multilingue y razonamiento. Funciona sin internet.' },
};

function getReportFilename(nombreCompleto) {
  return 'Informe_' + nombreCompleto.replace(/, /g, '_').replace(/ /g, '_') + '.md';
}

// ===================== Preguntas unificadas =====================
const ALL_QUESTIONS = [
  { section: 'valoracion', text: 'Valoracion preliminar del alumno', options: ['TEA', 'TEP', 'TED'], labels: ['TEA - Trayectoria Educativa Alcanzada', 'TEP - Trayectoria Educativa en Proceso', 'TED - Trayectoria Educativa Discontinua'] },
  { section: 'pedagogical', text: 'Participacion: Interviene de manera pertinente durante las explicaciones o debates?', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'pedagogical', text: 'Seguimiento de consignas: Comprende y ejecuta las instrucciones de trabajo a la primera mencion?', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'pedagogical', text: 'Autonomia: Inicia y avanza en sus tareas sin necesidad de supervision constante?', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'pedagogical', text: 'Organizacion: Trae y mantiene ordenados los materiales necesarios para la clase?', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'pedagogical', text: 'Persistencia: Mantiene el esfuerzo ante una tarea que le resulta dificil o compleja?', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'pedagogical', text: 'Cumplimiento: Entrega las actividades o producciones en los plazos establecidos?', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'socioemotional', text: 'Integracion social: Trabaja de forma colaborativa y armonica con sus companeros?', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'socioemotional', text: 'Gestion del error: Acepta las correcciones o los errores sin mostrar frustracion excesiva o bloqueo?', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'socioemotional', text: 'Comunicacion: Expresa sus necesidades, dudas o desacuerdos de manera respetuosa?', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'socioemotional', text: 'Respeto a las normas: Se ajusta a los acuerdos de convivencia establecidos en el aula?', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'socioemotional', text: 'Empatia: Muestra actitudes de ayuda o respeto hacia las dificultades de los demas?', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'socioemotional', text: 'Nivel de motivacion: Muestra curiosidad o disposicion positiva hacia las actividades propuestas?', options: [1, 2, 3, 4], labels: ['1 - NUNCA', '2 - RARA VEZ', '3 - EN OCASIONES', '4 - SIEMPRE'] },
  { section: 'content', text: 'Explica con sus propias palabras', options: [1, 2, 3], labels: ['1 - No Logrado', '2 - En Proceso', '3 - Logrado'] },
  { section: 'content', text: 'Relaciona con temas previos', options: [1, 2, 3], labels: ['1 - No Logrado', '2 - En Proceso', '3 - Logrado'] },
  { section: 'content', text: 'Aplica en ejercicios practicos', options: [1, 2, 3], labels: ['1 - No Logrado', '2 - En Proceso', '3 - Logrado'] },
  { section: 'content', text: 'Usa terminologia adecuada', options: [1, 2, 3], labels: ['1 - No Logrado', '2 - En Proceso', '3 - Logrado'] },
  { section: 'content', text: 'Justifica sus respuestas', options: [1, 2, 3], labels: ['1 - No Logrado', '2 - En Proceso', '3 - Logrado'] },
  { section: 'observaciones', text: 'Observaciones particulares (opcional)', options: null, labels: null },
];

const TOTAL_QUESTIONS = ALL_QUESTIONS.length;

// ===================== API Calls =====================
async function apiGet(path) {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ===================== Hero Screen =====================
let systemStatus = { ollamaRunning: false, basePath: '' };

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
  // Hide header while hero is visible
  hide(document.querySelector('header'));
  // Re-trigger icon animation by re-inserting
  if (window.lucide) lucide.createIcons();
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
    const indicator = $('indicator-ollama');
    if (data.running) {
      indicator.className = 'indicator indicator-ok';
      indicator.innerHTML = `<i data-lucide="bot" style="width:14px;height:14px;"></i> Ollama activo`;
    } else {
      indicator.className = 'indicator indicator-error';
      indicator.innerHTML = `<i data-lucide="bot" style="width:14px;height:14px;"></i> Ollama ${data.installed ? 'detenido' : 'no instalado'}`;
    }
  } catch (err) {
    $('indicator-ollama').className = 'indicator indicator-error';
    $('indicator-ollama').innerHTML = `<i data-lucide="bot" style="width:14px;height:14px;"></i> Error`;
  }
  if (window.lucide) lucide.createIcons();
}

// ===================== Onboarding =====================
async function runOnboarding() {
  // Cargar config
  try {
    const cfg = await apiGet('/config');
    $('base-path').value = cfg.base_path || '';
    updateFolderIndicator(cfg.base_path);
  } catch (err) {
    console.error('Error loading config:', err);
  }

  // Verificar Ollama
  await checkOllamaStatus();

  // Si Ollama OK y carpeta configurada, habilitar boton
  const ollamaOk = !$('indicator-ollama').classList.contains('indicator-error');
  const folderOk = $('base-path').value.trim().length > 0;
  $('btn-start').disabled = !(ollamaOk && folderOk);
}

async function checkOllamaStatus() {
  try {
    const data = await apiGet('/ollama/status');
    const indicator = $('indicator-ollama');
    const statusBox = $('onboarding-ollama-status');
    const setupDiv = $('onboarding-ollama-setup');

    if (data.running) {
      indicator.className = 'indicator indicator-ok';
      indicator.innerHTML = `<i data-lucide="bot" style="width:14px;height:14px;"></i> Ollama activo`;
      statusBox.className = 'status-box ok';
      statusBox.innerHTML = `<p><strong>Ollama esta activo.</strong> Modelos disponibles: ${data.models.length}</p>`;
      hide(setupDiv);
    } else if (data.installed) {
      indicator.className = 'indicator indicator-error';
      indicator.innerHTML = `<i data-lucide="bot" style="width:14px;height:14px;"></i> Ollama detenido`;
      statusBox.className = 'status-box error';
      statusBox.innerHTML = `<p><strong>Ollama esta instalado pero no esta corriendo.</strong></p>`;
      show(setupDiv);
      setupDiv.innerHTML = `<div class="setup-instructions"><h4>Como iniciar Ollama</h4><p>Abri una terminal y ejecuta:</p><code>ollama serve</code><p class="hint">Dejala corriendo en segundo plano.</p></div>`;
    } else {
      indicator.className = 'indicator indicator-error';
      indicator.innerHTML = `<i data-lucide="bot" style="width:14px;height:14px;"></i> Ollama no instalado`;
      statusBox.className = 'status-box error';
      statusBox.innerHTML = `<p><strong>Ollama no esta instalado.</strong></p>`;
      show(setupDiv);
      setupDiv.innerHTML = `<div class="setup-instructions"><h4>Como instalar Ollama</h4><p><strong>Windows (PowerShell admin):</strong></p><code>irm https://ollama.com/install.ps1 | iex</code><p><strong>macOS / Linux:</strong></p><code>curl -fsSL https://ollama.com/install.sh | sh</code><p>Mas info en <a href="https://ollama.com" target="_blank">ollama.com</a></p></div>`;
    }
  } catch (err) {
    $('indicator-ollama').className = 'indicator indicator-error';
    $('indicator-ollama').innerHTML = `<i data-lucide="bot" style="width:14px;height:14px;"></i> Error`;
    $('onboarding-ollama-status').innerHTML = `<p>Error al verificar Ollama: ${err.message}</p>`;
  }
  if (window.lucide) lucide.createIcons();
}

function updateFolderIndicator(path) {
  const el = $('indicator-folder');
  const pathEl = $('indicator-folder-path');
  if (path && path.trim()) {
    el.className = 'indicator indicator-ok';
    pathEl.textContent = path;
    pathEl.title = path;
  } else {
    el.className = 'indicator indicator-pending';
    pathEl.textContent = 'Sin ruta';
    pathEl.title = '';
  }
}

function completeOnboarding() {
  onboardingComplete = true;
  hide($('onboarding-overlay'));
  show(document.querySelector('header'));
  show($('courses-menu'));
  loadCoursesGrid();
  updateHelpButton('courses');
  currentHelpScreen = 'courses';
  navigateTo('#/courses');
}

// ===================== Courses Menu =====================
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

    // Cargar sesion de cada curso para progreso
    const sessionPromises = courses.map(c =>
      apiGet(`/courses/${encodeURIComponent(c)}/session`).catch(() => ({
        respuestas: {}, progreso: { completados: [] }, informes_existentes: []
      }))
    );
    const sessions = await Promise.all(sessionPromises);

    // Cachear
    courses.forEach((c, i) => {
      courseSessions[c] = sessions[i];
    });

    container.innerHTML = courses.map((c, i) => {
      const session = sessions[i];
      const existingReports = session.informes_existentes?.length || 0;
      const hasData = (session.respuestas && Object.keys(session.respuestas).length > 0) || existingReports > 0;

      return `
        <div class="course-card ${hasData ? 'has-data' : ''}" data-course="${c}">
          ${hasData ? '<div class="badge badge-warning">Tiene datos guardados</div>' : ''}
          <div class="course-card-name">${c}</div>
          <div class="course-card-progress">${existingReports} informe(s) generado(s)</div>
          <div class="course-card-progress-bar">
            <div class="course-card-progress-fill" style="width: 0%"></div>
          </div>
          <button class="btn-primary course-card-btn" data-course="${c}">Entrar</button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.course-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const course = e.target.dataset.course;
        navigateTo(`#/course/${course.replace(/\s+/g, '-')}`);
      });
    });
  } catch (err) {
    alert('Error cargando cursos: ' + err.message);
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

    // Load students
    const data = await apiGet(`/courses/${encodeURIComponent(course)}/students`);
    allStudents = data.students;
    currentStudentIndex = 0;

    // Cargar contenidos en background
    loadContents(course);

    // Mostrar dashboard, ocultar menu
    hide($('courses-menu'));
    show($('course-view'));
    hide($('wizard'));

    $('course-view-title').textContent = course;
    renderDashboard();
    updateHelpButton('dashboard');
    currentHelpScreen = 'dashboard';
    navigateTo(`#/course/${course.replace(/\s+/g, '-')}`);
  } catch (err) {
    alert('Error entrando al curso: ' + err.message);
  } finally {
    setLoading(false);
  }
}

function openCoursesMenu() {
  hide($('course-view'));
  hide($('wizard'));
  show($('courses-menu'));
  loadCoursesGrid();
  updateHelpButton('courses');
  currentHelpScreen = 'courses';
  navigateTo('#/courses');
}

// ===================== Dashboard =====================
function renderDashboard() {
  const session = courseSessions[selectedCourse] || {};
  const backendCompletados = new Set(session.progreso?.completados || []);
  sessionReports.forEach(r => {
    if (r.completed) backendCompletados.add(r.filename);
  });
  const completedCount = backendCompletados.size;
  const totalCount = allStudents.length;

  $('dashboard-stats').innerHTML = `
    <div class="dashboard-stats">
      <div class="stat-number">${completedCount}<span class="font-mono" style="font-size: 1rem; color: var(--text-muted);"> / ${totalCount}</span></div>
      <div class="stat-label">Alumnos completados</div>
    </div>
  `;

  const container = $('dashboard-students-list');
  if (allStudents.length === 0) {
    container.innerHTML = '<p class="hint">No se encontraron alumnos en este curso.</p>';
    return;
  }

  container.innerHTML = allStudents.map((s, i) => {
    const isCompleted = backendCompletados.has(s.filename);
    const hasSavedAnswers = !!(session.respuestas && session.respuestas[s.filename]);
    const isIncompleto = !isCompleted && hasSavedAnswers;

    const badgeClass = isCompleted ? 'badge-success' : (isIncompleto ? 'badge-warning' : 'badge-subtle');
    const statusText = isCompleted ? 'Informe listo' : (isIncompleto ? 'Cuestionario guardado' : 'Sin empezar');

    let actionButtons;
    if (isCompleted) {
      actionButtons = `
        <button class="btn-primary btn-sm student-action-btn" data-action="download" data-index="${i}">Descargar</button>
        <button class="btn-secondary btn-sm student-action-btn" data-action="redo" data-index="${i}">Rehacer</button>
        <button class="btn-danger btn-sm student-action-btn" data-action="clear" data-index="${i}">Borrar</button>
      `;
    } else if (isIncompleto) {
      actionButtons = `
        <button class="btn-primary btn-sm student-action-btn" data-action="continue" data-index="${i}">Continuar</button>
        <button class="btn-secondary btn-sm student-action-btn" data-action="generate" data-index="${i}">Generar informe</button>
        <button class="btn-danger btn-sm student-action-btn" data-action="clear" data-index="${i}">Borrar</button>
      `;
    } else {
      actionButtons = `
        <button class="btn-primary btn-sm student-action-btn" data-action="complete" data-index="${i}">Comenzar</button>
        <button class="btn-secondary btn-sm student-action-btn" data-action="quick" data-index="${i}">Generar rapido</button>
      `;
    }

    return `
      <div class="list-row" data-index="${i}">
        <span class="row-num font-mono">${i + 1}</span>
        <span class="row-name">${s.nombre_completo}</span>
        <span class="row-stats font-mono">P:${s.total_presentes} A:${s.total_ausencias}</span>
        <span class="badge ${badgeClass}">${statusText}</span>
        <div class="flex gap-2">${actionButtons}</div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.student-action-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const action = e.target.dataset.action;
      const idx = parseInt(e.target.dataset.index);
      const student = allStudents[idx];
      currentStudentIndex = idx;

      if (action === 'download') {
        try {
          const reportFilename = getReportFilename(student.nombre_completo);
          await downloadExistingReport(selectedCourse, reportFilename);
        } catch (err) {
          downloadReportForIndex(idx);
        }
      } else if (action === 'redo' || action === 'complete') {
        sessionReports = sessionReports.filter(r => r.studentIndex !== idx);
        startWizardForStudent();
      } else if (action === 'continue') {
        sessionReports = sessionReports.filter(r => r.studentIndex !== idx);
        startWizardForStudent(true);
      } else if (action === 'quick') {
        sessionReports = sessionReports.filter(r => r.studentIndex !== idx);
        questionnaireAnswers = {};
        currentQuestionIndex = 0;
        if (!$('course-contents').value) await loadContents(selectedCourse);
        await loadStudentContext();
        showWizard();
        goToWizardStep(2);
        await loadVariants();
      } else if (action === 'generate') {
        sessionReports = sessionReports.filter(r => r.studentIndex !== idx);
        const sess = courseSessions[selectedCourse] || {};
        const saved = sess.respuestas?.[student.filename];
        if (saved) {
          questionnaireAnswers = {};
          questionnaireAnswers[0] = saved.valoracion || 0;
          (saved.pedagogical || []).forEach((v, i) => { questionnaireAnswers[i + 1] = v; });
          (saved.socioemotional || []).forEach((v, i) => { questionnaireAnswers[i + 7] = v; });
          (saved.content || []).forEach((v, i) => { questionnaireAnswers[i + 13] = v; });
          questionnaireAnswers[18] = saved.particular_observations || '';
        }
        if (!$('course-contents').value) await loadContents(selectedCourse);
        showWizard();
        goToWizardStep(2);
        await loadVariants();
      } else if (action === 'clear') {
        if (!confirm(`Borrar todas las respuestas de ${student.nombre_completo}?`)) return;
        try {
          await apiPost(`/students/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(student.filename)}/clear`, {});
          const refreshed = await apiGet(`/courses/${encodeURIComponent(selectedCourse)}/session`);
          courseSessions[selectedCourse] = refreshed;
          renderDashboard();
        } catch (err) {
          alert('Error borrando respuestas: ' + err.message);
        }
      }
    });
  });
}

// ===================== Wizard Navigation =====================
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

  const slug = selectedCourse.replace(/\s+/g, '-');
  const extra = step === 2 ? '/config' : (step === 3 ? '/report' : '');
  navigateTo(`#/wizard/${slug}${extra}`);
}

function startWizardForStudent(continuar = false) {
  showWizard();
  questionnaireAnswers = {};
  currentQuestionIndex = 0;

  if (continuar) {
    continueQuestionnaireForCurrentStudent();
  } else {
    setupQuestionnaireForCurrentStudent();
  }
}

// ===================== Contents =====================
async function loadContents(course) {
  try {
    const data = await apiGet(`/courses/${encodeURIComponent(course)}/contents`);
    $('course-contents').value = data.contents || '';
  } catch (err) {
    console.error('Error loading contents:', err);
  }
}

async function saveContents() {
  if (!selectedCourse) return;
  setLoading(true);
  try {
    await apiPost(`/courses/${encodeURIComponent(selectedCourse)}/contents`, {
      contents: $('course-contents').value
    });
    showContentsViewMode();
  } catch (err) {
    alert('Error guardando contenidos: ' + err.message);
  } finally {
    setLoading(false);
  }
}

function showContentsEditMode() {
  show($('contents-edit-mode'));
  hide($('contents-view-mode'));
}

function showContentsViewMode() {
  hide($('contents-edit-mode'));
  show($('contents-view-mode'));
  const text = $('course-contents').value.trim();
  $('contents-display').textContent = text || '(Sin contenidos guardados)';
}

// ===================== Helpers: parseo de nombres =====================
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

// ===================== Panel de observaciones =====================
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

  // Cargar datos de asistencia
  const totalClases = (student.total_presentes || 0) + (student.total_ausencias || 0);
  $('obs-attendance-total').value = totalClases;
  $('obs-attendance-absences').value = student.total_ausencias || 0;
  updateObsAttendancePercentage();

  renderObservationsTable();
  updateObsAttendanceSummary();
}

async function showObservationsPanel() {
  await loadStudentContext();

  show($('contents-section'));
  hide($('btn-toggle-contents'));
  hide($('question-card'));
  hide(document.querySelector('.question-progress-bar'));
  hide($('question-counter'));
  show($('observations-panel'));
}

function renderObservationsTable() {
  const container = $('obs-table-body');
  if (currentObservations.length === 0) {
    container.innerHTML = '<p class="hint" style="padding: 8px 0;">No hay observaciones.</p>';
    return;
  }
  container.innerHTML = currentObservations.map((obs, i) => `
    <div class="obs-row" data-index="${i}">
      <input type="text" class="obs-fecha" value="${obs.fecha || ''}" placeholder="15/3">
      <input type="text" class="obs-comentario" value="${obs.comentario || ''}" placeholder="Comentario">
      <button class="btn-remove-row" data-index="${i}">${icon('x', 14)}</button>
    </div>
  `).join('');

  container.querySelectorAll('.btn-remove-row').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.closest('button').dataset.index);
      currentObservations.splice(idx, 1);
      renderObservationsTable();
      updateObsAttendanceSummary();
    });
  });
}

function addEmptyObsRow() {
  currentObservations.push({ fecha: '', codigo: '', tipo: '', comentario: '' });
  renderObservationsTable();
}

function parseQuickObservations() {
  const raw = $('obs-quick-text').value.trim();
  if (!raw) return;
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  lines.forEach(line => {
    // Formato: dd/mm - Comentario
    const match = line.match(/^([\d/]+)\s*-\s*(.+)$/);
    if (match) {
      currentObservations.push({
        fecha: match[1].trim(),
        codigo: '',
        tipo: '',
        comentario: match[2].trim()
      });
    } else {
      // Si no tiene formato, usar todo como comentario
      currentObservations.push({ fecha: '', codigo: '', tipo: '', comentario: line });
    }
  });
  $('obs-quick-text').value = '';
  renderObservationsTable();
  updateObsAttendanceSummary();
}

function updateObsAttendanceSummary() {
  const totalObs = currentObservations.length;
  const summaryText = totalObs > 0
    ? `${totalObs} observacion${totalObs !== 1 ? 'es' : ''} registrada${totalObs !== 1 ? 's' : ''}`
    : 'Sin observaciones registradas';
  $('obs-attendance-summary').textContent = summaryText;
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
      codigo: '',
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
    // Actualizar asistencia del estudiante
    student.total_presentes = totalClasses - absences;
    student.total_ausencias = absences;
    // Guardar datos de asistencia
    attendanceData = {
      include: true,
      total_classes: totalClasses,
      absences: absences
    };
    hide($('observations-panel'));
    startQuestionnaireForCurrentStudent();
  } catch (err) {
    alert('Error guardando observaciones: ' + err.message);
  } finally {
    setLoading(false);
  }
}

function skipObservationsAndContinue() {
  hide($('observations-panel'));
  startQuestionnaireForCurrentStudent();
}

function continueQuestionnaireForCurrentStudent() {
  const student = allStudents[currentStudentIndex];
  if (!student) return;

  $('sticky-student-name').textContent = `${student.nombre_completo} — ${student.curso}`;
  $('sticky-student-counter').textContent = `Alumno ${currentStudentIndex + 1} de ${allStudents.length}`;

  questionnaireAnswers = {};
  currentQuestionIndex = 0;

  hide($('observations-panel'));
  show($('question-card'));
  show(document.querySelector('.question-progress-bar'));
  show($('question-counter'));
  hide($('contents-section'));
  show($('btn-toggle-contents'));

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
    questionnaireAnswers[0] = savedAnswers.valoracion || 'TEP';
    (savedAnswers.pedagogical || []).forEach((v, i) => { questionnaireAnswers[i + 1] = v; });
    (savedAnswers.socioemotional || []).forEach((v, i) => { questionnaireAnswers[i + 7] = v; });
    (savedAnswers.content || []).forEach((v, i) => { questionnaireAnswers[i + 13] = v; });
    questionnaireAnswers[18] = savedAnswers.particular_observations || '';
  }

  let startIndex = 0;
  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    if (questionnaireAnswers[i] === undefined) {
      startIndex = i;
      break;
    }
  }
  if (startIndex >= TOTAL_QUESTIONS) startIndex = TOTAL_QUESTIONS - 1;

  renderQuestion(startIndex);
}

function startQuestionnaireForCurrentStudent() {
  const student = allStudents[currentStudentIndex];
  if (!student) return;

  questionnaireAnswers = {};
  currentQuestionIndex = 0;

  show($('question-card'));
  show(document.querySelector('.question-progress-bar'));
  show($('question-counter'));
  hide($('contents-section'));
  show($('btn-toggle-contents'));

  const session = courseSessions[selectedCourse];
  const savedAnswers = session?.respuestas?.[student.filename];
  if (savedAnswers) {
    const reuse = confirm(`Este alumno ya tiene respuestas guardadas. Queres reutilizarlas?`);
    if (reuse) {
      questionnaireAnswers[0] = savedAnswers.valoracion || 'TEP';
      (savedAnswers.pedagogical || []).forEach((v, i) => { questionnaireAnswers[i + 1] = v; });
      (savedAnswers.socioemotional || []).forEach((v, i) => { questionnaireAnswers[i + 7] = v; });
      (savedAnswers.content || []).forEach((v, i) => { questionnaireAnswers[i + 13] = v; });
      questionnaireAnswers[18] = savedAnswers.particular_observations || '';
    }
  }

  renderQuestion(0);
}

// ===================== Step 1: Questionnaire =====================
function setupQuestionnaireForCurrentStudent() {
  showObservationsPanel();
}

function renderQuestion(index) {
  currentQuestionIndex = index;
  const q = ALL_QUESTIONS[index];
  const savedValue = questionnaireAnswers[index];

  const pct = ((index + 1) / TOTAL_QUESTIONS) * 100;
  $('question-progress-fill').style.width = `${pct}%`;
  $('question-counter').textContent = `Pregunta ${index + 1} de ${TOTAL_QUESTIONS}`;

  $('current-question-text').textContent = q.text;

  const optionsContainer = $('current-question-options');
  optionsContainer.innerHTML = '';

  if (q.section === 'observaciones') {
    const textarea = document.createElement('textarea');
    textarea.rows = 4;
    textarea.placeholder = 'Situaciones puntuales...';
    textarea.style.width = '100%';
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
    continueBtn.addEventListener('click', () => handleAnswer(textarea.value));
    optionsContainer.appendChild(textarea);
    optionsContainer.appendChild(continueBtn);
  } else if (q.section === 'valoracion') {
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.innerHTML = `<strong>${opt}</strong><br><span style="font-size:0.85rem">${q.labels[i]}</span>`;
      if (savedValue === opt) btn.classList.add('selected');
      btn.addEventListener('click', () => handleAnswer(opt));
      optionsContainer.appendChild(btn);
    });
  } else {
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = q.labels[i];
      if (savedValue === opt) btn.classList.add('selected');
      btn.addEventListener('click', () => handleAnswer(opt));
      optionsContainer.appendChild(btn);
    });
  }

  $('prev-question-btn').disabled = index === 0;
  if (index === 0) {
    hide($('prev-question-btn'));
  } else {
    show($('prev-question-btn'));
  }
}

function handleAnswer(value) {
  questionnaireAnswers[currentQuestionIndex] = value;
  if (currentQuestionIndex >= TOTAL_QUESTIONS - 1) {
    finishQuestionnaire();
  } else {
    renderQuestion(currentQuestionIndex + 1);
  }
}

function skipQuestion() {
  if (currentQuestionIndex >= TOTAL_QUESTIONS - 1) {
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
    alert('Cuestionario guardado.');
    hideWizard();
  } catch (err) {
    alert('Error guardando cuestionario: ' + err.message);
  } finally {
    setLoading(false);
  }
}

async function finishQuestionnaire() {
  await saveQuestionnaireBackend();

  // Ir directo a la configuración del informe (ya no hay panel de asistencia)
  hide($('question-card'));
  hide(document.querySelector('.question-progress-bar'));
  hide($('question-counter'));
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
  if (!confirm('Se generara el informe usando solo las observaciones del archivo. Las preguntas no respondidas se ignoraran. Continuar?')) return;
  hide($('question-card'));
  hide(document.querySelector('.question-progress-bar'));
  hide($('question-counter'));
  goToWizardStep(2);
  await loadVariants();
}

// Nota: Las funciones updateAttendancePercentage y continueToVariant fueron eliminadas.
// La asistencia ahora se maneja directamente en el panel de observaciones.

function collectAnswers() {
  const valRaw = questionnaireAnswers[0];
  const valoracion = (valRaw === 'TEA' || valRaw === 'TEP' || valRaw === 'TED') ? valRaw : null;

  const pedagogical = [];
  const socioemotional = [];
  const content = [];

  for (let i = 1; i < TOTAL_QUESTIONS; i++) {
    const q = ALL_QUESTIONS[i];
    const val = questionnaireAnswers[i];
    if (q.section === 'pedagogical') pedagogical.push(val !== undefined && val !== 0 ? parseInt(val) : 0);
    else if (q.section === 'socioemotional') socioemotional.push(val !== undefined && val !== 0 ? parseInt(val) : 0);
    else if (q.section === 'content') content.push(val !== undefined && val !== 0 ? parseInt(val) : 0);
  }

  const particular = questionnaireAnswers[TOTAL_QUESTIONS - 1] || '';

  return {
    valoracion,
    pedagogical,
    socioemotional,
    content,
    particular_observations: particular,
    attendance: attendanceData
  };
}

// ===================== Step 2: Variants + Model =====================
let availableModels = [];

function normalizeModelName(name) {
  return name.split(':')[0];
}

async function loadModelSelect() {
  try {
    const data = await apiGet('/ollama/status');
    const container = $('model-cards');
    const extraContainer = $('model-cards-extra');
    const btnMore = $('btn-show-more-models');
    const descEl = $('model-description');
    const rawModels = data.models || [];

    if (rawModels.length === 0) {
      container.innerHTML = '<p class="hint">No hay modelos instalados.</p>';
      hide(extraContainer);
      hide(btnMore);
      selectedModel = null;
      descEl.innerHTML = '<span style="color: var(--danger-text);">Ningun modelo instalado.</span>';
      return;
    }

    let modelEntries = rawModels.map(rawName => {
      const baseName = normalizeModelName(rawName);
      const info = MODEL_INFO[baseName];
      if (info) {
        return { rawName, name: info.name, desc: info.desc, isRecommended: baseName === 'gemma4' };
      }
      return { rawName, name: rawName, desc: 'Modelo instalado en Ollama.', isRecommended: false };
    });

    modelEntries.sort((a, b) => {
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return 0;
    });

    const firstThree = modelEntries.slice(0, 3);
    const rest = modelEntries.slice(3);

    container.innerHTML = firstThree.map(m => `
      <div class="selection-card model-card" data-model="${m.rawName}">
        ${m.isRecommended ? '<span class="recommended-badge">Recomendado</span>' : ''}
        <h4>${m.name}</h4>
        <p>${m.desc}</p>
      </div>
    `).join('');

    if (rest.length > 0) {
      extraContainer.innerHTML = rest.map(m => `
        <div class="selection-card model-card" data-model="${m.rawName}">
          <h4>${m.name}</h4>
          <p>${m.desc}</p>
        </div>
      `).join('');
      show(btnMore);
      hide(extraContainer);
    } else {
      hide(btnMore);
      hide(extraContainer);
    }

    const preferred = modelEntries.find(m => m.isRecommended) || modelEntries[0];
    if (preferred) {
      selectedModel = preferred.rawName;
      const card = container.querySelector(`.selection-card[data-model="${preferred.rawName}"]`)
        || extraContainer.querySelector(`.selection-card[data-model="${preferred.rawName}"]`);
      if (card) card.classList.add('selected');
      descEl.innerHTML = `<strong>${preferred.name}</strong> — ${preferred.desc}`;
    }

    [container, extraContainer].forEach(cont => {
      cont.querySelectorAll('.selection-card').forEach(card => {
        card.addEventListener('click', () => {
          const model = card.dataset.model;
          document.querySelectorAll('.selection-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          selectedModel = model;
          const entry = modelEntries.find(e => e.rawName === model);
          if (entry) {
            descEl.innerHTML = `<strong>${entry.name}</strong> — ${entry.desc}`;
          }
        });
      });
    });
  } catch (err) {
    console.error('Error loading models:', err);
  }
}

async function loadVariants() {
  try {
    await loadModelSelect();

    const data = await apiGet('/variants');
    const container = $('variants-list');
    container.innerHTML = data.map(v => `
      <div class="selection-card variant-card" data-id="${v.id}">
        <h4>${v.id}) ${v.name}</h4>
        <p>${v.description}</p>
      </div>
    `).join('');

    container.querySelectorAll('.selection-card').forEach(card => {
      card.addEventListener('click', () => {
        container.querySelectorAll('.selection-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedVariant = card.dataset.id;
      });
    });

    if (data.length > 0) {
      container.querySelector('.selection-card').click();
    }
  } catch (err) {
    console.error('Error loading variants:', err);
  }
}

// ===================== Step 3: Generate Report =====================
async function doGenerateReport() {
  const student = allStudents[currentStudentIndex];
  if (!student || !selectedCourse || !selectedVariant) {
    alert('Faltan datos para generar el informe.');
    return;
  }

  const answers = collectAnswers();
  const model = selectedModel;
  const contents = $('course-contents').value;

  setLoading(true);
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
      answers: { ...questionnaireAnswers }
    };

    if (existingIndex >= 0) {
      sessionReports[existingIndex] = reportData;
    } else {
      sessionReports.push(reportData);
    }

    const refreshedSession = await apiGet(`/courses/${encodeURIComponent(selectedCourse)}/session`);
    courseSessions[selectedCourse] = refreshedSession;

    $('report-preview').textContent = data.report_content;
    show($('report-actions'));

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
    alert('Error generando informe: ' + err.message);
  }
}

function downloadReportForIndex(studentIndex) {
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
    alert('Error descargando informe: ' + err.message);
  }
}

function downloadReport() {
  downloadReportForIndex(currentStudentIndex);
}

function downloadAllReports() {
  if (sessionReports.length === 0) {
    alert('No hay informes generados en esta sesion.');
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

function goToNextStudent() {
  if (currentStudentIndex < allStudents.length - 1) {
    currentStudentIndex++;
    $('report-preview').innerHTML = '<p>Generando informe...</p>';
    hide($('report-actions'));
    goToWizardStep(1);
    setupQuestionnaireForCurrentStudent();
  }
}

// ===================== Event Listeners =====================
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  // Hero screen + background preload
  showHero();
  preloadSystemStatus();

  // Hero CTA
  $('btn-hero-cta').addEventListener('click', async () => {
    hideHero();
    show(document.querySelector('header'));
    show($('onboarding-overlay'));
    updateHelpButton('onboarding');
    currentHelpScreen = 'onboarding';
    navigateTo('#/onboarding');
    await runOnboarding();
  });

  $('btn-start').addEventListener('click', completeOnboarding);

  // Folder option toggle in onboarding
  document.querySelectorAll('input[name="folder-option"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'existing') {
        show($('existing-folder-section'));
        hide($('new-course-section'));
      } else {
        hide($('existing-folder-section'));
        show($('new-course-section'));
      }
      // Re-evaluate button
      const ollamaOk = !$('indicator-ollama').classList.contains('indicator-error');
      const folderOk = e.target.value === 'existing'
        ? $('base-path').value.trim().length > 0
        : $('new-course-name').value.trim().length > 0 && $('new-students-list').value.trim().length > 0;
      $('btn-start').disabled = !(ollamaOk && folderOk);
    });
  });

  $('base-path').addEventListener('input', () => {
    updateFolderIndicator($('base-path').value);
    const ollamaOk = !$('indicator-ollama').classList.contains('indicator-error');
    $('btn-start').disabled = !(ollamaOk && $('base-path').value.trim().length > 0);
  });

  $('btn-pick-folder').addEventListener('click', async () => {
    try {
      setLoading(true);
      const data = await apiGet('/pick-folder');
      setLoading(false);
      if (data.error) {
        alert('Error abriendo selector: ' + data.error);
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
      alert('Error abriendo selector: ' + err.message);
    }
  });

  // Header navigation
  $('btn-mis-cursos').addEventListener('click', openCoursesMenu);

  // Courses menu
  $('btn-close-courses-menu').addEventListener('click', () => {
    if (selectedCourse) {
      hide($('courses-menu'));
      show($('course-view'));
    }
  });

  $('btn-back-to-menu').addEventListener('click', openCoursesMenu);

  // Create course in menu
  $('btn-show-create-course').addEventListener('click', () => {
    hide($('courses-grid'));
    hide($('btn-show-create-course'));
    show($('create-course-section'));
  });

  $('btn-cancel-create-course').addEventListener('click', () => {
    hide($('create-course-section'));
    show($('courses-grid'));
    show($('btn-show-create-course'));
  });

  $('btn-create-course-step3').addEventListener('click', async () => {
    const courseName = $('new-course-name-step3').value.trim();
    const rawNames = $('new-students-list-step3').value.trim();
    if (!courseName) {
      alert('Ingresa un nombre para el curso.');
      return;
    }
    if (!rawNames) {
      alert('Ingresa al menos un alumno.');
      return;
    }
    const students = parseStudentNames(rawNames);
    if (students.length === 0) {
      alert('No se pudieron detectar nombres de alumnos.');
      return;
    }
    setLoading(true);
    try {
      const defaultPath = './data/CURSOS';
      await apiPost('/config', { base_path: defaultPath });
      await apiPost('/courses/create', { course_name: courseName, students });
      alert(`Curso "${courseName}" creado con ${students.length} alumnos.`);
      $('new-course-name-step3').value = '';
      $('new-students-list-step3').value = '';
      hide($('create-course-section'));
      show($('courses-grid'));
      show($('btn-show-create-course'));
      loadCoursesGrid();
    } catch (err) {
      alert('Error creando curso: ' + err.message);
    } finally {
      setLoading(false);
    }
  });

  // Wizard - Step 1 (Questionnaire)
  $('btn-save-contents').addEventListener('click', saveContents);
  $('btn-edit-contents').addEventListener('click', showContentsEditMode);
  $('btn-toggle-contents').addEventListener('click', () => {
    const el = $('contents-section');
    if (el.classList.contains('hidden')) {
      show(el);
      $('btn-toggle-contents').textContent = 'Ocultar contenidos del curso';
    } else {
      hide(el);
      $('btn-toggle-contents').textContent = 'Editar contenidos del curso';
    }
  });
  $('prev-question-btn').addEventListener('click', goToPreviousQuestion);
  $('skip-question-btn').addEventListener('click', skipQuestion);
  $('btn-save-questionnaire').addEventListener('click', saveQuestionnaire);
  $('btn-skip-all-questions').addEventListener('click', skipAllAndGenerate);

  // Observations
  $('btn-parse-obs').addEventListener('click', parseQuickObservations);
  $('btn-add-obs-row').addEventListener('click', addEmptyObsRow);
  $('btn-skip-obs').addEventListener('click', skipObservationsAndContinue);
  $('btn-save-obs').addEventListener('click', saveObservationsAndContinue);
  $('obs-attendance-total').addEventListener('input', updateObsAttendancePercentage);
  $('obs-attendance-absences').addEventListener('input', updateObsAttendancePercentage);

  // Wizard - Step 2 (Config)
  $('btn-show-more-models').addEventListener('click', () => {
    show($('model-cards-extra'));
    hide($('btn-show-more-models'));
  });

  $('btn-step-2').addEventListener('click', () => {
    goToWizardStep(3);
    doGenerateReport();
  });

  // Wizard - Step 3 (Report)
  $('btn-download').addEventListener('click', downloadReport);
  $('btn-next-student').addEventListener('click', goToNextStudent);
  $('btn-go-dashboard').addEventListener('click', hideWizard);
  $('btn-finish').addEventListener('click', () => {
    openCoursesMenu();
  });

  // Dashboard actions
  $('btn-download-all').addEventListener('click', downloadAllReports);

  // Help system
  $('btn-help').addEventListener('click', () => showHelp(currentHelpScreen));
  $('btn-close-help').addEventListener('click', hideHelp);
  $('help-modal').addEventListener('click', (e) => {
    if (e.target === $('help-modal') || e.target.classList.contains('help-overlay')) {
      hideHelp();
    }
  });

  // Router
  window.addEventListener('hashchange', handleHashChange);
  if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
    handleHashChange();
  }
});
