'use strict';

/* ═══════════════════════════════════════
   CONTACT FORM — Formspree
═══════════════════════════════════════ */
(function initForm() {
  var form = document.getElementById('resa-form');
  if (!form) return;

  /* ── Formspree endpoint ──
     Replace VOTRE_ID_FORMSPREE with the ID from https://formspree.io
     e.g. "xpwzgkqo" → endpoint becomes https://formspree.io/f/xpwzgkqo
     Free plan: 50 submissions/month, no backend required.
  ─────────────────────────────────────── */
  var FORMSPREE_ID = 'VOTRE_ID_FORMSPREE';
  var ENDPOINT = 'https://formspree.io/f/' + FORMSPREE_ID;

  var btn    = form.querySelector('.f-submit');
  var note   = form.querySelector('.f-note');
  var inputs = form.querySelectorAll('input,select,textarea');
  if (!btn) return;

  btn.addEventListener('click', function(e) {
    e.preventDefault();

    /* basic validation */
    var lang = localStorage.getItem('mdb-lang') || 'fr';
    var missing = false;
    var required = ['prenom','nom','email','date','service','adultes'];
    inputs.forEach(function(el) {
      el.style.borderColor = '';
    });

    /* collect data */
    var data = {};
    inputs.forEach(function(el) {
      if (el.name) data[el.name] = el.value;
    });

    /* check required */
    ['prenom','nom','email'].forEach(function(n) {
      var el = form.querySelector('[name="'+n+'"]');
      if (el && !el.value.trim()) { el.style.borderColor='rgba(255,100,100,.6)'; missing=true; }
    });

    if (missing) {
      if (note) note.textContent = lang==='fr'
        ? 'Veuillez remplir au minimum : prénom, nom et email.'
        : 'Please fill in at least: first name, last name and email.';
      return;
    }

    /* UI: loading */
    btn.disabled = true;
    btn.textContent = lang==='fr' ? 'Envoi en cours...' : 'Sending...';
    btn.style.opacity = '.65';

    /* if Formspree not configured, fallback to mailto */
    if (FORMSPREE_ID === 'VOTRE_ID_FORMSPREE') {
      var body = encodeURIComponent(
        (data.prenom||'')+' '+(data.nom||'')+'\n'
        +'Email: '+(data.email||'')+'\n'
        +'Tel: '+(data.tel||'')+'\n'
        +'Date: '+(data.date||'')+' – '+(data.service||'')+'\n'
        +'Adultes: '+(data.adultes||'')+'  Enfants: '+(data.enfants||'')+'\n'
        +'Occasion: '+(data.occasion||'')+'\n'
        +'Message: '+(data.message||'')
      );
      window.location.href = 'mailto:lijiani0104@gmail.com'
        +'?subject='+encodeURIComponent('Réservation – Le Mystère du Buffet')
        +'&body='+body;
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.textContent = lang==='fr' ? 'Envoyer ma demande' : 'Send my request';
      return;
    }

    /* Formspree POST */
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function(r) { return r.json(); })
    .then(function(json) {
      if (json.ok) {
        btn.textContent = lang==='fr' ? 'Envoyé ✓' : 'Sent ✓';
        btn.style.background = 'rgba(0,180,180,.7)';
        if (note) note.textContent = lang==='fr'
          ? 'Merci ! Nous vous contacterons dans les 24 heures pour confirmer.'
          : 'Thank you! We will contact you within 24 hours to confirm.';
        if (note) note.style.color = 'rgba(0,212,212,.8)';
        inputs.forEach(function(el){ el.value=''; });
      } else {
        throw new Error('error');
      }
    })
    .catch(function() {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.textContent = lang==='fr' ? 'Envoyer ma demande' : 'Send my request';
      if (note) note.textContent = lang==='fr'
        ? 'Une erreur est survenue. Appelez-nous au +33 3 23 74 13 78.'
        : 'An error occurred. Please call us at +33 3 23 74 13 78.';
    });
  });
})();
