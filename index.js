// ─── INIT ───────────────────────────────────────────────────────────────────
const header      = document.getElementById("siteHeader");
const menuToggle  = document.getElementById("menuToggle");
const nav         = document.getElementById("siteNav");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile    = window.matchMedia("(max-width: 760px)").matches;

// ─── HEADER SCROLL ──────────────────────────────────────────────────────────
function onScrollHeader() {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 14);
  header.classList.toggle("compact",  window.scrollY > 80);
}
window.addEventListener("scroll", onScrollHeader, { passive: true });
onScrollHeader();

// ─── SCROLL PROGRESS ────────────────────────────────────────────────────────
function setupScrollProgress() {
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.innerHTML = "<span></span>";
  document.body.prepend(progress);
  const bar = progress.querySelector("span");
  function updateProgress() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = total > 0 ? `${(window.scrollY / total * 100).toFixed(1)}%` : "0%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
}

// ─── MOBILE NAV ─────────────────────────────────────────────────────────────
if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));
}

// ─── REVEAL ON SCROLL ───────────────────────────────────────────────────────
const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    if (el.getAttribute("data-reveal") === "slide-in") el.classList.add("slide-in");
    const idx = Number(el.dataset.revealIndex || "0");
    el.style.transitionDelay = `${Math.min(idx * 55, 240)}ms`;
    el.classList.add("visible");
    revealObserver.unobserve(el);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

revealElements.forEach((el, i) => {
  el.dataset.revealIndex = String(i % 6);
  revealObserver.observe(el);
});

// ─── DYNAMIC BACKGROUND ─────────────────────────────────────────────────────
function setupDynamicBackground() {
  const bg = document.createElement("div");
  bg.className = "dynamic-bg";
  bg.innerHTML = `
    <div class="bg-grid"></div>
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>`;
  document.body.prepend(bg);

  const root = document.documentElement;
  const orb1 = bg.querySelector(".orb-1");
  const orb2 = bg.querySelector(".orb-2");
  const orb3 = bg.querySelector(".orb-3");
  let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
  let currentX = targetX, currentY = targetY;
  let rafId = null;

  function animate() {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;
    const xP = (currentX / window.innerWidth) * 100;
    const yP = (currentY / window.innerHeight) * 100;
    root.style.setProperty("--mx", `${xP.toFixed(1)}%`);
    root.style.setProperty("--my", `${yP.toFixed(1)}%`);
    const xs = (xP - 50) * 0.22, ys = (yP - 50) * 0.22;
    if (orb1) orb1.style.transform = `translate(${(-xs*0.7).toFixed(1)}px,${(-ys*0.7).toFixed(1)}px)`;
    if (orb2) orb2.style.transform = `translate(${( xs*0.5).toFixed(1)}px,${( ys*0.5).toFixed(1)}px)`;
    if (orb3) orb3.style.transform = `translate(${( xs*0.8).toFixed(1)}px,${(-ys*0.35).toFixed(1)}px)`;
    rafId = requestAnimationFrame(animate);
  }

  window.addEventListener("pointermove", e => { targetX = e.clientX; targetY = e.clientY; }, { passive: true });
  window.addEventListener("resize", () => { targetX = window.innerWidth / 2; targetY = window.innerHeight / 2; });
  rafId = requestAnimationFrame(animate);
}

