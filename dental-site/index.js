/* ============================================================
   {Buisness Name} — Premium Dental Template
   index.js — Complete Interactive Layer (Fixed & Integrated)
   ============================================================ */

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── PAGE BOOT ────────────────────────────────────────── */
  const boot = () => {
    requestAnimationFrame(() => {
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-ready');
    });
  };

  /* ── PAGE TRANSITIONS ─────────────────────────────────── */
  const enablePageTransitions = () => {
    const shouldSkip = (a) => {
      if (!a) return true;
      const href = a.getAttribute('href') || '';
      if (!href || href === '#') return true;
      if (href.startsWith('#')) return true;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return true;
      if (a.hasAttribute('download')) return true;
      if (a.target && a.target !== '_self') return true;
      if (a.dataset.whatsapp !== undefined) return true;
      return false;
    };

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (shouldSkip(a)) return;
      const href = a.getAttribute('href');
      if (!href) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(() => { window.location.href = href; }, 230);
    });
  };

  /* ── CURSOR GLOW ──────────────────────────────────────── */
  const enableCursorGlow = () => {
    const el = $('#cursorGlow');
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      el.style.display = 'none';
      return;
    }
    let tx = 0, ty = 0, cx = 0, cy = 0;

    document.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
    }, { passive: true });

    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      cx = lerp(cx, tx, 0.1);
      cy = lerp(cy, ty, 0.1);
      el.style.left = cx + 'px';
      el.style.top  = cy + 'px';
      requestAnimationFrame(tick);
    };
    tick();
  };

  /* ── HEADER ELEVATE ───────────────────────────────────── */
  const enableHeaderElevate = () => {
    const header = $('[data-elevate]');
    if (!header) return;
    const update = () => header.classList.toggle('is-elevated', window.scrollY > 10);
    update();
    window.addEventListener('scroll', update, { passive: true });
  };

  /* ── MOBILE NAV ───────────────────────────────────────── */
  const enableNav = () => {
    const nav    = $('.nav');
    const toggle = $('[data-nav-toggle]');
    const panel  = $('[data-nav-panel]');
    if (!nav || !toggle || !panel) return;

    const close = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('nav-open');
    };
    const open = () => {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('nav-open');
    };

    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => nav.classList.contains('is-open') ? close() : open());

    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('is-open')) return;
      if (!e.target.closest('.nav')) close();
    });

    panel.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  };

  /* ── SMOOTH ANCHORS ───────────────────────────────────── */
  const enableSmoothAnchors = () => {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const el = document.getElementById(href.slice(1));
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
      history.replaceState(null, '', href);
    });
  };

  /* ── SCROLL REVEAL ────────────────────────────────────── */
  const enableReveal = () => {
    const els = $$('[data-reveal]');
    if (!els.length) return;

    const reveal = (el) => {
      const delay = el.getAttribute('data-reveal-delay');
      if (delay) el.style.transitionDelay = `${parseInt(delay) / 1000}s`;
      setTimeout(() => el.classList.add('is-revealed'), 0);
    };

    if (!('IntersectionObserver' in window)) {
      els.forEach(reveal);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

    els.forEach((el) => io.observe(el));
  };

  /* ── BUTTON PRESS FX ──────────────────────────────────── */
  const enablePressFx = () => {
    if (prefersReduced) return;
    document.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('[data-press], .btn');
      if (!btn) return;
      if (!btn.animate) return;
      btn.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(0.97) translateY(1px)' }, { transform: 'scale(1)' }],
        { duration: 200, easing: 'cubic-bezier(.2,.9,.2,1)' }
      );
    });
  };

  /* ── TESTIMONIAL SLIDER ───────────────────────────────── */
  const enableSlider = () => {
    const track   = $('[data-slider-track]');
    const dotsEl  = $('[data-slider-dots]');
    const prevBtn = $('[data-slider-prev]');
    const nextBtn = $('[data-slider-next]');
    if (!track) return;

    const items = $$('.testi', track);
    if (!items.length) return;

    let current = 0;
    let autoTimer = null;

    // Build dots
    if (dotsEl) {
      items.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(dot);
      });
    }

    const getDots = () => dotsEl ? $$('.slider-dot', dotsEl) : [];

    const goTo = (idx) => {
      current = (idx + items.length) % items.length;
      const item = items[current];
      const itemWidth = item.getBoundingClientRect().width;
      const gap = 20;
      track.scrollTo({ left: current * (itemWidth + gap), behavior: 'smooth' });
      getDots().forEach((d, i) => d.classList.toggle('is-active', i === current));
    };

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    // Autoplay
    if (!prefersReduced) {
      const start = () => { autoTimer = setInterval(next, 5000); };
      const stop  = () => { clearInterval(autoTimer); };

      start();
      track.addEventListener('pointerenter', stop);
      track.addEventListener('pointerleave', start);
      track.addEventListener('focusin', stop);
      track.addEventListener('focusout', start);
    }

    // Sync dots on scroll
    const syncDots = () => {
      const gap = 20;
      const w = items[0] ? items[0].getBoundingClientRect().width + gap : 0;
      if (!w) return;
      current = Math.round(track.scrollLeft / w);
      getDots().forEach((d, i) => d.classList.toggle('is-active', i === current));
    };
    track.addEventListener('scroll', syncDots, { passive: true });
  };

  /* ── STICKY CTA ───────────────────────────────────────── */
  const enableStickyCta = () => {
    const cta = $('[data-sticky-cta]');
    if (!cta) return;

    const update = () => {
      const scrolled = window.scrollY > 400;
      cta.classList.toggle('is-visible', scrolled);
      cta.classList.toggle('is-hidden', !scrolled);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  };

  /* ── WHATSAPP WIRING ──────────────────────────────────── */
  /*
   * Handles all [data-whatsapp] links including:
   *   - Inline buttons throughout all pages
   *   - Floating WhatsApp button (.wa-float)
   * Replace '{Phone Number}' with actual digits, e.g. '923001234567'
   */
  const enableWhatsApp = () => {
    const buttons = $$('[data-whatsapp]');
    if (!buttons.length) return;

    const page = document.body.getAttribute('data-page') || 'home';
    const phonePlaceholder = '{Phone Number}';
    const digits = phonePlaceholder.replace(/\D/g, '');
    const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/';

    const msg = encodeURIComponent(
      `Hello {Buisness Name}, I'd like to book an appointment.\n(Enquiry from: ${page} page)`
    );

    buttons.forEach((btn) => {
      btn.setAttribute('rel', 'noopener');
      btn.setAttribute('target', '_blank');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`${base}?text=${msg}`, '_blank', 'noopener,noreferrer');
      });
    });
  };

  /* ── FLOATING WHATSAPP BUTTON ─────────────────────────── */
  /*
   * The .wa-float button in HTML has data-whatsapp so enableWhatsApp() covers it.
   * This function adds extra polish: entrance animation on scroll + pulse ring.
   */
  const enableWaFloat = () => {
    const btn = $('.wa-float');
    if (!btn) return;

    // Show button with slight entrance delay
    btn.style.opacity = '0';
    btn.style.transform = 'scale(0.6)';
    btn.style.transition = 'opacity .4s ease, transform .4s ease, background .2s, box-shadow .3s';

    setTimeout(() => {
      btn.style.opacity = '1';
      btn.style.transform = 'scale(1)';
    }, 600);

    // Subtle pulse ring to draw attention (added once)
    if (!prefersReduced) {
      const ring = document.createElement('span');
      ring.setAttribute('aria-hidden', 'true');
      ring.style.cssText = `
        position:absolute;inset:-6px;border-radius:50%;
        border:2px solid rgba(37,211,102,.45);
        animation:waPulseRing 2.5s ease-out infinite;
        pointer-events:none;
      `;
      btn.style.position = 'fixed'; // ensure position context
      btn.appendChild(ring);

      // Inject keyframes if not present
      if (!document.getElementById('wa-ring-style')) {
        const style = document.createElement('style');
        style.id = 'wa-ring-style';
        style.textContent = `
          @keyframes waPulseRing {
            0%   { transform: scale(1); opacity: .7; }
            80%  { transform: scale(1.55); opacity: 0; }
            100% { transform: scale(1.55); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
    }
  };

  /* ── TABS (about page) ────────────────────────────────── */
  const enableTabs = () => {
    const containers = $$('[data-tabs]');
    containers.forEach((container) => {
      const btns   = $$('.tab-btn', container);
      const panels = $$('.tab-panel', container);

      btns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-tab');
          btns.forEach((b) => {
            b.classList.toggle('active', b === btn);
            b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
          });
          panels.forEach((p) => {
            const isTarget = p.getAttribute('data-panel') === target;
            p.classList.toggle('active', isTarget);
            if (isTarget && !prefersReduced) {
              p.animate(
                [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
                { duration: 260, easing: 'cubic-bezier(.25,.46,.45,.94)', fill: 'forwards' }
              );
            }
          });
        });
      });
    });
  };

  /* ── COUNTER ANIMATION (about page) ──────────────────── */
  const enableCounters = () => {
    if (prefersReduced) return;
    const nums = $$('[data-count]');
    if (!nums.length) return;

    const animateCounter = (el) => {
      const target = parseFloat(el.getAttribute('data-count'));
      const isDecimal = target % 1 !== 0;
      const duration = 1400;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const value = target * ease;
        el.textContent = isDecimal ? value.toFixed(1) : Math.floor(value).toString();
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = isDecimal ? target.toFixed(1) : target.toString();
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      nums.forEach(animateCounter);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    nums.forEach((el) => io.observe(el));
  };

  /* ── FORM VALIDATION (contact page — kept for legacy) ─── */
  const enableForm = () => {
    const form = $('#bookingForm');
    if (!form) return;

    const nameInput  = $('#fname', form);
    const phoneInput = $('#fphone', form);
    const submitBtn  = $('#submitBtn', form);
    const successEl  = $('#formSuccess', form);
    const nameErr    = $('#nameErr', form);
    const phoneErr   = $('#phoneErr', form);

    const setError = (input, errEl, msg) => {
      input.classList.add('is-error');
      if (errEl) errEl.textContent = msg;
    };
    const clearError = (input, errEl) => {
      input.classList.remove('is-error');
      if (errEl) errEl.textContent = '';
    };

    if (nameInput) {
      nameInput.addEventListener('input', () => {
        if (nameInput.value.trim().length >= 2) clearError(nameInput, nameErr);
      });
    }
    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        const v = phoneInput.value.replace(/\D/g, '');
        if (v.length >= 8) clearError(phoneInput, phoneErr);
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      if (!nameInput || nameInput.value.trim().length < 2) {
        if (nameInput) setError(nameInput, nameErr, 'Please enter your full name.');
        valid = false;
      } else {
        if (nameInput) clearError(nameInput, nameErr);
      }

      const phoneVal = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';
      if (phoneVal.length < 8) {
        if (phoneInput) setError(phoneInput, phoneErr, 'Please enter a valid phone number.');
        valid = false;
      } else {
        if (phoneInput) clearError(phoneInput, phoneErr);
      }

      if (!valid) return;

      if (submitBtn) submitBtn.disabled = true;
      const labelEl = submitBtn ? submitBtn.querySelector('.submit-text') : null;
      if (labelEl) labelEl.textContent = 'Sending…';

      setTimeout(() => {
        form.querySelectorAll('.form-group').forEach(g => g.style.display = 'none');
        const rowEl = form.querySelector('.form-row');
        if (rowEl) rowEl.style.display = 'none';
        const divider = form.querySelector('.booking-divider');
        if (divider) divider.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'none';
        const note = form.querySelector('.form-note');
        if (note) note.style.display = 'none';

        if (successEl) {
          successEl.removeAttribute('hidden');
          if (!prefersReduced) {
            successEl.animate(
              [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
              { duration: 380, easing: 'cubic-bezier(.25,.46,.45,.94)', fill: 'forwards' }
            );
          }
        }
      }, 900);
    });
  };

  /* ── SERVICE CARD HOVER FX ────────────────────────────── */
  const enableServiceHover = () => {
    if (prefersReduced) return;
    $$('.service-tile-full').forEach((tile) => {
      tile.addEventListener('mouseenter', () => {
        tile.style.transition = 'transform .3s ease, border-color .3s, box-shadow .3s';
      });
    });
  };

  /* ── IMAGE FALLBACK ───────────────────────────────────── */
  /*
   * Ensures broken images gracefully fall back to a placeholder
   * so hero/service images never appear as broken icons.
   */
  const enableImageFallbacks = () => {
    const FALLBACK = 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=720&q=80&auto=format&fit=crop';

    $$('img').forEach((img) => {
      // Skip images that already have onerror set
      if (img.getAttribute('onerror')) return;

      img.addEventListener('error', () => {
        if (img.src !== FALLBACK) {
          img.src = FALLBACK;
        }
      }, { once: true });
    });
  };

  /* ── JOURNEY STEPS — no-op; CSS grid handles layout ──── */
  const enableJourneySteps = () => {
    // journey-steps-grid is handled entirely by CSS grid.
    // Staggered reveal is handled by data-reveal / data-reveal-delay on each card.
    // Nothing extra needed here.
  };

  /* ── TIMELINE REVEAL ──────────────────────────────────── */
  const enableTimelineReveal = () => {
    // Timeline items get staggered reveal via data-reveal — handled by enableReveal()
    // No additional JS needed.
  };

  /* ── INIT ─────────────────────────────────────────────── */
  const init = () => {
    boot();
    enablePageTransitions();
    enableCursorGlow();
    enableHeaderElevate();
    enableNav();
    enableSmoothAnchors();
    enableReveal();
    enablePressFx();
    enableSlider();
    enableStickyCta();
    enableWhatsApp();      // wires ALL [data-whatsapp] including .wa-float
    enableWaFloat();       // entrance animation + pulse ring for .wa-float
    enableTabs();
    enableCounters();
    enableForm();
    enableServiceHover();
    enableImageFallbacks();
    enableJourneySteps();
    enableTimelineReveal();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();