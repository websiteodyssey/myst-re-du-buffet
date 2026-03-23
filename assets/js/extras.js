'use strict';

/* ═══════════════════════════════════════
   COOKIE BANNER RGPD
═══════════════════════════════════════ */
(function initCookies() {
  var STORAGE_KEY = 'mdb-cookies';
  var consent = localStorage.getItem(STORAGE_KEY);
  if (consent !== null) return; /* already decided */

  /* inject banner styles */
  var style = document.createElement('style');
  style.textContent = [
    '#mdb-cookie{',
      'position:fixed;bottom:0;left:0;right:0;z-index:9999;',
      'background:rgba(3,9,24,.97);backdrop-filter:blur(20px);',
      'border-top:1px solid rgba(0,212,212,.2);',
      'padding:1.4rem 2rem;',
      'display:flex;align-items:center;justify-content:space-between;',
      'gap:1.5rem;flex-wrap:wrap;',
      'font-family:"Jost",sans-serif;font-size:.78rem;font-weight:300;',
      'color:rgba(221,238,255,.7);',
      'animation:cookieSlide .4s ease;',
    '}',
    '@keyframes cookieSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}',
    '#mdb-cookie .ck-text{flex:1;min-width:240px;line-height:1.65;}',
    '#mdb-cookie .ck-text a{color:rgba(0,212,212,.85);text-decoration:underline;}',
    '#mdb-cookie .ck-btns{display:flex;gap:.75rem;flex-shrink:0;}',
    '#mdb-cookie .ck-accept{',
      'padding:.55rem 1.6rem;background:rgba(0,212,212,1);color:rgba(3,9,24,1);',
      'font-family:"Jost",sans-serif;font-size:.68rem;font-weight:700;',
      'letter-spacing:.16em;text-transform:uppercase;border:none;',
      'cursor:pointer;border-radius:2px;transition:background .25s;',
    '}',
    '#mdb-cookie .ck-accept:hover{background:#00f0f0;}',
    '#mdb-cookie .ck-refuse{',
      'padding:.55rem 1.4rem;background:transparent;',
      'color:rgba(221,238,255,.5);',
      'font-family:"Jost",sans-serif;font-size:.68rem;font-weight:400;',
      'letter-spacing:.12em;text-transform:uppercase;',
      'border:1px solid rgba(221,238,255,.18);',
      'cursor:pointer;border-radius:2px;transition:all .25s;',
    '}',
    '#mdb-cookie .ck-refuse:hover{border-color:rgba(221,238,255,.45);color:rgba(221,238,255,.8);}',
    '@media(max-width:600px){',
      '#mdb-cookie{padding:1.2rem 1.2rem 1.4rem;}',
      '#mdb-cookie .ck-btns{width:100%;justify-content:flex-end;}',
    '}',
  ].join('');
  document.head.appendChild(style);

  var lang = localStorage.getItem('mdb-lang') || 'fr';
  var txt = lang === 'fr'
    ? 'Ce site utilise uniquement des cookies techniques nécessaires à son fonctionnement (préférences de langue). Aucun cookie publicitaire. <a href="/pages/mentions-legales.html">En savoir plus</a>'
    : 'This site only uses technical cookies required for its operation (language preferences). No advertising cookies. <a href="/pages/mentions-legales.html">Learn more</a>';
  var btnAccept = lang === 'fr' ? 'Accepter' : 'Accept';
  var btnRefuse = lang === 'fr' ? 'Refuser' : 'Decline';

  var banner = document.createElement('div');
  banner.id = 'mdb-cookie';
  banner.innerHTML = '<p class="ck-text">'+txt+'</p>'
    + '<div class="ck-btns">'
    + '<button class="ck-refuse" id="ck-refuse">'+btnRefuse+'</button>'
    + '<button class="ck-accept" id="ck-accept">'+btnAccept+'</button>'
    + '</div>';
  document.body.appendChild(banner);

  function dismiss(val) {
    localStorage.setItem(STORAGE_KEY, val);
    banner.style.transition = 'transform .35s ease, opacity .35s ease';
    banner.style.transform = 'translateY(100%)';
    banner.style.opacity = '0';
    setTimeout(function(){ if (banner.parentNode) banner.parentNode.removeChild(banner); }, 380);
  }

  document.getElementById('ck-accept').addEventListener('click', function(){ dismiss('accepted'); });
  document.getElementById('ck-refuse').addEventListener('click', function(){ dismiss('refused'); });
})();

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