// ─── TILT CARDS ─────────────────────────────────────────────────────────────
function setupTiltCards() {
  if (reducedMotion || isMobile) return;
  document.querySelectorAll(".tilt-card").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      const rx = (0.5 - (e.clientY - r.top)  / r.height) * 7;
      const ry = ((e.clientX - r.left) / r.width - 0.5)  * 7;
      card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

// ─── MAGNETIC BUTTONS ───────────────────────────────────────────────────────
function setupMagneticButtons() {
  if (reducedMotion || isMobile) return;
  document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("pointermove", e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.14;
      const y = (e.clientY - r.top  - r.height / 2) * 0.14;
      btn.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`;
    });
    btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
  });
}

// ─── FLUID PARALLAX ─────────────────────────────────────────────────────────
function setupFluidParallax() {
  if (reducedMotion) return;
  const els = document.querySelectorAll(".media-tile, .process-card, .dash-card, .stack-panel, .timeline-item");
  if (!els.length) return;
  els.forEach((el, i) => { el.classList.add("fluid-element"); el.dataset.depth = String((i % 5) + 1); });
  let px = window.innerWidth / 2, py = window.innerHeight / 2;
  window.addEventListener("pointermove", e => { px = e.clientX; py = e.clientY; }, { passive: true });
  function frame() {
    const nx = (px / window.innerWidth - 0.5) * 2;
    const ny = (py / window.innerHeight - 0.5) * 2;
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      const d = Number(el.dataset.depth || 1);
      el.style.setProperty("--fluid-x", `${(nx * d * 1.4).toFixed(2)}px`);
      el.style.setProperty("--fluid-y", `${(ny * d * 1.0).toFixed(2)}px`);
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ─── SECTION PARALLAX ───────────────────────────────────────────────────────
function setupSectionParallax() {
  if (reducedMotion || isMobile) return;
  const sections = document.querySelectorAll("main .section");
  sections.forEach(s => s.classList.add("parallax-section"));
  function tick() {
    const vc = window.innerHeight * 0.5;
    sections.forEach(s => {
      const r = s.getBoundingClientRect();
      const delta = (r.top + r.height * 0.5 - vc) / window.innerHeight;
      const y = Math.max(-7, Math.min(7, -delta * 9));
      s.style.setProperty("--section-parallax-y", `${y.toFixed(2)}px`);
      s.style.setProperty("--section-parallax-x", `${(y * 0.2).toFixed(2)}px`);
    });
  }
  window.addEventListener("scroll", tick, { passive: true });
  window.addEventListener("resize", tick);
  tick();
}

// ─── FLOATING HERO OBJECT ───────────────────────────────────────────────────
const floatingStage  = document.getElementById("floatingStage");
const floatingObject = document.getElementById("floatingObject");

if (floatingStage && floatingObject && !reducedMotion) {
  let targetP = 0, currentP = 0, ticking = false;
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function updateTarget() {
    const r = floatingStage.getBoundingClientRect();
    const vh = window.innerHeight;
    targetP = clamp((vh - r.top) / (vh + r.height), 0, 1);
    if (!ticking) { ticking = true; requestAnimationFrame(animateObj); }
  }
  function animateObj() {
    const k = isMobile ? 0.5 : 1;
    currentP += (targetP - currentP) * 0.1;
    const p = currentP;
    const my = (p - 0.5) * 75 * k;
    const ry = (p - 0.5) * 60 * k;
    const rx = (0.5 - p) * 34 * k;
    const sc = 0.96 + Math.sin(p * Math.PI) * 0.07 * k;
    floatingObject.style.transform = `translateY(${my.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    if (Math.abs(targetP - currentP) > 0.001) requestAnimationFrame(animateObj);
    else ticking = false;
  }
  window.addEventListener("scroll", updateTarget, { passive: true });
  window.addEventListener("resize", updateTarget);
  updateTarget();
}

// ─── FAST CURSOR RING ───────────────────────────────────────────────────────
function setupCursorRing() {
  if (isMobile || reducedMotion) return;
  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  document.body.append(ring);
  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let tx = x, ty = y;
  window.addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  function animate() {
    // Faster easing: 0.38 instead of 0.22
    x += (tx - x) * 0.38;
    y += (ty - y) * 0.38;
    ring.style.left = `${x.toFixed(1)}px`;
    ring.style.top  = `${y.toFixed(1)}px`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// ─── COUNTERS ───────────────────────────────────────────────────────────────
function setupCounters() {
  const counters = document.querySelectorAll(".counter");
  if (!counters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.counter || "0");
      const dur = 1100;
      const start = performance.now();
      function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = target % 1 === 0 ? String(Math.round(target * ease)) : (target * ease).toFixed(1);
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => obs.observe(c));
}

// ─── FAQ ────────────────────────────────────────────────────────────────────
function setupFaq() {
  document.querySelectorAll(".faq-toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
      toggle.closest(".faq-item")?.classList.toggle("open");
    });
  });
}

// ─── STACK TABS ─────────────────────────────────────────────────────────────
function setupStackTabs() {
  const tabs = document.querySelectorAll(".stack-tab");
  if (!tabs.length) return;
  const panels = document.querySelectorAll(".stack-panel");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-stack-target");
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      panels.forEach(p => p.classList.toggle("active", p.id === target));
    });
  });
}

// ─── BOOT ────────────────────────────────────────────────────────────────────
if (!reducedMotion) setupDynamicBackground();
setupTiltCards();
setupMagneticButtons();
setupScrollProgress();
setupFluidParallax();
setupSectionParallax();
setupCursorRing();
setupCounters();
setupFaq();
setupStackTabs();
