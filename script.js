/* ============================================================
   ANAND CLASSES — Interactivity
   ============================================================ */
(() => {
  'use strict';

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header state ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 12) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  const closeNav = () => {
    mainNav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('click', (e) => {
    if (mainNav.classList.contains('is-open') &&
        !mainNav.contains(e.target) &&
        !navToggle.contains(e.target)) {
      closeNav();
    }
  });

  /* ---------- Scroll-reveal for highlighter-swipe headings ---------- */
  const highlights = document.querySelectorAll('.highlight[data-highlight]');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-swiped'), 150);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    highlights.forEach((el) => revealObserver.observe(el));
  } else {
    highlights.forEach((el) => el.classList.add('is-swiped'));
  }

  /* ---------- Hero photo-card parallax tilt ---------- */
  const photoCard = document.getElementById('photoCard');
  const heroVisual = document.querySelector('.hero-visual');

  if (photoCard && heroVisual && window.matchMedia('(min-width: 960px)').matches) {
    let rafId = null;

    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rotateY = x * 10;
        const rotateX = y * -10;
        photoCard.style.transform =
          `rotate(3deg) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      });
    });

    heroVisual.addEventListener('mouseleave', () => {
      photoCard.style.transform = 'rotate(3deg) rotateY(0deg) rotateX(0deg)';
    });
  }

  /* ---------- Testimonials slider ---------- */
  const track = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('testimonialDots');

  if (track && dotsWrap) {
    const slides = Array.from(track.children);
    let perView = getPerView();
    let index = 0;
    let autoTimer = null;

    function getPerView() {
      const w = window.innerWidth;
      if (w <= 640) return 1;
      if (w <= 1080) return 2;
      return 3;
    }

    function maxIndex() {
      return Math.max(0, slides.length - perView);
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      const dotCount = maxIndex() + 1;
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Show testimonial group ${i + 1}`);
        if (i === index) dot.classList.add('is-active');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function update() {
      const slideWidth = slides[0].getBoundingClientRect().width;
      const gap = 22;
      track.style.transform = `translateX(-${index * (slideWidth + gap)}px)`;
      Array.from(dotsWrap.children).forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function goTo(i) {
      index = Math.min(Math.max(i, 0), maxIndex());
      update();
      restartAuto();
    }

    function next() {
      index = index >= maxIndex() ? 0 : index + 1;
      update();
    }

    function restartAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(next, 5500);
    }

    window.addEventListener('resize', () => {
      const newPerView = getPerView();
      if (newPerView !== perView) {
        perView = newPerView;
        index = 0;
        buildDots();
      }
      update();
    });

    buildDots();
    update();
    restartAuto();

    track.addEventListener('mouseenter', () => autoTimer && clearInterval(autoTimer));
    track.addEventListener('mouseleave', restartAuto);
  }

  /* ---------- FAQ accordion ---------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      faqItems.forEach((other) => {
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      question.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contactForm');
  const successEl = document.getElementById('formSuccess');

  if (form) {
    const fields = {
      parentName: {
        el: form.querySelector('#parentName'),
        validate: (v) => v.trim().length >= 2,
        message: 'Please enter a name (at least 2 characters).'
      },
      phone: {
        el: form.querySelector('#phone'),
        validate: (v) => /^[6-9]\d{9}$/.test(v.trim()),
        message: 'Please enter a valid 10-digit mobile number.'
      },
      std: {
        el: form.querySelector('#std'),
        validate: (v) => v.trim().length > 0,
        message: 'Please select a class.'
      }
    };

    function setError(name, message) {
      const row = fields[name].el.closest('.form-row');
      const errorEl = form.querySelector(`[data-error-for="${name}"]`);
      if (message) {
        row.classList.add('has-error');
        errorEl.textContent = message;
      } else {
        row.classList.remove('has-error');
        errorEl.textContent = '';
      }
    }

    Object.keys(fields).forEach((name) => {
      const { el, validate, message } = fields[name];
      el.addEventListener('blur', () => {
        setError(name, validate(el.value) ? '' : message);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      Object.keys(fields).forEach((name) => {
        const { el, validate, message } = fields[name];
        const ok = validate(el.value);
        setError(name, ok ? '' : message);
        if (!ok) isValid = false;
      });

      if (!isValid) {
        successEl.textContent = '';
        return;
      }

      successEl.textContent =
        "Thanks! We've received your request and will call you shortly to confirm the demo class.";
      form.reset();

      setTimeout(() => {
        successEl.textContent = '';
      }, 6000);
    });
  }

})();
