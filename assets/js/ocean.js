(function () {
  'use strict';
  var C = document.getElementById('ocean');
  if (!C) return;
  var ctx = C.getContext('2d');
  var W = 0, H = 0, t = 0, mx = 0.5, my = 0.5;

  function resize() { W = C.width = window.innerWidth; H = C.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', function(e){ mx=e.clientX/W; my=e.clientY/H; });

  /* ══════════════════════════════════
     WAVES
  ══════════════════════════════════ */
  var WV = [
    { oy:.38, amp:32, f:.0024, sp:.00038, f2:.0044, sp2:.00055, crest:true,  a:.22, r:0,  g:215,b:215 },
    { oy:.50, amp:22, f:.0036, sp:.00055, f2:.0064, sp2:.00078, crest:true,  a:.15, r:0,  g:185,b:200 },
    { oy:.60, amp:15, f:.0050, sp:.00075, f2:.0085, sp2:.00100, crest:false, a:.11, r:0,  g:155,b:180 },
    { oy:.70, amp:10, f:.0068, sp:.00095, f2:.011,  sp2:.00128, crest:false, a:.08, r:0,  g:125,b:160 },
    { oy:.79, amp:6,  f:.0088, sp:.00115, f2:.014,  sp2:.00148, crest:false, a:.06, r:0,  g:100,b:145 },
  ];
  var W0 = null;

  function wY(w, x) {
    var mo = (mx-.5)*.07;
    return H*w.oy + Math.sin(x*w.f+t*w.sp+mo)*w.amp
      + Math.sin(x*w.f2+t*w.sp2+mo*1.5)*(w.amp*.44)
      + Math.sin(x*.0010+t*.00018)*(w.amp*.28);
  }

  function drawWaves() {
    var arr0 = new Float32Array(Math.ceil(W/2)+2);
    WV.forEach(function(w, wi) {
      ctx.beginPath();
      for (var x = 0; x <= W; x += 2) {
        var i = x >> 1, y = wY(w, x);
        if (wi === 0) arr0[i] = y;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      var g = ctx.createLinearGradient(0, H*w.oy - w.amp*2.8, 0, H);
      g.addColorStop(0, 'rgba('+w.r+','+w.g+','+w.b+','+w.a+')');
      g.addColorStop(.5, 'rgba('+w.r+','+w.g+','+w.b+','+(w.a*.22)+')');
      g.addColorStop(1, 'rgba(3,9,24,0)');
      ctx.fillStyle = g; ctx.fill();
      if (w.crest) {
        ctx.beginPath();
        for (var x2 = 0; x2 <= W; x2 += 2) {
          var i2 = x2 >> 1; i2 === 0 ? ctx.moveTo(x2, arr0[i2]) : ctx.lineTo(x2, arr0[i2]);
        }
        ctx.strokeStyle = 'rgba(0,240,240,'+(w.a*1.95)+')';
        ctx.lineWidth = 1.8; ctx.shadowBlur = 22; ctx.shadowColor = 'rgba(0,230,230,.72)';
        ctx.stroke(); ctx.shadowBlur = 0;
      }
    });
    W0 = arr0;
  }

  /* ══════════════════════════════════
     BUBBLES — small background
  ══════════════════════════════════ */
  function BubbleBack() { this.init(true); }
  BubbleBack.prototype.init = function(any) {
    this.x = Math.random()*W; this.y = any ? Math.random()*H : H+14;
    this.r = Math.random()*2.8+.4;
    this.vy = -(Math.random()*.5+.12); this.vx = (Math.random()-.5)*.2;
    this.wb = Math.random()*Math.PI*2; this.ws = .022+Math.random()*.03;
    this.al = Math.random()*.35+.08; this.li = 0; this.mx = 300+Math.random()*480;
    this.hu = 172+Math.random()*40;
  };
  BubbleBack.prototype.step = function() {
    this.wb += this.ws; this.x += this.vx+Math.sin(this.wb)*.28; this.y += this.vy; this.li++;
    if (this.li > this.mx || this.y < -12) this.init(false);
  };
  BubbleBack.prototype.draw = function() {
    var p = this.li/this.mx, a = this.al*Math.sin(p*Math.PI);
    ctx.save(); ctx.globalAlpha = a;
    var g = ctx.createRadialGradient(this.x-this.r*.3,this.y-this.r*.3,this.r*.07,this.x,this.y,this.r);
    g.addColorStop(0,'rgba(210,255,255,.88)');
    g.addColorStop(.4,'hsl('+this.hu+',100%,74%)');
    g.addColorStop(1,'hsl('+this.hu+',100%,38%)');
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fillStyle = g; ctx.shadowBlur = this.r*4; ctx.shadowColor = 'hsl('+this.hu+',100%,64%)'; ctx.fill();
    ctx.beginPath(); ctx.arc(this.x-this.r*.28,this.y-this.r*.30,this.r*.24,0,Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.shadowBlur = 0; ctx.fill();
    ctx.restore();
  };

  /* ══════════════════════════════════
     BUBBLES — foreground (medium, not huge)
  ══════════════════════════════════ */
  function BubbleFront() { this.init(); }
  BubbleFront.prototype.init = function() {
    this.r = 5+Math.random()*14;   /* max radius 19 — compact */
    this.x = Math.random()*W;
    this.y = H+this.r+10;
    this.vy = -(Math.random()*.38+.14);
    this.vx = (Math.random()-.5)*.15;
    this.wb = Math.random()*Math.PI*2; this.ws = .015+Math.random()*.02;
    this.al = Math.random()*.32+.12;
    this.li = 0; this.mx = Math.abs(H/this.vy)|0+80;
    this.hu = 172+Math.random()*50;
  };
  BubbleFront.prototype.step = function() {
    this.wb += this.ws;
    this.x += this.vx+Math.sin(this.wb)*.42;
    this.y += this.vy;
    this.li++;
    if (this.y < -this.r*2) this.init();
  };
  BubbleFront.prototype.draw = function() {
    var r = this.r, a = this.al;
    ctx.save(); ctx.globalAlpha = a;

    /* subtle outer glow */
    var glow = ctx.createRadialGradient(this.x,this.y,r*.85,this.x,this.y,r*1.4);
    glow.addColorStop(0,'hsla('+this.hu+',100%,70%,.14)');
    glow.addColorStop(1,'hsla('+this.hu+',100%,60%,0)');
    ctx.beginPath(); ctx.arc(this.x,this.y,r*1.4,0,Math.PI*2);
    ctx.fillStyle = glow; ctx.fill();

    /* body — mostly transparent glass */
    var bg = ctx.createRadialGradient(this.x-r*.35,this.y-r*.35,r*.04,this.x,this.y,r);
    bg.addColorStop(0,'rgba(230,255,255,.16)');
    bg.addColorStop(.5,'hsla('+this.hu+',100%,70%,.06)');
    bg.addColorStop(1,'hsla('+this.hu+',100%,52%,.18)');
    ctx.beginPath(); ctx.arc(this.x,this.y,r,0,Math.PI*2);
    ctx.fillStyle = bg; ctx.fill();

    /* rim */
    var rim = ctx.createLinearGradient(this.x-r,this.y-r,this.x+r,this.y+r);
    rim.addColorStop(0,'hsla('+this.hu+',100%,88%,.58)');
    rim.addColorStop(.45,'hsla('+this.hu+',100%,72%,.18)');
    rim.addColorStop(1,'hsla('+this.hu+',100%,55%,.46)');
    ctx.strokeStyle = rim; ctx.lineWidth = 1.1;
    ctx.shadowBlur = r*1.2; ctx.shadowColor = 'hsla('+this.hu+',100%,72%,.45)';
    ctx.stroke(); ctx.shadowBlur = 0;

    /* main highlight */
    var hg = ctx.createRadialGradient(this.x-r*.32,this.y-r*.34,0,this.x-r*.32,this.y-r*.34,r*.38);
    hg.addColorStop(0,'rgba(255,255,255,.68)'); hg.addColorStop(1,'rgba(255,255,255,0)');
    ctx.beginPath(); ctx.arc(this.x-r*.32,this.y-r*.34,r*.38,0,Math.PI*2);
    ctx.fillStyle = hg; ctx.fill();

    /* tiny secondary */
    ctx.beginPath(); ctx.arc(this.x+r*.25,this.y+r*.2,r*.12,0,Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill();

    ctx.restore();
  };

  /* ══════════════════════════════════
     FOAM
  ══════════════════════════════════ */
  function Foam() { this.reset(); }
  Foam.prototype.reset = function() {
    this.x = Math.random()*W; this.r = Math.random()*2.4+.4;
    this.al = Math.random()*.58+.2; this.li = 0; this.mx = 70+Math.random()*130; this.dx = (Math.random()-.5)*.48;
  };
  Foam.prototype.step = function() { this.x += this.dx; this.li++; if (this.li>this.mx||this.x<0||this.x>W) this.reset(); };
  Foam.prototype.draw = function(wy) {
    var a = this.al*Math.sin((this.li/this.mx)*Math.PI);
    ctx.save(); ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(this.x,wy-this.r*.4,this.r,0,Math.PI*2);
    ctx.fillStyle = 'rgba(200,255,255,.9)'; ctx.shadowBlur = 7; ctx.shadowColor = 'rgba(0,238,238,.8)'; ctx.fill();
    ctx.restore();
  };

  /* ══════════════════════════════════
     PLANKTON
  ══════════════════════════════════ */
  function Speck() { this.reset(true); }
  Speck.prototype.reset = function(any) {
    this.x = Math.random()*W; this.y = any?Math.random()*H:H+5;
    this.r = Math.random()*.7+.15; this.vy = -(Math.random()*.08+.02); this.vx = (Math.random()-.5)*.05;
    this.al = Math.random()*.28+.06; this.li = 0; this.mx = 400+Math.random()*600; this.hu = 160+Math.random()*65;
  };
  Speck.prototype.step = function() { this.x += this.vx+Math.sin(t*.007+this.y*.012)*.1; this.y += this.vy; this.li++; if (this.li>this.mx||this.y<-5) this.reset(false); };
  Speck.prototype.draw = function() {
    var a = this.al*Math.sin((this.li/this.mx)*Math.PI);
    ctx.save(); ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fillStyle = 'hsl('+this.hu+',100%,72%)'; ctx.shadowBlur = 3; ctx.shadowColor = 'hsl('+this.hu+',100%,60%)'; ctx.fill();
    ctx.restore();
  };

  /* ══════════════════════════════════
     FISH  — clean silhouette approach
     Each fish is built from a single
     smooth body path + fins, giving a
     natural, elegant look.
  ══════════════════════════════════ */
  var FTYPES = [
    { name:'tetra',  bw:32, bh:14, speed:.48, hu:185, hu2:200 },
    { name:'tetra',  bw:24, bh:10, speed:.36, hu:168, hu2:185 },
    { name:'tetra',  bw:44, bh:18, speed:.62, hu:190, hu2:210 },
    { name:'angel',  bw:22, bh:26, speed:.28, hu:175, hu2:195 },
    { name:'angel',  bw:28, bh:32, speed:.22, hu:182, hu2:200 },
    { name:'snapper',bw:48, bh:20, speed:.70, hu:183, hu2:202 },
    { name:'snapper',bw:38, bh:16, speed:.56, hu:172, hu2:192 },
    { name:'tetra',  bw:18, bh:8,  speed:.42, hu:178, hu2:196 },
  ];

  function Fish() { this.init(); }
  Fish.prototype.init = function() {
    var tp = FTYPES[Math.floor(Math.random()*FTYPES.length)];
    this.name  = tp.name;
    this.bw    = tp.bw*(Math.random()*.45+.78);
    this.bh    = tp.bh*(Math.random()*.45+.78);
    this.speed = tp.speed*(Math.random()*.4+.8);
    this.hu    = tp.hu +Math.random()*18-9;
    this.hu2   = tp.hu2+Math.random()*18-9;
    this.dir   = Math.random()>.5?1:-1;
    this.x     = this.dir>0 ? -this.bw-30 : W+this.bw+30;
    this.baseY = H*.06+Math.random()*(H*.60);
    this.y     = this.baseY;
    this.depth = Math.random();
    this.sc    = .55+this.depth*.9;
    this.wb    = Math.random()*Math.PI*2;
    this.ws    = .030+Math.random()*.025;
    this.tp    = Math.random()*Math.PI*2;
    this.al    = Math.random()*.38+.22;
  };
  Fish.prototype.step = function() {
    this.x  += this.speed*this.dir*this.sc;
    this.wb += this.ws;
    this.y   = this.baseY+Math.sin(this.wb)*4.5*this.sc;
    this.tp += .22+this.speed*.05;
    if ((this.dir>0&&this.x>W+this.bw+30)||(this.dir<0&&this.x<-this.bw-30)) this.init();
  };
  Fish.prototype.draw = function() {
    ctx.save();
    ctx.globalAlpha = this.al*(this.depth*.5+.5);
    ctx.translate(this.x, this.y);
    if (this.dir < 0) ctx.scale(-1, 1);
    ctx.scale(this.sc, this.sc);

    var sw = Math.sin(this.tp)*.38;
    if      (this.name==='tetra')   this._tetra(sw);
    else if (this.name==='angel')   this._angel(sw);
    else                            this._snapper(sw);
    ctx.restore();
  };

  /* ── TETRA: slim horizontal fish ── */
  Fish.prototype._tetra = function(sw) {
    var w = this.bw, h = this.bh, hu = this.hu, hu2 = this.hu2;
    ctx.save();

    /* caudal fin */
    var ct = sw*h;
    var cg = ctx.createLinearGradient(-w*.85,0,-w*.44,0);
    cg.addColorStop(0,'hsla('+hu2+',100%,70%,.12)');
    cg.addColorStop(1,'hsla('+hu2+',100%,65%,.42)');
    ctx.beginPath();
    ctx.moveTo(-w*.46, -h*.06+ct);
    ctx.bezierCurveTo(-w*.75,-h*.55+ct*1.2,-w*.86,-h*.5+ct*1.3,-w*.48,-h*.02+ct);
    ctx.bezierCurveTo(-w*.86, h*.5+ct*1.3, -w*.75, h*.55+ct*1.2, -w*.46, h*.06+ct);
    ctx.closePath();
    ctx.fillStyle = cg; ctx.fill();

    /* dorsal fin */
    ctx.beginPath();
    ctx.moveTo(w*.22, -h*.3);
    ctx.bezierCurveTo(w*.08,-h*.9,-w*.08,-h*.92,-w*.16,-h*.3);
    ctx.closePath();
    ctx.fillStyle = 'hsla('+hu+',100%,72%,.28)'; ctx.fill();

    /* body */
    ctx.beginPath();
    ctx.moveTo( w*.52,  0);
    ctx.bezierCurveTo( w*.72,-h*.08, w*.82,-h*.28, w*.48,-h*.36);
    ctx.bezierCurveTo( w*.18,-h*.46,-w*.08,-h*.40,-w*.46,-h*.06+sw*h*.28);
    ctx.lineTo(-w*.46, h*.06+sw*h*.28);
    ctx.bezierCurveTo(-w*.08, h*.40, w*.18, h*.46, w*.48, h*.36);
    ctx.bezierCurveTo( w*.82, h*.28, w*.72, h*.08, w*.52, 0);
    ctx.closePath();
    var bg = ctx.createLinearGradient(-w*.45,0,w*.6,0);
    bg.addColorStop(0,  'hsla('+hu+',100%,38%,.5)');
    bg.addColorStop(.35,'hsla('+hu+',100%,66%,.76)');
    bg.addColorStop(.7, 'hsla('+hu2+',100%,58%,.64)');
    bg.addColorStop(1,  'hsla('+hu2+',100%,44%,.32)');
    ctx.fillStyle = bg;
    ctx.shadowBlur = 14; ctx.shadowColor = 'hsla('+hu+',100%,66%,.38)';
    ctx.fill(); ctx.shadowBlur = 0;

    /* iridescent mid-stripe */
    ctx.beginPath();
    ctx.moveTo(w*.42,0);
    ctx.bezierCurveTo(w*.14,-h*.1,-w*.1,-h*.09,-w*.4,sw*h*.12);
    ctx.strokeStyle = 'hsla('+(hu+22)+',100%,88%,.28)'; ctx.lineWidth = 1.8; ctx.stroke();

    /* eye */
    ctx.beginPath(); ctx.arc(w*.26,-h*.08, h*.17, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill();
    ctx.beginPath(); ctx.arc(w*.28,-h*.08, h*.1,  0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,25,55,.88)'; ctx.fill();
    ctx.beginPath(); ctx.arc(w*.24,-h*.11, h*.042,0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,.82)'; ctx.fill();

    ctx.restore();
  };

  /* ── ANGELFISH: tall vertical body ── */
  Fish.prototype._angel = function(sw) {
    var w = this.bw, h = this.bh, hu = this.hu, hu2 = this.hu2;
    ctx.save();

    /* tail */
    var ct = sw*h*.5;
    ctx.beginPath();
    ctx.moveTo(-w*.42,-h*.06+ct);
    ctx.bezierCurveTo(-w*.65,-h*.48+ct,-w*.78,-h*.44+ct,-w*.44,-h*.02+ct);
    ctx.bezierCurveTo(-w*.78,h*.44+ct,-w*.65,h*.48+ct,-w*.42,h*.06+ct);
    ctx.closePath();
    ctx.fillStyle = 'hsla('+hu2+',100%,68%,.32)'; ctx.fill();

    /* long dorsal fin */
    ctx.beginPath();
    ctx.moveTo(w*.2,-h*.4);
    ctx.bezierCurveTo(w*.04,-h*1.12,-w*.12,-h*1.18,-w*.22,-h*.4);
    ctx.closePath();
    ctx.fillStyle = 'hsla('+hu+',100%,70%,.26)'; ctx.fill();

    /* long ventral fin */
    ctx.beginPath();
    ctx.moveTo(w*.05, h*.4);
    ctx.bezierCurveTo(-w*.06, h*1.08,-w*.18, h*1.12,-w*.24, h*.42);
    ctx.closePath();
    ctx.fillStyle = 'hsla('+hu2+',100%,70%,.22)'; ctx.fill();

    /* body */
    ctx.beginPath();
    ctx.moveTo(w*.48,  0);
    ctx.bezierCurveTo(w*.62,-h*.08, w*.68,-h*.38, w*.32,-h*.48);
    ctx.bezierCurveTo(w*.08,-h*.56,-w*.06,-h*.52,-w*.42,-h*.06+sw*h*.22);
    ctx.lineTo(-w*.42, h*.06+sw*h*.22);
    ctx.bezierCurveTo(-w*.06,h*.52, w*.08,h*.56, w*.32,h*.48);
    ctx.bezierCurveTo(w*.68,h*.38, w*.62,h*.08, w*.48,0);
    ctx.closePath();
    var bg = ctx.createLinearGradient(-w*.42,0,w*.55,0);
    bg.addColorStop(0,  'hsla('+hu+',100%,40%,.52)');
    bg.addColorStop(.38,'hsla('+hu+',100%,68%,.78)');
    bg.addColorStop(.72,'hsla('+hu2+',100%,60%,.66)');
    bg.addColorStop(1,  'hsla('+hu2+',100%,46%,.34)');
    ctx.fillStyle = bg;
    ctx.shadowBlur = 16; ctx.shadowColor = 'hsla('+hu+',100%,65%,.4)';
    ctx.fill(); ctx.shadowBlur = 0;

    /* vertical stripe */
    ctx.beginPath();
    ctx.moveTo(w*.12,-h*.45); ctx.bezierCurveTo(w*.16,0,w*.14,0,w*.12,h*.45);
    ctx.strokeStyle = 'hsla('+hu2+',100%,82%,.22)'; ctx.lineWidth = 2.8; ctx.stroke();

    /* eye */
    ctx.beginPath(); ctx.arc(w*.25,-h*.08, h*.13,0,Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,.58)'; ctx.fill();
    ctx.beginPath(); ctx.arc(w*.27,-h*.08, h*.076,0,Math.PI*2);
    ctx.fillStyle = 'rgba(0,25,55,.88)'; ctx.fill();
    ctx.beginPath(); ctx.arc(w*.23,-h*.11, h*.032,0,Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,.82)'; ctx.fill();

    ctx.restore();
  };

  /* ── SNAPPER: robust streamlined ── */
  Fish.prototype._snapper = function(sw) {
    var w = this.bw, h = this.bh, hu = this.hu, hu2 = this.hu2;
    ctx.save();

    /* forked caudal fin */
    var ct = sw*h;
    ctx.beginPath();
    ctx.moveTo(-w*.44,-h*.05+ct);
    ctx.bezierCurveTo(-w*.68,-h*.52+ct*1.2,-w*.82,-h*.46+ct*1.3,-w*.5,-h*.02+ct);
    ctx.bezierCurveTo(-w*.82,h*.46+ct*1.3,-w*.68,h*.52+ct*1.2,-w*.44,h*.05+ct);
    ctx.closePath();
    var cg = ctx.createLinearGradient(-w*.82,0,-w*.42,0);
    cg.addColorStop(0,'hsla('+hu2+',100%,68%,.14)');
    cg.addColorStop(1,'hsla('+hu2+',100%,65%,.48)');
    ctx.fillStyle = cg; ctx.fill();

    /* dorsal fin */
    ctx.beginPath();
    ctx.moveTo(w*.28,-h*.3);
    ctx.bezierCurveTo(w*.12,-h*.82,-w*.1,-h*.84,-w*.2,-h*.3);
    ctx.closePath();
    ctx.fillStyle = 'hsla('+hu+',100%,70%,.3)'; ctx.fill();

    /* body */
    ctx.beginPath();
    ctx.moveTo(w*.56,0);
    ctx.bezierCurveTo(w*.76,-h*.08, w*.88,-h*.24, w*.52,-h*.32);
    ctx.bezierCurveTo(w*.2,-h*.42,-w*.1,-h*.36,-w*.44,-h*.05+sw*h*.3);
    ctx.lineTo(-w*.44, h*.05+sw*h*.3);
    ctx.bezierCurveTo(-w*.1, h*.36, w*.2, h*.42, w*.52, h*.32);
    ctx.bezierCurveTo(w*.88, h*.24, w*.76, h*.08, w*.56, 0);
    ctx.closePath();
    var bg = ctx.createLinearGradient(-w*.44,0,w*.62,0);
    bg.addColorStop(0,  'hsla('+hu+',100%,36%,.5)');
    bg.addColorStop(.4, 'hsla('+hu+',100%,64%,.78)');
    bg.addColorStop(.72,'hsla('+hu2+',100%,57%,.65)');
    bg.addColorStop(1,  'hsla('+hu2+',100%,42%,.32)');
    ctx.fillStyle = bg;
    ctx.shadowBlur = 18; ctx.shadowColor = 'hsla('+hu+',100%,64%,.42)';
    ctx.fill(); ctx.shadowBlur = 0;

    /* shimmer line */
    ctx.beginPath();
    ctx.moveTo(w*.5,0);
    ctx.bezierCurveTo(w*.18,-h*.1,-w*.08,-h*.08,-w*.38,sw*h*.14);
    ctx.strokeStyle = 'hsla('+hu2+',100%,88%,.32)'; ctx.lineWidth = 1.4; ctx.stroke();

    /* eye */
    ctx.beginPath(); ctx.arc(w*.3,-h*.07, h*.18,0,Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,.62)'; ctx.fill();
    ctx.beginPath(); ctx.arc(w*.32,-h*.07, h*.11,0,Math.PI*2);
    ctx.fillStyle = 'rgba(0,25,55,.9)'; ctx.fill();
    ctx.beginPath(); ctx.arc(w*.28,-h*.10, h*.045,0,Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,.84)'; ctx.fill();

    ctx.restore();
  };

  /* ══════════════════════════════════
     JELLYFISH
  ══════════════════════════════════ */
  function Jelly() { this.init(); }
  Jelly.prototype.init = function() {
    this.x  = (.1+Math.random()*.8)*W;
    this.y  = H*.55+Math.random()*H*.42;
    this.r  = 12+Math.random()*22;
    this.ph = Math.random()*Math.PI*2; this.sp = .008+Math.random()*.01;
    this.vy = -(Math.random()*.1+.04);
    this.al = Math.random()*.22+.08;
    this.hu = 160+Math.random()*60;
    this.nt = 5+Math.floor(Math.random()*4);
    this.tp = Math.random()*Math.PI*2;
  };
  Jelly.prototype.step = function() { this.ph+=this.sp; this.y+=this.vy; this.tp+=.038; if(this.y<-this.r*5)this.init(); };
  Jelly.prototype.draw = function() {
    ctx.save(); ctx.globalAlpha = this.al;
    var pulse = 1+Math.sin(this.ph)*.12, rx = this.r*pulse, ry = this.r*.7*pulse;
    ctx.beginPath(); ctx.ellipse(this.x,this.y,rx,ry,0,Math.PI,0); ctx.closePath();
    var g = ctx.createRadialGradient(this.x,this.y-ry*.28,rx*.08,this.x,this.y,rx);
    g.addColorStop(0,'hsla('+this.hu+',100%,84%,.52)');
    g.addColorStop(.6,'hsla('+this.hu+',100%,62%,.28)');
    g.addColorStop(1,'hsla('+this.hu+',100%,50%,.04)');
    ctx.fillStyle=g; ctx.shadowBlur=22; ctx.shadowColor='hsla('+this.hu+',100%,72%,.48)'; ctx.fill();
    ctx.strokeStyle='hsla('+this.hu+',100%,82%,.44)'; ctx.lineWidth=1.2; ctx.stroke(); ctx.shadowBlur=0;
    for (var i=0;i<this.nt;i++) {
      var tx=this.x+(i-(this.nt-1)/2)*rx*.3, sw=Math.sin(this.tp+i*.9)*9;
      ctx.beginPath(); ctx.moveTo(tx,this.y);
      ctx.bezierCurveTo(tx+sw,this.y+ry*1.2,tx+sw*1.5,this.y+ry*2.2,tx+sw*.7,this.y+ry*3.2);
      ctx.strokeStyle='hsla('+this.hu+',100%,75%,.26)'; ctx.lineWidth=1.1; ctx.stroke();
    }
    ctx.restore();
  };

  /* ══════════════════════════════════
     SEAWEED
  ══════════════════════════════════ */
  function Weed() { this.reset(); }
  Weed.prototype.reset = function() {
    this.x = Math.random()*W; this.h = H*.04+Math.random()*H*.09;
    this.segs = 4+Math.floor(Math.random()*5); this.ph = Math.random()*Math.PI*2;
    this.sp = .010+Math.random()*.016; this.lw = 2.4+Math.random()*2.8; this.hu = 155+Math.random()*30;
  };
  Weed.prototype.draw = function() {
    ctx.save(); ctx.globalAlpha = .26;
    ctx.strokeStyle='hsla('+this.hu+',80%,48%,.7)'; ctx.lineWidth=this.lw; ctx.lineCap='round';
    ctx.shadowBlur=7; ctx.shadowColor='hsla('+this.hu+',100%,55%,.32)';
    ctx.beginPath(); ctx.moveTo(this.x,H);
    for (var i=0;i<this.segs;i++) {
      var frac=(i+1)/this.segs;
      var bend=Math.sin(this.ph+t*this.sp+frac*2.6)*(10+frac*18);
      ctx.quadraticCurveTo(this.x+bend*.65,H-frac*this.h+this.h/(this.segs*2),this.x+bend,H-frac*this.h);
    }
    ctx.stroke(); ctx.restore();
  };

  /* ══════════════════════════════════
     LIGHT RAYS
  ══════════════════════════════════ */
  function drawRays() {
    ctx.save();
    for (var r=0;r<8;r++) {
      var ang=((r/8)-.5)*1.6+Math.sin(t*.00020+r*.7)*.12;
      var cx=W*(.28+mx*.44), y0=-60, len=H*.88;
      var spd=Math.abs(Math.sin(ang))*len*.25+22;
      var x2=cx+Math.sin(ang)*len, y2=y0+len;
      var rg=ctx.createLinearGradient(cx,y0,x2,y2);
      rg.addColorStop(0,'rgba(0,215,220,.028)'); rg.addColorStop(.35,'rgba(0,175,210,.014)'); rg.addColorStop(1,'rgba(0,90,175,0)');
      ctx.beginPath(); ctx.moveTo(cx-8,y0); ctx.lineTo(cx+8,y0); ctx.lineTo(x2+spd,y2); ctx.lineTo(x2-spd,y2); ctx.closePath();
      ctx.fillStyle=rg; ctx.fill();
    }
    ctx.restore();
  }

  /* ══════════════════════════════════
     INIT
  ══════════════════════════════════ */
  var bubblesB=[], bubblesF=[], foam=[], specks=[], fish=[], weeds=[], jellies=[];
  for (var i=0;i<90;i++)  bubblesB.push(new BubbleBack());
  for (var ib=0;ib<18;ib++) bubblesF.push(new BubbleFront());
  for (var j=0;j<65;j++)  foam.push(new Foam());
  for (var k=0;k<150;k++) specks.push(new Speck());
  for (var f=0;f<14;f++)  fish.push(new Fish());
  for (var w=0;w<20;w++)  weeds.push(new Weed());
  for (var jj=0;jj<5;jj++) jellies.push(new Jelly());

  /* ══════════════════════════════════
     LOOP
  ══════════════════════════════════ */
  function loop() {
    ctx.clearRect(0,0,W,H);

    var ga=ctx.createRadialGradient(W*.5,H*.35,0,W*.5,H*.35,H*.82);
    ga.addColorStop(0,'rgba(0,58,138,.18)'); ga.addColorStop(.5,'rgba(0,24,82,.08)'); ga.addColorStop(1,'rgba(3,9,24,0)');
    ctx.fillStyle=ga; ctx.fillRect(0,0,W,H);
    var gb=ctx.createRadialGradient(W*.5,H*1.15,0,W*.5,H*1.15,H*.68);
    gb.addColorStop(0,'rgba(0,40,105,.28)'); gb.addColorStop(1,'rgba(3,9,24,0)');
    ctx.fillStyle=gb; ctx.fillRect(0,0,W,H);

    drawRays();
    weeds.forEach(function(w){w.draw();});
    bubblesB.forEach(function(b){b.step();b.draw();});
    specks.forEach(function(s){s.step();s.draw();});
    jellies.forEach(function(j){j.step();j.draw();});
    fish.forEach(function(f){if(f.depth<.5){f.step();f.draw();}});
    drawWaves();
    if (W0) foam.forEach(function(fm){var xi=Math.min(Math.floor(fm.x/2),W0.length-1);fm.step();fm.draw(W0[xi]);});
    fish.forEach(function(f){if(f.depth>=.5){f.step();f.draw();}});
    bubblesF.forEach(function(b){b.step();b.draw();});

    t++; requestAnimationFrame(loop);
  }
  loop();
})();
