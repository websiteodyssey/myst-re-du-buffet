'use strict';

(function navScroll() {
  var nav = document.getElementById('nav');
  if (!nav) return;
  function update() {
    var s = window.scrollY > 60;
    nav.classList.toggle('scrolled', s);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

(function mobileMenu() {
  var ham = document.getElementById('ham');
  var mn  = document.getElementById('mnav');
  var cls = document.getElementById('mclose');
  if (!ham || !mn) return;
  function open(v) { mn.classList.toggle('open', v); ham.classList.toggle('active', v); }
  ham.addEventListener('click', function () { open(!mn.classList.contains('open')); });
  if (cls) cls.addEventListener('click', function () { open(false); });
  mn.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { open(false); }); });
})();

(function activeLink() {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function (a) {
    if ((a.getAttribute('href') || '').split('/').pop() === page) a.classList.add('active');
  });
})();

(function reveal() {
  var els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  if (!window.IntersectionObserver) {
    els.forEach(function (e) { e.style.opacity = 1; e.style.transform = 'none'; });
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var el = e.target;
        var delay = el.getAttribute('data-reveal-delay') || 0;
        setTimeout(function () { el.classList.add('revealed'); }, +delay);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(function (e) { obs.observe(e); });
})();

(function tabs() {
  document.querySelectorAll('[data-tab-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = btn.closest('[data-tabs]');
      if (!group) return;
      var id = btn.getAttribute('data-tab-btn');
      group.querySelectorAll('[data-tab-btn]').forEach(function (b) { b.classList.remove('active'); });
      group.querySelectorAll('[data-tab-panel]').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = group.querySelector('[data-tab-panel="' + id + '"]');
      if (panel) panel.classList.add('active');
    });
  });
})();

(function lang() {
  var cur = localStorage.getItem('mdb-lang') || 'fr';
  function apply(l) {
    cur = l;
    localStorage.setItem('mdb-lang', l);
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang-btn') === l);
    });
    document.querySelectorAll('[data-' + l + ']').forEach(function (el) {
      var v = el.getAttribute('data-' + l);
      if (!v) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        var ph = el.getAttribute('data-ph-' + l);
        if (ph) el.placeholder = ph;
      } else if (el.tagName === 'OPTION') {
        el.textContent = v;
      } else {
        el.innerHTML = v;
      }
    });
  }
  document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () { apply(btn.getAttribute('data-lang-btn')); });
  });
  apply(cur);
})();

document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

(function formSubmit() {
  var form = document.getElementById('resa-form');
  if (!form) return;
  var btn = form.querySelector('.f-submit');
  if (!btn) return;
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    var l = localStorage.getItem('mdb-lang') || 'fr';
    btn.textContent = l === 'fr' ? 'Envoy\u00e9' : 'Sent';
    btn.disabled = true;
    btn.style.opacity = '0.6';
    var msg = l === 'fr'
      ? 'Votre demande a \u00e9t\u00e9 envoy\u00e9e. Nous vous contacterons dans les 24 heures.'
      : 'Your request has been sent. We will contact you within 24 hours.';
    alert(msg);
  });
})();
