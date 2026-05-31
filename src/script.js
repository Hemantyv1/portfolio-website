(function () {
  'use strict';

  // ── Theme toggle ──────────────────────────────────────────────────────────
  var themeToggle = document.getElementById('themeToggle');
  var htmlEl = document.documentElement;
  htmlEl.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = htmlEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      htmlEl.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // ── Scroll Reveal ─────────────────────────────────────────────────────────
  function initScrollReveal() {
    var els = document.querySelectorAll('.reveal:not([data-observed])');
    if (!els.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
          setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) {
      el.setAttribute('data-observed', 'true');
      obs.observe(el);
    });
  }

  // ── Skill Tags ────────────────────────────────────────────────────────────
  function initSkillTags() {
    document.querySelectorAll('.skill-tag').forEach(function (t) {
      t.classList.add('tag-visible');
      t.style.opacity = '1';
      t.style.transform = 'translateY(0)';
    });
  }

  // ── Tab switching ─────────────────────────────────────────────────────────
  var aboutBtn = document.getElementById('about-btn');
  var projectsBtn = document.getElementById('projects-btn');
  var aboutContent = document.getElementById('about-content');
  var projectsContent = document.getElementById('projects-content');

  function hideAll() {
    document.querySelectorAll('.tab-content').forEach(function (s) { s.classList.remove('active'); });
    document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
  }

  function showAbout() {
    hideAll();
    aboutContent && aboutContent.classList.add('active');
    aboutBtn && (aboutBtn.style.display = 'none');
    projectsBtn && (projectsBtn.style.display = 'block');
    initScrollReveal();
    initSkillTags();
  }

  function showProjects() {
    hideAll();
    projectsContent && projectsContent.classList.add('active');
    projectsBtn && (projectsBtn.style.display = 'none');
    aboutBtn && (aboutBtn.style.display = 'block');
  }

  if (projectsBtn) projectsBtn.addEventListener('click', showProjects);
  if (aboutBtn) aboutBtn.addEventListener('click', showAbout);

  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      hideAll();
      aboutBtn && (aboutBtn.style.display = 'block');
      projectsBtn && (projectsBtn.style.display = 'block');
      var el = document.getElementById(btn.getAttribute('data-tab'));
      if (el) el.classList.add('active');
      btn.classList.add('active');
    });
  });

  // ── Contact form (Formspree) ──────────────────────────────────────────────
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var status = document.getElementById('formStatus');
      var btn = contactForm.querySelector('.submit-btn');
      btn.disabled = true;
      btn.textContent = 'Sending...';
      try {
        var res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          status.textContent = "Message sent! I'll get back to you soon.";
          status.className = 'form-status success';
          contactForm.style.display = 'none';
        } else {
          throw new Error('failed');
        }
      } catch (_) {
        status.textContent = 'Something went wrong. Email me directly at hemants1n3h@gmail.com';
        status.className = 'form-status error';
        btn.disabled = false;
        btn.textContent = 'Send Message';
      }
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    if (aboutBtn) aboutBtn.style.display = 'none';
    if (projectsBtn) projectsBtn.style.display = 'block';
    initScrollReveal();
    initSkillTags();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
