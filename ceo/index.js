'use strict';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarse = window.matchMedia('(pointer: coarse)').matches;

/* ============================================================
   SCROLL PROGRESS BAR
============================================================ */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-bar');
  if (!bar) return;
  function update() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : '0%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ============================================================
   STAR CANVAS
============================================================ */
(function initStars() {
  if (prefersReduced) return;
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];
  const COUNT = 220;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Star {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * (W || window.innerWidth);
      this.y = Math.random() * (H || window.innerHeight);
      this.r = Math.random() * 1.4 + 0.2;
      this.baseOp = Math.random() * 0.6 + 0.15;
      this.op = this.baseOp;
      this.twinkleSpeed = Math.random() * 0.01 + 0.003;
      this.twinklePhase = Math.random() * Math.PI * 2;
      this.parallax = Math.random() * 0.3 + 0.05;
    }
  }

  resize();
  window.addEventListener('resize', () => { resize(); stars.forEach(s => s.reset()); }, { passive: true });
  for (let i = 0; i < COUNT; i++) stars.push(new Star());

  let t = 0;
  let mx = 0, my = 0;
  window.addEventListener('pointermove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 10;
    my = (e.clientY / window.innerHeight - 0.5) * 10;
  }, { passive: true });

  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  function loop() {
    ctx.clearRect(0, 0, W, H);
    t += 0.008;
    stars.forEach(s => {
      s.twinklePhase += s.twinkleSpeed;
      const op = s.baseOp * (0.65 + 0.35 * Math.sin(s.twinklePhase));
      const px = s.x + mx * s.parallax;
      const py = s.y + my * s.parallax - (scrollY * s.parallax * 0.04);
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${op})`;
      ctx.fill();
      // Occasional bright star
      if (s.r > 1.1) {
        ctx.beginPath();
        ctx.arc(px, py, s.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 210, 255, ${op * 0.12})`;
        ctx.fill();
      }
    });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ============================================================
   3D MOON (Three.js)
============================================================ */
(function initMoon() {
  const canvas = document.getElementById('moon-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const size = window.innerWidth < 768 ? 220 : 340;
  canvas.width = size;
  canvas.height = size;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 2.8);

  // Moon sphere with procedural bump-like appearance
  const geo = new THREE.SphereGeometry(1, 64, 64);

  // Create a canvas texture to simulate moon surface
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 512; texCanvas.height = 256;
  const tc = texCanvas.getContext('2d');

  // Deep space grey base
  tc.fillStyle = '#1c2232';
  tc.fillRect(0, 0, 512, 256);

  // Add terrain patches
  const moonColors = ['#2a3045', '#1e2840', '#253050', '#303a55', '#1a2035', '#28344a'];
  function rng(seed) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  const rand = rng(42);

  for (let i = 0; i < 280; i++) {
    const x = rand() * 512; const y = rand() * 256;
    const r = rand() * 28 + 4;
    const col = moonColors[Math.floor(rand() * moonColors.length)];
    const g = tc.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col + 'cc');
    g.addColorStop(1, 'transparent');
    tc.fillStyle = g;
    tc.beginPath(); tc.arc(x, y, r, 0, Math.PI * 2); tc.fill();
  }

  // Craters
  for (let i = 0; i < 55; i++) {
    const x = rand() * 512; const y = rand() * 256;
    const r = rand() * 14 + 3;
    // Dark center
    const cg = tc.createRadialGradient(x, y, 0, x, y, r);
    cg.addColorStop(0, 'rgba(10,14,24,0.85)');
    cg.addColorStop(0.7, 'rgba(15,20,35,0.4)');
    cg.addColorStop(1, 'transparent');
    tc.fillStyle = cg; tc.beginPath(); tc.arc(x, y, r, 0, Math.PI * 2); tc.fill();
    // Rim highlight
    const rg = tc.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.6, x, y, r * 1.1);
    rg.addColorStop(0, 'rgba(80,100,140,0.0)');
    rg.addColorStop(0.85, 'rgba(80,110,160,0.25)');
    rg.addColorStop(1, 'transparent');
    tc.fillStyle = rg; tc.beginPath(); tc.arc(x, y, r * 1.1, 0, Math.PI * 2); tc.fill();
  }

  // Subtle surface glow on right side (lit side)
  const sideGrad = tc.createLinearGradient(0, 0, 512, 0);
  sideGrad.addColorStop(0, 'rgba(30,50,90,0.0)');
  sideGrad.addColorStop(0.5, 'rgba(50,80,140,0.12)');
  sideGrad.addColorStop(1, 'rgba(80,120,200,0.22)');
  tc.fillStyle = sideGrad; tc.fillRect(0, 0, 512, 256);

  const texture = new THREE.CanvasTexture(texCanvas);

  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.88,
    metalness: 0.08,
  });

  const moon = new THREE.Mesh(geo, mat);
  scene.add(moon);

  // Atmosphere halo
  const atmoGeo = new THREE.SphereGeometry(1.05, 32, 32);
  const atmoMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.04,
    side: THREE.FrontSide,
  });
  scene.add(new THREE.Mesh(atmoGeo, atmoMat));

  // Lights
  const ambient = new THREE.AmbientLight(0x112244, 0.9);
  scene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0x8ab4f8, 2.2);
  sunLight.position.set(3, 2, 2);
  scene.add(sunLight);

  const rimLight = new THREE.DirectionalLight(0x1e3a5f, 0.6);
  rimLight.position.set(-3, -1, -1);
  scene.add(rimLight);

  // Scroll + mouse rotation state
  let scrollY = 0;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener('pointermove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.6;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  }, { passive: true });

  function render() {
    const scrollRot = scrollY * 0.0008;
    targetX = scrollRot + mouseY;
    targetY = scrollRot * 0.5 + mouseX;

    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;

    moon.rotation.x = currentX;
    moon.rotation.y = currentY + (Date.now() * 0.00008); // slow auto-spin

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
})();

