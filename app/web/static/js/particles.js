export function initParticles() {
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
    const heroScreen = document.getElementById('hero-screen');
    const isHeroVisible = heroScreen && !heroScreen.classList.contains('hidden');
    const density = isHeroVisible ? 18000 : 25000;
    const count = Math.min(100, Math.floor((canvas.width * canvas.height) / density));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    const heroScreen = document.getElementById('hero-screen');
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
}
