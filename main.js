(function () {
  'use strict';

  const preloader = document.getElementById('preloader');
  const header = document.getElementById('cinemaHeader');
  const menuBtn = document.getElementById('menuBtn');
  const cinemaNav = document.getElementById('cinemaNav');
  const contactForm = document.getElementById('contactForm');
  const scrollProgress = document.getElementById('scrollProgress');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Preloader ─── */
  document.body.classList.add('is-loading');

  function finishLoad() {
    preloader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    initAnimations();
  }

  window.addEventListener('load', () => {
    setTimeout(finishLoad, prefersReducedMotion ? 100 : 2200);
  });

  /* ─── Scroll progress ─── */
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  /* ─── Header scroll state ─── */
  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ─── Mobile menu ─── */
  menuBtn.addEventListener('click', () => {
    const open = cinemaNav.classList.toggle('open');
    menuBtn.classList.toggle('active');
    menuBtn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  cinemaNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      cinemaNav.classList.remove('open');
      menuBtn.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ─── Contact form ─── */
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = '已送出！';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      contactForm.reset();
    }, 2500);
  });

  /* ─── HUD counters ─── */
  function animateHudCounters() {
    document.querySelectorAll('[data-hud-counter]').forEach(el => {
      const target = parseInt(el.dataset.hudCounter, 10);
      const duration = 2000;
      const start = performance.now();

      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  }

  /* ─── Count-up for stats ─── */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ─── Intersection reveals (fallback + base) ─── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-scale').forEach(el => {
    if (!el.closest('.hero-cinema')) {
      revealObserver.observe(el);
    }
  });

  document.querySelectorAll('[data-count]').forEach(el => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        animateCount(el);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  const processEl = document.querySelector('.process-cinema');
  if (processEl) {
    const processObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        processEl.classList.add('is-active');
        processObs.disconnect();
      }
    }, { threshold: 0.4 });
    processObs.observe(processEl);
  }

  /* ─── Parallax hero ─── */
  function initParallax() {
    if (prefersReducedMotion) return;

    const layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length) return;

    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroH = document.getElementById('hero')?.offsetHeight || window.innerHeight;
        if (scrollY > heroH) {
          ticking = false;
          return;
        }
        const progress = scrollY / heroH;
        layers.forEach(layer => {
          const speed = parseFloat(layer.dataset.parallax) || 0.3;
          layer.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
        });
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─── GSAP animations ─── */
  function initAnimations() {
    animateHudCounters();
    initParallax();

    if (prefersReducedMotion || typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    /* Chapter titles scale in */
    gsap.utils.toArray('[data-chapter]').forEach(ch => {
      gsap.from(ch.querySelector('.chapter-interstitial__title'), {
        scrollTrigger: {
          trigger: ch,
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        },
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
      });
    });

    /* Service panels slide */
    gsap.utils.toArray('.service-cinema').forEach((panel, i) => {
      gsap.from(panel.querySelector('.service-cinema__media'), {
        scrollTrigger: {
          trigger: panel,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        x: i % 2 === 0 ? -60 : 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
      });
      gsap.from(panel.querySelector('.service-cinema__content'), {
        scrollTrigger: {
          trigger: panel,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        x: i % 2 === 0 ? 60 : -60,
        opacity: 0,
        duration: 1.2,
        delay: 0.15,
        ease: 'power3.out'
      });
    });

    /* Gallery items stagger */
    gsap.from('.gallery-cinema__item', {
      scrollTrigger: {
        trigger: '.gallery-cinema',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 80,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out'
    });

    /* Case cards parallax zoom on scroll */
    gsap.utils.toArray('.case-card').forEach(card => {
      const bg = card.querySelector('.case-card__bg img');
      if (!bg) return;
      gsap.to(bg, {
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        },
        scale: 1.15,
        ease: 'none'
      });

      gsap.from(card.querySelector('.case-card__content'), {
        scrollTrigger: {
          trigger: card,
          start: 'top 60%',
          toggleActions: 'play none none reverse'
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    });

    /* Team cards stagger */
    gsap.from('.team-card', {
      scrollTrigger: {
        trigger: '.team-cinema__grid',
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });

    /* Quote text cinematic reveal */
    gsap.from('.quote-cinema__text', {
      scrollTrigger: {
        trigger: '.quote-cinema',
        start: 'top 70%',
        toggleActions: 'play none none reverse'
      },
      clipPath: 'inset(0 100% 0 0)',
      duration: 1.4,
      ease: 'power4.inOut'
    });

    /* Hero subtle zoom on scroll out */
    gsap.to('.hero-cinema__layer--mid', {
      scrollTrigger: {
        trigger: '.hero-cinema',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      scale: 1.08,
      opacity: 0.3,
      ease: 'none'
    });
  }

  /* Smooth anchor offset for fixed header */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
})();