/* ============================================================
   CUSTOM CURSOR
============================================================ */
(function initCursor() {
  if (prefersReduced || isCoarse) return;
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100, rx = -100, ry = -100;

  window.addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.opacity = '1'; ring.style.opacity = '1';
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    dot.style.opacity = '0'; ring.style.opacity = '0';
  });

  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const hoverEls = 'a, button, .tilt-card, .social-tile, .contact-list a, .project-link, .pillar';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
})();

/* ============================================================
   HEADER — SCROLL EFFECT
============================================================ */
(function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============================================================
   MOBILE NAV TOGGLE
============================================================ */
(function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    links.classList.toggle('open');
  });

  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    });
  });

  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ============================================================
   ACTIVE NAV HIGHLIGHT — fixed sticky logic
============================================================ */
(function initActiveNav() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function setActive(id) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  }

  // Use scroll position directly for reliable accuracy
  function onScroll() {
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
    let current = sections[0].getAttribute('id');
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= headerH + 60) current = section.getAttribute('id');
    });
    setActive(current);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============================================================
   REVEAL ON SCROLL
============================================================ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
})();

/* ============================================================
   TYPED TEXT EFFECT
============================================================ */
(function initTyped() {
  const el = document.querySelector('.typed-text');
  if (!el) return;
  let strings;
  try { strings = JSON.parse(el.dataset.strings); } catch { return; }
  if (!strings.length) return;

  let si = 0, ci = 0, deleting = false;
  const SPEED_TYPE = 75, SPEED_DEL = 40, PAUSE = 1900;

  function tick() {
    const current = strings[si];
    if (deleting) {
      ci--;
      el.textContent = current.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        si = (si + 1) % strings.length;
        setTimeout(tick, 350);
        return;
      }
      setTimeout(tick, SPEED_DEL);
    } else {
      ci++;
      el.textContent = current.slice(0, ci);
      if (ci === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE);
        return;
      }
      setTimeout(tick, SPEED_TYPE);
    }
  }
  setTimeout(tick, 800);
})();

/* ============================================================
   3D TILT CARDS
============================================================ */
(function initTilt() {
  if (prefersReduced || isCoarse) return;
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateZ(4px)`;
      card.style.borderColor = `rgba(59,130,246,${0.12 + Math.abs(x) * 0.25 + Math.abs(y) * 0.25})`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      card.style.borderColor = '';
    });
  });
})();

/* ============================================================
   RIPPLE ON BUTTONS
============================================================ */
(function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const rip = document.createElement('span');
      rip.className = 'ripple';
      rip.style.left = (e.clientX - rect.left) + 'px';
      rip.style.top = (e.clientY - rect.top) + 'px';
      this.appendChild(rip);
      setTimeout(() => rip.remove(), 600);
    });
  });
})();

/* ============================================================
   SMOOTH SCROLL for anchor links
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    if (link.classList.contains('nav-link')) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
