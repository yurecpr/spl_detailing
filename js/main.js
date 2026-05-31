/* =========================================
   Speed-Detailing – main.js v2
   - Sticky header
   - Mobile burger
   - Scroll reveal (IntersectionObserver)
   - FAQ accordion
   - Gallery filter
   - Contact form (Web3Forms)
   - Logo fallback
   ========================================= */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ── Hero slideshow (Ken Burns) ── */
  const slides = $$('.hero__slide');
  if (slides.length > 1) {
    let current = 0;
    setInterval(() => {
      slides[current].classList.remove('active');

      current = (current + 1) % slides.length;

      // Restart Ken Burns animation on the NEW slide
      slides[current].style.animation = 'none';
      void slides[current].offsetWidth; // reflow
      slides[current].style.animation = '';
      slides[current].classList.add('active');
    }, 6000);
  }

  /* ── Sticky header ── */
  const header = $('#header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile burger ── */
  const burger = $('#burger');
  const nav    = $('#nav');
  const toggleNav = (open) => {
    nav.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggleNav(!nav.classList.contains('open')));
  $$('.nav__link').forEach(l => l.addEventListener('click', () => toggleNav(false)));
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && e.target !== burger)
      toggleNav(false);
  });

  /* ── Scroll Reveal ── */
  const revealEls = $$('[data-reveal]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.revealDelay || '0', 10);
      setTimeout(() => el.classList.add('revealed'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => observer.observe(el));

  /* ── Smooth scroll with header offset ── */
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  /* ── FAQ accordion ── */
  $$('.faq__item').forEach(item => {
    const btn = $('.faq__q', item);
    const ans = $('.faq__a', item);
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      $$('.faq__item').forEach(i => {
        i.classList.remove('open');
        $('.faq__a', i).classList.remove('open');
        $('.faq__q', i).setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        ans.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Gallery filter ── */
  const filters = $$('.gallery__filter');
  const galleryItems = $$('.gallery__item');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !match);
      });
    });
  });

  /* ── Logo fallback ── */
  $$('.logo__img').forEach(img => {
    const showFallback = () => {
      img.style.display = 'none';
      const fb = img.closest('.logo')?.querySelector('.logo__fallback');
      if (fb) fb.style.display = 'block';
    };
    img.addEventListener('error', showFallback);
    if (img.complete && img.naturalWidth === 0) showFallback();
  });

  /* ── Contact form – Web3Forms ── */
  const form      = $('#contactForm');
  const statusEl  = $('#formStatus');
  const submitBtn = $('#submitBtn');
  const setStatus = (msg, type) => {
    statusEl.textContent = msg;
    statusEl.className = 'form__status ' + type;
  };

  const sendCustomerConfirmation = async (endpoint, payload) => {
    if (!endpoint) return;
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // The lead is already saved via Web3Forms; do not fail UX if confirmation mail fails.
    }
  };

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name  = $('#name').value.trim();
      const phone = $('#phone').value.trim();
      if (!name || !phone) {
        setStatus('Bitte füllen Sie Name und Telefon aus.', 'error');
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet…';
      setStatus('', '');
      const json = {};
      new FormData(form).forEach((v, k) => (json[k] = v));
      const confirmEndpoint = (form.dataset.confirmEndpoint || '').trim();
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(json),
        });
        const result = await res.json();
        if (result.success) {
          await sendCustomerConfirmation(confirmEndpoint, {
            name,
            email: $('#email').value.trim(),
            phone,
            service: ($('#service').value || '').trim(),
          });
          setStatus('✓ Danke! Ihre Anfrage ist angekommen. Wir melden uns bald.', 'success');
          form.reset();
        } else {
          setStatus('Fehler beim Senden. Bitte schreiben Sie uns direkt.', 'error');
        }
      } catch {
        setStatus('Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Anfrage senden';
      }
    });
  }
})();
