/* ============================================================
   NEXOCIALIX — script.js
   Premium Creative Digital Agency
   Clean, modular, production-ready JavaScript
   ============================================================ */

'use strict';

/* ============================================================
   UTILITY: DOM SELECTOR HELPERS
============================================================ */
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];


/* ============================================================
   1. NAVIGATION — SCROLL BEHAVIOR & MOBILE MENU
============================================================ */
const initNavigation = () => {
  const header       = $('#nav-header');
  const hamburger    = $('#hamburger');
  const mobileMenu   = $('#mobile-menu');
  const mobileClose  = $('#mobile-menu-close');
  const overlay      = $('#mobile-menu-overlay');
  const mobileLinks  = $$('.mobile-nav-link, .mobile-cta', mobileMenu);

  if (!header) return;

  // ── Scroll: add .scrolled class ──────────────────────────
  let lastScroll = 0;
  const onScroll = () => {
    const current = window.scrollY;
    if (current > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = current;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // ── Mobile Menu ──────────────────────────────────────────
  const openMenu = () => {
    mobileMenu.classList.add('open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  mobileClose?.addEventListener('click', closeMenu);

  // Close on link click
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });
};


/* ============================================================
   2. SCROLL REVEAL ANIMATIONS — INTERSECTION OBSERVER
============================================================ */
const initScrollReveal = () => {
  const elements = $$('.reveal-up');
  if (!elements.length) return;

  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Fire once only
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));
};


/* ============================================================
   3. ANIMATED STAT COUNTERS
============================================================ */
const initCounters = () => {
  const counters = $$('.stat-number[data-target]');
  if (!counters.length) return;

  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800; // ms
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.round(easedProgress * target);
      el.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => observer.observe(counter));
};


/* ============================================================
   4. SERVICES ACCORDION
============================================================ */
const initServicesAccordion = () => {
  const serviceItems = $$('.service-item');
  if (!serviceItems.length) return;

  serviceItems.forEach((item) => {
    const btn  = $('.service-row', item);
    const desc = $('.service-desc', item);

    if (!btn || !desc) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      serviceItems.forEach((otherItem) => {
        const otherBtn  = $('.service-row', otherItem);
        const otherDesc = $('.service-desc', otherItem);
        if (otherBtn && otherDesc && otherItem !== item) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherDesc.classList.remove('open');
        }
      });

      // Toggle current
      btn.setAttribute('aria-expanded', String(!isOpen));
      desc.classList.toggle('open', !isOpen);
    });
  });
};


/* ============================================================
   5. FAQ ACCORDION
============================================================ */
const initFaqAccordion = () => {
  const faqItems = $$('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const question = $('.faq-question', item);
    const answer   = $('.faq-answer', item);

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // Close all others
      faqItems.forEach((otherItem) => {
        const otherQ = $('.faq-question', otherItem);
        const otherA = $('.faq-answer', otherItem);
        if (otherQ && otherA && otherItem !== item) {
          otherQ.setAttribute('aria-expanded', 'false');
          otherA.classList.remove('open');
        }
      });

      // Toggle current
      question.setAttribute('aria-expanded', String(!isOpen));
      answer.classList.toggle('open', !isOpen);
    });

    // Keyboard support
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });
};


/* ============================================================
   6. TESTIMONIALS SLIDER
============================================================ */
const initTestimonialsSlider = () => {
  const slides      = $$('.testimonial-slide');
  const dots        = $$('.testimonial-dot');
  const prevBtn     = $('#testimonial-prev');
  const nextBtn     = $('#testimonial-next');

  if (!slides.length) return;

  let current = 0;
  let autoplayTimer = null;

  const goTo = (index) => {
    // Bounds check
    const newIndex = (index + slides.length) % slides.length;

    // Update slides
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    dots[current]?.setAttribute('aria-selected', 'false');

    current = newIndex;

    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
    dots[current]?.setAttribute('aria-selected', 'true');
  };

  // Previous / Next
  prevBtn?.addEventListener('click', () => {
    goTo(current - 1);
    resetAutoplay();
  });

  nextBtn?.addEventListener('click', () => {
    goTo(current + 1);
    resetAutoplay();
  });

  // Dot navigation
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index, 10);
      if (!isNaN(index)) {
        goTo(index);
        resetAutoplay();
      }
    });
  });

  // Keyboard navigation on dots
  dots.forEach((dot, i) => {
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        goTo(i + 1);
        dots[(i + 1) % slides.length]?.focus();
      } else if (e.key === 'ArrowLeft') {
        goTo(i - 1);
        dots[(i - 1 + slides.length) % slides.length]?.focus();
      }
    });
  });

  // Autoplay
  const startAutoplay = () => {
    autoplayTimer = setInterval(() => goTo(current + 1), 7000);
  };

  const resetAutoplay = () => {
    clearInterval(autoplayTimer);
    startAutoplay();
  };

  // Pause on hover
  const wrapper = $('.testimonials-wrapper');
  wrapper?.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  wrapper?.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
};


