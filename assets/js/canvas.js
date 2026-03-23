(function () {
  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, t = 0;
  var pts = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function Particle() { this.init(true); }
  Particle.prototype.init = function (full) {
    this.x = Math.random() * W;
    this.y = full ? Math.random() * H : H + 8;
    this.r = Math.random() * 1.5 + 0.2;
    this.vx = (Math.random() - 0.5) * 0.22;
    this.vy = -(Math.random() * 0.16 + 0.05);
    this.a = Math.random() * 0.4 + 0.07;
    this.life = 0;
    this.max = 240 + Math.random() * 320;
    this.h = 175 + Math.random() * 45;
  };
  Particle.prototype.step = function () {
    this.x += this.vx + Math.sin(t * 0.006 + this.x * 0.012) * 0.1;
    this.y += this.vy;
    this.life++;
    if (this.life > this.max || this.y < -10) this.init(false);
  };
  Particle.prototype.draw = function () {
    var p = this.life / this.max;
    var a = this.a * Math.sin(p * Math.PI);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = 'hsl(' + this.h + ',100%,62%)';
    ctx.fill();
    ctx.restore();
  };

  for (var i = 0; i < 110; i++) pts.push(new Particle());

  function waves() {
    var ws = [
      { a: 20, f: 0.0032, s: 0.0007, y: 0.52, o: 0.09 },
      { a: 13, f: 0.005,  s: 0.0011, y: 0.63, o: 0.065 },
      { a: 8,  f: 0.007,  s: 0.0015, y: 0.73, o: 0.05 }
    ];
    ws.forEach(function (w, i) {
      var oy = H * w.y;
      ctx.beginPath();
      for (var x = 0; x <= W; x += 3) {
        var y = oy
          + Math.sin(x * w.f + t * w.s + i * 1.1) * w.a
          + Math.sin(x * w.f * 1.6 + t * w.s * 1.4) * (w.a * 0.38);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fillStyle = 'rgba(0,200,200,' + w.o + ')';
      ctx.fill();
    });
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    var g = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, H * 0.65);
    g.addColorStop(0, 'rgba(0,55,120,0.1)');
    g.addColorStop(1, 'rgba(3,9,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    waves();
    pts.forEach(function (p) { p.step(); p.draw(); });
    t++;
    requestAnimationFrame(loop);
  }
  loop();
})();
