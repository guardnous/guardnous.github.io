/* ============================================
   GuardNous Landing Page — Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Navbar scroll effect ---
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile nav toggle ---
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = navbar.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Scroll reveal (Intersection Observer) ---
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach(el => observer.observe(el));
  }

  // --- Animated counters ---
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
      const current = Math.round(eased * target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // --- Feature card mouse glow ---
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
      card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  });

  // --- Typing effect for hero subtitle ---
  const typingEl = document.querySelector('.typing-text');
  if (typingEl) {
    const phrases = [
      'IaC Security',
      'Cloud Posture',
      'Compliance',
      'AI-Powered Remediation'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function type() {
      const current = phrases[phraseIndex];
      if (deleting) {
        typingEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(type, 400);
          return;
        }
      } else {
        typingEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(type, 2200);
          return;
        }
      }
      setTimeout(type, deleting ? 40 : 80);
    }
    setTimeout(type, 1000);
  }

  // --- Screenshot viewer: opens in place, with zoom, instead of a new tab ---
  const shots = Array.from(document.querySelectorAll('.shot'));
  if (shots.length) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Screenshot viewer');
    box.innerHTML =
      '<div class="lightbox-bar">' +
        '<span class="lightbox-title"></span>' +
        '<button type="button" class="lightbox-btn" data-act="prev" aria-label="Previous screenshot">&#8249;</button>' +
        '<button type="button" class="lightbox-btn" data-act="next" aria-label="Next screenshot">&#8250;</button>' +
        '<button type="button" class="lightbox-btn" data-act="out" aria-label="Zoom out">&minus;</button>' +
        '<span class="lightbox-zoom" aria-live="polite"></span>' +
        '<button type="button" class="lightbox-btn" data-act="in" aria-label="Zoom in">+</button>' +
        '<button type="button" class="lightbox-btn" data-act="fit" aria-label="Fit to screen">&#10530;</button>' +
        '<button type="button" class="lightbox-btn" data-act="close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="lightbox-stage"><img alt=""></div>';
    document.body.appendChild(box);

    const stage = box.querySelector('.lightbox-stage');
    const img = stage.querySelector('img');
    const title = box.querySelector('.lightbox-title');
    const zoomLabel = box.querySelector('.lightbox-zoom');
    let index = 0, zoom = 1, opener = null;

    // zoom 1 = the whole image fits the stage; larger values scroll.
    const fitWidth = () => {
      const w = stage.clientWidth - 32, h = stage.clientHeight - 32;
      const ratio = (img.naturalWidth || 16) / (img.naturalHeight || 10);
      return Math.min(w, h * ratio, img.naturalWidth || w);
    };
    const apply = () => {
      img.style.width = Math.round(fitWidth() * zoom) + 'px';
      zoomLabel.textContent = Math.round(zoom * 100) + '%';
      stage.classList.toggle('zoomed', zoom > 1);
    };
    const setZoom = (z) => { zoom = Math.min(4, Math.max(1, z)); apply(); };
    const show = (i) => {
      index = (i + shots.length) % shots.length;
      const shot = shots[index];
      zoom = 1;
      img.onload = apply;
      img.src = shot.getAttribute('href');
      img.alt = shot.querySelector('img').alt;
      title.textContent = shot.querySelector('.shot-caption').textContent.trim();
      apply();
    };
    const open = (i, from) => {
      opener = from;
      box.classList.add('open');
      document.body.classList.add('lightbox-open');
      show(i);
      box.querySelector('[data-act="close"]').focus();
    };
    const close = () => {
      box.classList.remove('open');
      document.body.classList.remove('lightbox-open');
      img.removeAttribute('src');
      if (opener) opener.focus();
    };

    shots.forEach((shot, i) => shot.addEventListener('click', (e) => { e.preventDefault(); open(i, shot); }));
    box.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (act) {
        const a = act.dataset.act;
        if (a === 'close') close();
        if (a === 'prev') show(index - 1);
        if (a === 'next') show(index + 1);
        if (a === 'in') setZoom(zoom + 0.5);
        if (a === 'out') setZoom(zoom - 0.5);
        if (a === 'fit') setZoom(1);
      } else if (e.target === stage) {
        close();
      }
    });
    img.addEventListener('click', () => { if (!moved) setZoom(zoom > 1 ? 1 : 2); });
    stage.addEventListener('wheel', (e) => {
      if (!e.ctrlKey && !e.metaKey) return; // plain wheel scrolls; Ctrl or pinch zooms
      e.preventDefault();
      setZoom(zoom + (e.deltaY < 0 ? 0.25 : -0.25));
    }, { passive: false });

    // Drag to pan when zoomed in.
    let drag = null, moved = false;
    stage.addEventListener('pointerdown', (e) => {
      moved = false;
      if (zoom <= 1 || e.target !== img) return;
      drag = { x: e.clientX, y: e.clientY, left: stage.scrollLeft, top: stage.scrollTop };
      stage.classList.add('dragging');
      e.preventDefault();
    });
    window.addEventListener('pointermove', (e) => {
      if (!drag) return;
      if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 4) moved = true;
      stage.scrollLeft = drag.left - (e.clientX - drag.x);
      stage.scrollTop = drag.top - (e.clientY - drag.y);
    });
    window.addEventListener('pointerup', () => { drag = null; stage.classList.remove('dragging'); });

    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === '+' || e.key === '=') setZoom(zoom + 0.5);
      if (e.key === '-') setZoom(zoom - 0.5);
      if (e.key === 'Tab') { // keep focus inside the viewer
        const btns = Array.from(box.querySelectorAll('button'));
        const first = btns[0], last = btns[btns.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', () => { if (box.classList.contains('open')) apply(); });
  }

});