/* ============================================================
   7. SMOOTH ANCHOR SCROLL
============================================================ */
const initSmoothScroll = () => {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const targetEl = $(targetId);
    if (!targetEl) return;

    e.preventDefault();

    const headerHeight = 72; // nav height
    const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    });
  });
};


/* ============================================================
   8. CONTACT FORM — VALIDATION & SUBMISSION
============================================================ */
const initContactForm = () => {
  const form        = $('#contact-form');
  const successMsg  = $('#form-success');

  if (!form) return;

  const showError = (input, message) => {
    const existing = input.parentElement.querySelector('.field-error');
    if (existing) existing.remove();

    input.style.borderColor = '#c0392b';

    const err = document.createElement('span');
    err.className = 'field-error';
    err.style.cssText = 'font-size:0.75rem;color:#c0392b;margin-top:4px;display:block;';
    err.textContent = message;
    input.parentElement.appendChild(err);
  };

  const clearError = (input) => {
    const existing = input.parentElement.querySelector('.field-error');
    if (existing) existing.remove();
    input.style.borderColor = '';
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Live validation on blur
  $$('.form-input', form).forEach((input) => {
    input.addEventListener('blur', () => {
      if (!input.value.trim() && input.required) {
        showError(input, 'This field is required.');
      } else if (input.type === 'email' && input.value && !validateEmail(input.value)) {
        showError(input, 'Please enter a valid email address.');
      } else {
        clearError(input);
      }
    });

    input.addEventListener('input', () => {
      if (input.value.trim()) clearError(input);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    const nameInput    = $('#contact-name');
    const emailInput   = $('#contact-email');
    const serviceInput = $('#contact-service');
    const msgInput     = $('#contact-message');

    if (!nameInput.value.trim()) {
      showError(nameInput, 'Your name is required.');
      isValid = false;
    } else clearError(nameInput);

    if (!emailInput.value.trim()) {
      showError(emailInput, 'Your email is required.');
      isValid = false;
    } else if (!validateEmail(emailInput.value)) {
      showError(emailInput, 'Please enter a valid email address.');
      isValid = false;
    } else clearError(emailInput);

    if (!serviceInput.value) {
      showError(serviceInput, 'Please select a service.');
      isValid = false;
    } else clearError(serviceInput);

    if (!msgInput.value.trim()) {
      showError(msgInput, 'Please tell us about your project.');
      isValid = false;
    } else clearError(msgInput);

    if (!isValid) return;

    // Simulate form submission
    const submitBtn = form.querySelector('[type="submit"]');
    const btnText   = submitBtn.querySelector('.btn-text');

    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Sending…';

    await new Promise(resolve => setTimeout(resolve, 1200));

    // Show success
    form.style.display = 'none';
    successMsg.removeAttribute('hidden');
    successMsg.focus();
  });
};


/* ============================================================
   9. FOOTER YEAR
============================================================ */
const initFooterYear = () => {
  const yearEl = $('#footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
};


/* ============================================================
   10. ACTIVE NAV LINK ON SCROLL — INTERSECTION OBSERVER
============================================================ */
const initActiveNav = () => {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const setActive = (id) => {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${id}`) {
        link.style.color = 'var(--color-blue)';
        link.style.setProperty('--nav-underline', '100%');
      } else {
        link.style.color = '';
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: '-72px 0px -40% 0px',
    }
  );

  sections.forEach(section => observer.observe(section));
};


/* ============================================================
   11. PORTFOLIO HOVER — TOUCH SUPPORT
============================================================ */
const initPortfolioTouch = () => {
  // On touch devices, toggle overlay on tap
  if (window.matchMedia('(hover: none)').matches) return; // already handled by CSS

  const items = $$('.portfolio-item');
  items.forEach(item => {
    item.addEventListener('touchstart', () => {
      items.forEach(i => i.classList.remove('touch-hover'));
      item.classList.add('touch-hover');
    }, { passive: true });
  });
};


/* ============================================================
   12. PREFERS-COLOR-SCHEME / THEME (Future-proofing)
============================================================ */
const initTheme = () => {
  // Currently single-theme, but structure in place for future dark mode
  document.documentElement.setAttribute('data-theme', 'light');
};


/* ============================================================
   INITIALIZE ALL MODULES
============================================================ */
const init = () => {
  initTheme();
  initNavigation();
  initScrollReveal();
  initCounters();
  initServicesAccordion();
  initFaqAccordion();
  initTestimonialsSlider();
  initSmoothScroll();
  initContactForm();
  initFooterYear();
  initActiveNav();
  initPortfolioTouch();
};

// Run after DOM is fully parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
