const MAPS = window.MAPS;
const PORTRAIT = 'assets/portrait.png';
(function(){
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer:fine)').matches;
const small = () => innerWidth <= 760;

/* ---------------- loader: % ring while particles gather ---------------- */
const LOADER = { p:0, done:false };
function finishLoad(){
  if (LOADER.done) return; LOADER.done = true; LOADER.p = 1;
  document.getElementById('intro').classList.add('done');
  document.documentElement.classList.remove('loading'); document.body.classList.add('ready');
}
(function(){
  const el = document.getElementById('intro');
  if (reduce){ finishLoad(); return; }
  try { history.scrollRestoration = 'manual'; } catch(e){}
  scrollTo(0,0); document.documentElement.classList.add('loading');
  const c = document.getElementById('introC'), g = c.getContext('2d');
  const fit = () => { const d = Math.min(devicePixelRatio,2); c.width = innerWidth*d; c.height = innerHeight*d; g.setTransform(d,0,0,d,0,0); };
  fit(); addEventListener('resize', fit);
  const t0 = performance.now();
  (function draw(now){
    if (!window.__glLoader) LOADER.p = Math.min(1, (now - t0)/2600);
    g.clearRect(0,0,innerWidth,innerHeight);
    const pc = LOADER.p, cx = innerWidth/2, cy = innerHeight/2, n = 28, lit = pc*n;
    if (!window.__glLoader) for (let i=0;i<n;i++){ const a = -Math.PI/2 + i/n*Math.PI*2, f = Math.max(0, Math.min(1, lit - i)); if (!f) continue;
      g.fillStyle = 'rgba(255,255,255,'+(.3+.7*f)+')'; g.beginPath(); g.arc(cx + Math.cos(a)*46, cy + Math.sin(a)*46, .8 + 2.6*f*(i/n), 0, 7); g.fill(); }
    if (pc >= 1) { requestAnimationFrame(draw); return; }
    g.fillStyle = '#e9e8ea'; g.font = '400 15px Geist, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(Math.round(pc*100)+'%', cx, cy);
    if (!window.__glLoader && pc >= 1) finishLoad(); else if (!LOADER.done) requestAnimationFrame(draw); else g.clearRect(0,0,innerWidth,innerHeight);
  })(t0);
  setTimeout(finishLoad, 9000);
})();

/* ---------------- copy email ---------------- */
const copied = document.getElementById('copied');
document.getElementById('email').addEventListener('click', () => {
  const text = 'perarasuboopathirajan@gmail.com';
  const sel = () => { const r = document.createRange(); r.selectNodeContents(document.getElementById('email')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); copied.textContent = 'Selected. Press Ctrl+C to copy.'; };
  try { navigator.clipboard.writeText(text).then(() => copied.textContent = 'Email copied.', sel); } catch(e){ sel(); }
});

/* ---------------- certificate peek on hover ---------------- */
(function(){
  const peek = document.getElementById('peek'); if (!fine) return;
  let px = 0, py = 0, tx = 0, ty = 0, on = false;
  document.querySelectorAll('.row[data-img]').forEach(r => {
    r.addEventListener('pointerenter', () => { peek.src = r.dataset.img; peek.classList.add('on'); on = true; });
    r.addEventListener('pointerleave', () => { peek.classList.remove('on'); on = false; });
  });
  addEventListener('pointermove', e => { tx = e.clientX + 260; ty = e.clientY; }, {passive:true});
  (function f(){ px += (tx-px)*.15; py += (ty-py)*.15; peek.style.left = Math.min(px, innerWidth - 260)+'px'; peek.style.top = py+'px'; requestAnimationFrame(f); })();
})();

/* ---------------- email dissolves into particles on hover ---------------- */
(function(){
  const box = document.getElementById('cbox'), em = document.getElementById('email'), cv = document.getElementById('dust');
  if (!box || !cv || reduce) return;
  const g = cv.getContext('2d'); let P = [], active = false, running = false, mx = -9999, my = -9999, built = false;
  function build(){
    const br = box.getBoundingClientRect(), er = em.getBoundingClientRect(), d = Math.min(devicePixelRatio, 2);
    cv.width = br.width*d; cv.height = br.height*d; cv.style.width = br.width+'px'; cv.style.height = br.height+'px'; g.setTransform(d,0,0,d,0,0);
    const off = document.createElement('canvas'), W = Math.ceil(er.width), H = Math.ceil(er.height*1.3); off.width = W; off.height = H;
    const o = off.getContext('2d'), cs = getComputedStyle(em);
    o.fillStyle = '#fff'; o.font = cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily; o.textBaseline = 'middle'; o.textAlign = 'center';
    try { o.letterSpacing = cs.letterSpacing; } catch(e){}
    const lines = em.getClientRects().length > 1 ? null : 1;
    o.fillText(em.textContent, W/2, H/2, W);
    const data = o.getImageData(0,0,W,H).data, ox = er.left - br.left, oy = er.top - br.top - er.height*.15;
    P = []; const step = innerWidth < 760 ? 2 : 2;
    for (let y=0;y<H;y+=step) for (let x=0;x<W;x+=step) if (data[(y*W+x)*4+3] > 140)
      P.push({hx:ox+x, hy:oy+y, x:ox+x, y:oy+y, vx:0, vy:0, r:Math.random()});
    built = true;
  }
  function tick(){
    g.clearRect(0,0,cv.width,cv.height);
    const br = box.getBoundingClientRect(); let settled = true;
    g.fillStyle = '#e9e8ea';
    for (const p of P){
      if (active){
        const dx = p.x - (mx-br.left), dy = p.y - (my-br.top), dd = Math.hypot(dx,dy) + .01;
        if (dd < 140){ const f = (140-dd)/140*1.6; p.vx += dx/dd*f; p.vy += dy/dd*f; }
        p.vx += (Math.random()-.5)*.5 + .04; p.vy += (Math.random()-.55)*.5;
        p.vx *= .94; p.vy *= .94;
      } else {
        p.vx += (p.hx - p.x)*.06; p.vy += (p.hy - p.y)*.06; p.vx *= .78; p.vy *= .78;
        if (Math.abs(p.hx-p.x) > .6 || Math.abs(p.hy-p.y) > .6) settled = false;
      }
      p.x += p.vx; p.y += p.vy;
      g.globalAlpha = .45 + .55*p.r; g.fillRect(p.x, p.y, 1.6, 1.6);
    }
    g.globalAlpha = 1;
    if (!active && settled){ em.classList.remove('gone'); g.clearRect(0,0,cv.width,cv.height); running = false; return; }
    requestAnimationFrame(tick);
  }
  function start(){ if (!built) build(); active = true; em.classList.add('gone'); if (!running){ running = true; requestAnimationFrame(tick); } }
  function stop(){ active = false; if (!running){ running = true; requestAnimationFrame(tick); } }
  box.addEventListener('pointerenter', e => { mx = e.clientX; my = e.clientY; start(); });
  box.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
  box.addEventListener('pointerleave', stop);
  box.addEventListener('touchstart', () => { start(); clearTimeout(box._t); box._t = setTimeout(stop, 1800); }, {passive:true});
  addEventListener('resize', () => { built = false; });
  if (document.fonts) document.fonts.ready.then(() => { built = false; });
})();

/* ---------------- pinned horizontal works ---------------- */
const works = document.querySelector('.works'), track = document.getElementById('track');
function sizeWorks(){
  if (small()){ works.style.height = ''; track.style.transform = ''; return; }
  works.style.height = (innerHeight + Math.max(0, track.scrollWidth + Math.max(16, innerWidth*.08) - innerWidth) + innerHeight*.3) + 'px';
}
function scrollWorks(){
  if (small()) return;
  const r = works.getBoundingClientRect(), span = r.height - innerHeight;
  const q = span > 0 ? Math.min(1, Math.max(0, -r.top/span)) : 0;
  track.style.transform = 'translate3d(' + (-q * Math.max(0, track.scrollWidth + Math.max(16, innerWidth*.08) - innerWidth)) + 'px,0,0)';
}
addEventListener('scroll', scrollWorks, {passive:true});
addEventListener('resize', () => { sizeWorks(); scrollWorks(); });
sizeWorks(); scrollWorks();

/* ---------------- cursor: dot with comet tail ---------------- */
const cur = document.getElementById('cursor');
let mx = innerWidth/2, my = innerHeight/2, hoverLink = false;
if (fine && !reduce){
  document.body.classList.add('cur');
  const cg = cur.getContext('2d'); const trail = [];
  const fit = () => { const d = Math.min(devicePixelRatio,2); cur.width = innerWidth*d; cur.height = innerHeight*d; cg.setTransform(d,0,0,d,0,0); };
  fit(); addEventListener('resize', fit);
  let movedOnce = false;
  addEventListener('pointermove', e => { movedOnce = true; mx = e.clientX; my = e.clientY; hoverLink = !!e.target.closest('a,button'); }, {passive:true});
  let px = mx, py = my, ring = 0;
  (function loop(){
    px += (mx-px)*.35; py += (my-py)*.35;
    trail.unshift([px,py]); if (trail.length > 18) trail.pop();
    cg.clearRect(0,0,innerWidth,innerHeight);
    for (let i = trail.length-1; i > 0; i--){
      const a = 1 - i/trail.length;
      cg.strokeStyle = 'rgba(255,255,255,'+(a*.55)+')'; cg.lineWidth = 6*a; cg.lineCap = 'round';
      cg.beginPath(); cg.moveTo(trail[i][0],trail[i][1]); cg.lineTo(trail[i-1][0],trail[i-1][1]); cg.stroke();
    }
    if (!movedOnce){ requestAnimationFrame(loop); return; }
    cg.shadowColor = 'rgba(255,255,255,.9)'; cg.shadowBlur = 12; cg.fillStyle = '#fff';
    cg.beginPath(); cg.arc(px,py,4,0,7); cg.fill(); cg.shadowBlur = 0;
    ring += ((hoverLink ? 30 : 0) - ring)*.18;
    if (ring > 1){ cg.strokeStyle = 'rgba(255,255,255,.85)'; cg.lineWidth = 1.2; cg.beginPath(); cg.arc(px,py,ring,0,7); cg.stroke(); }
    requestAnimationFrame(loop);
  })();
}

/* ---------------- WebGL ---------------- */
if (!window.THREE) return;
const canvas = document.getElementById('gl');
let renderer;
try { renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false}); } catch(e){ return; }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x242328, 1);
renderer.autoClear = false;
document.body.classList.add('gl');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, .1, 100); camera.position.z = 8;
const visH = () => 2*Math.tan(camera.fov*Math.PI/360)*camera.position.z;

const N = small() ? 16000 : 40000;
const rnd = Math.random;
const gauss = () => (rnd()+rnd()+rnd()-1.5)/1.5;

/* sample points from a 2D canvas drawing; zf(x,y) gives depth */
function fromCanvas(draw, w, h, scale, zf, step=2){
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.strokeStyle = '#fff'; draw(g, w, h);
  const d = g.getImageData(0,0,w,h).data, pts = [];
  for (let y=0;y<h;y+=step) for (let x=0;x<w;x+=step) if (d[(y*w+x)*4+3] > 100) pts.push(x,y);
  const a = new Float32Array(N*3), cnt = pts.length/2 || 1;
  for (let i=0;i<N;i++){ const k = ((rnd()*cnt)|0)*2, x = (pts[k]||w/2) + rnd()*step, y = (pts[k+1]||h/2) + rnd()*step;
    const X = (x - w/2)/h*scale, Y = -(y - h/2)/h*scale;
    a[i*3]=X; a[i*3+1]=Y; a[i*3+2]= zf ? zf(X,Y) : gauss()*.08; }
  return a;
}

/* shapes */
function head(){
  return fromCanvas((g,w,h) => {
    g.beginPath(); g.ellipse(w*.5, h*.36, w*.175, h*.2, 0, 0, 7); g.fill();
    for (let i=0;i<260;i++){ const a = -Math.PI*(.05 + rnd()*.9), r = w*(.17 + rnd()*.05);
      g.beginPath(); g.arc(w*.5 + Math.cos(a)*r, h*.33 + Math.sin(a)*r*1.15, w*(.012 + rnd()*.03), 0, 7); g.fill(); }
    g.fillRect(w*.43, h*.5, w*.14, h*.14);
    g.beginPath(); g.moveTo(w*.42, h*.6);
    g.bezierCurveTo(w*.3, h*.68, w*.08, h*.7, w*.02, h*1.02);
    g.lineTo(w*.98, h*1.02);
    g.bezierCurveTo(w*.92, h*.7, w*.7, h*.68, w*.58, h*.6); g.closePath(); g.fill();
  }, 400, 480, 6.4, (X,Y) => {
    if (Y > -.5){ const rx = .95, ry = 1.25, dx = X/rx, dy = (Y-1.05)/ry; const q = 1 - dx*dx - dy*dy; return Math.sqrt(Math.max(0,q))*.85*(rnd()>.5?1:-1)*rnd()**.3; }
    return gauss()*.35;
  });
}
function clouds(){ const a = new Float32Array(N*3); for (let i=0;i<N;i++){ const top = i%2; a[i*3] = (top? 1.6:.2) + gauss()*2.1; a[i*3+1] = (top? 1.4:-1.4) + gauss()*.7 + a[i*3]*-.18; a[i*3+2] = gauss()*.6; } return a; }
function vortex(){ const a = new Float32Array(N*3); for (let i=0;i<N;i++){ const lv = (i%4), y = 1.9 - lv*1.15 + gauss()*.12, R = [1.5,1.65,1.4,1.75][lv]*(.7+rnd()*.35), t = rnd()*7; a[i*3]=Math.cos(t)*R*1.4; a[i*3+1]=y + Math.sin(t)*.28; a[i*3+2]=Math.sin(t)*R*.5; } return a; }
function sphere(){ const a = new Float32Array(N*3); for (let i=0;i<N;i++){ const y = 1 - (i/(N-1))*2, r = Math.sqrt(1-y*y), th = i*2.399963, R = 2.25 + gauss()*.03; a[i*3]=Math.cos(th)*r*R; a[i*3+1]=y*R; a[i*3+2]=Math.sin(th)*r*R; } return a; }
function bands(){ const s = sphere(); for (let i=0;i<N;i++){ const y = s[i*3+1], b = Math.round(y/0.75); s[i*3+1] = b*0.9 + (y - b*.75)*.5; s[i*3]*=.95+ (b%2)*.08; } return s; }
function mapShape(rings, h){
  let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
  for (const r of rings) for (const [x,y] of r){ minX=Math.min(minX,x); maxX=Math.max(maxX,x); minY=Math.min(minY,y); maxY=Math.max(maxY,y); }
  const W = 480, H = Math.round(W*(maxY-minY)/(maxX-minX)), pad = 10;
  return fromCanvas((g) => { g.beginPath(); for (const r of rings){ r.forEach(([x,y],i) => { const px = pad + (x-minX)/(maxX-minX)*(W-2*pad), py = pad + (maxY-y)/(maxY-minY)*(H-2*pad); i ? g.lineTo(px,py) : g.moveTo(px,py); }); g.closePath(); } g.fill('evenodd'); }, W, H, h, null, 2);
}
function dust(){ const a = new Float32Array(N*3); for (let i=0;i<N;i++){ const t = gauss()*1.4; a[i*3] = t*4.2; a[i*3+1] = t*1.4 + gauss()*.9; a[i*3+2] = gauss()*.7; } return a; }
function helix(){ const a = new Float32Array(N*3), ang = .38, c = Math.cos(ang), s = Math.sin(ang);
  for (let i=0;i<N;i++){ const t = rnd()*2-1, x = t*7.2, ph = x*1.05; let y, z;
    if (i%7 === 0){ const k = rnd(); y = Math.cos(ph)*.95*(2*k-1); z = Math.sin(ph)*.95*(2*k-1); }
    else { const off = i%2 ? Math.PI : 0, w = .95*(1+ gauss()*.06); y = Math.cos(ph+off)*w; z = Math.sin(ph+off)*w; }
    const X = x + gauss()*.04, Y = y + gauss()*.04;
    a[i*3] = X*c - Y*s; a[i*3+1] = X*s + Y*c - .2; a[i*3+2] = z; } return a; }
function ribbon(){ const a = new Float32Array(N*3); for (let i=0;i<N;i++){ const t = rnd()*2-1, x = t*7.5, w = gauss()*.35; a[i*3] = x; a[i*3+1] = Math.sin(t*3.2)*1.2 + .6 + w*Math.cos(t*6); a[i*3+2] = w*Math.sin(t*6)*2 + gauss()*.2; } return a; }
function loops(){ const a = new Float32Array(N*3); for (let i=0;i<N;i++){ const t = rnd(), ang = t*Math.PI*2*4.5, R = .75 + t*.25; a[i*3] = -3.6 + t*7.4 + Math.cos(ang)*R*.8 + gauss()*.12; a[i*3+1] = Math.sin(ang)*R*1.1 + t*.8 - .3 + gauss()*.12; a[i*3+2] = Math.sin(ang*.5)*.6 + gauss()*.15; } return a; }
function medal(){
  return fromCanvas((g,w,h) => {
    g.lineWidth = 16; g.beginPath(); g.arc(w/2, h*.6, h*.3, 0, 7); g.stroke();
    g.lineWidth = 5; g.beginPath(); g.arc(w/2, h*.6, h*.24, 0, 7); g.stroke();
    for (let s=-1; s<=1; s+=2) for (let i=0;i<9;i++){ const a = Math.PI/2 + s*(.35 + i*.27), r = h*.355;
      g.save(); g.translate(w/2 + Math.cos(a)*r, h*.6 + Math.sin(a)*r); g.rotate(a + s*1.1); g.beginPath(); g.ellipse(0,0,h*.035,h*.014,0,0,7); g.fill(); g.restore(); }
    g.font = '900 '+(h*.32)+'px Milker, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('1', w/2, h*.62);
    g.beginPath(); g.moveTo(w*.38, 0); g.lineTo(w*.47, h*.31); g.lineTo(w*.53, h*.31); g.lineTo(w*.62, 0); g.lineTo(w*.55, 0); g.lineTo(w/2, h*.2); g.lineTo(w*.45, 0); g.closePath(); g.fill();
  }, 400, 420, 5.2, null, 2);
}
function galaxy(){ const a = new Float32Array(N*3); for (let i=0;i<N;i++){ const arm = i%2, d = Math.pow(rnd(),.6)*2.7, ang = d*2.1 + arm*Math.PI + gauss()*.3; a[i*3]=Math.cos(ang)*d; a[i*3+1]=Math.sin(ang)*d*.92; a[i*3+2]=gauss()*.12; } return a; }
function frame(){
  const b = document.getElementById('cbox').getBoundingClientRect(), V = visH();
  const w = Math.max(1.6, b.width/innerHeight*V), h = Math.max(1, b.height/innerHeight*V), per = 2*(w+h), a = new Float32Array(N*3);
  for (let i=0;i<N;i++){ const s = rnd()*per, th = Math.abs(gauss())*.22 + .03; let x, y;
    if (s < w){ x = s-w/2; y = h/2+th; } else if (s < w+h){ x = w/2+th; y = h/2-(s-w); } else if (s < 2*w+h){ x = w/2-(s-w-h); y = -h/2-th; } else { x = -w/2-th; y = -h/2+(s-2*w-h); }
    a[i*3]=x+gauss()*.04; a[i*3+1]=y+gauss()*.04; a[i*3+2]=gauss()*.05; }
  return a;
}

const S = { head:head(), clouds:clouds(), vortex:vortex(), sphere:sphere(), bands:bands(),
  india:mapShape(MAPS.india, 4.9), japan:mapShape(MAPS.japan, 4.6), dust:dust(), helix:helix(), ribbon:ribbon(),
  loops:loops(), galaxy:galaxy(), medal:medal(), frame:null };
if (document.fonts) document.fonts.load('40px Milker').then(() => { S.medal = medal(); }).catch(() => {});
S.headRight = S.head;
/* rough 3D head-and-shoulders depth so the portrait has real volume */
function depth3d(X, Y){
  const eh = 1 - (X/1.7)**2 - ((Y-.75)/2.4)**2;
  let z = eh > 0 ? Math.sqrt(eh)*1.55 : 0;
  z += .38*Math.exp(-((X/.26)**2 + ((Y-.05)/.55)**2));
  z -= .12*Math.exp(-(((Math.abs(X)-.55)/.25)**2 + ((Y-.55)/.2)**2));
  const nb = Math.min(1, Math.max(0, (-.9 - Y)/.9));
  const body = Math.sqrt(Math.max(0, 1 - (X/4.1)**2))*1.25 - .45 - .25*Math.max(0, -1.8 - Y);
  return z*(1-nb) + Math.max(z*(1-nb), body)*nb - .5;
}
/* portrait: particle density follows the brightness of the reference portrait */
let portraitReady = false;
(function(){
  const img = new Image();
  img.onload = () => {
    const w = img.width, hh = img.height, c = document.createElement('canvas'); c.width = w; c.height = hh;
    const g = c.getContext('2d'); g.drawImage(img,0,0); const d = g.getImageData(0,0,w,hh).data;
    const px = [];
    for (let y=0;y<hh;y++) for (let x=0;x<w;x++){ const L = d[(y*w+x)*4]/255; if (L > .03) px.push(x, y, Math.pow(L,1.1)); }
    const cnt = px.length/3, a = new Float32Array(N*3), scale = 6.6;
    for (let i=0;i<N;i++){ let k, tries = 0; do { k = ((rnd()*cnt)|0)*3; } while (rnd() > px[k+2] && ++tries < 40);
      const x = px[k] + rnd(), y = px[k+1] + rnd(), X = (x - w/2)/hh*scale, Y = -(y - hh/2)/hh*scale;
      const face = Math.max(0, 1 - Math.hypot(X/1.2, (Y-.6)/1.7));
      a[i*3] = X; a[i*3+1] = Y; a[i*3+2] = face*.7 + gauss()*.03;
      if (i % 25 === 0){ a[i*3] += gauss()*.6; a[i*3+1] += gauss()*.6; } }
    S.head = a; S.headRight = a; portraitReady = true;
  };
  img.onerror = () => { portraitReady = true; };
  img.src = PORTRAIT;
})();
/* scattered starfield the particles start from */
S.scatter = (function(){ const a = new Float32Array(N*3), V = visH(), Wd = V*Math.max(1.4, innerWidth/innerHeight);
  for (let i=0;i<N;i++){ a[i*3] = (rnd()-.5)*Wd*1.15; a[i*3+1] = (rnd()-.5)*V*1.15 + .75; a[i*3+2] = (rnd()-.5)*5; } return a; })();
/* per-shape placement: [x desktop, y, scale, spin, x mobile] */
const P = { head:[0,-.25,1,.06,0], headRight:[3.1,-.25,1,.06,0], clouds:[.6,0,1,.05,0], vortex:[0,0,1,.4,0], sphere:[0,0,1,.5,0], bands:[0,0,1,.3,0],
  india:[-.4,0,1,0,0], japan:[-.6,0,1,0,0], dust:[0,0,.35,.05,0], helix:[-1.7,.1,1,0,0], ribbon:[0,.2,1,.05,0], loops:[1.9,0,1,.1,0], medal:[3.7,.1,1,.25,0], galaxy:[.2,0,1,.2,0], frame:[0,0,1,0,0] };

const geo = new THREE.BufferGeometry();
const pos = new Float32Array(S.scatter), aR = new Float32Array(N), dir = new Float32Array(N*3);
for (let i=0;i<N;i++){ aR[i] = rnd(); const t = rnd()*7, u = rnd()*2-1, r = Math.sqrt(1-u*u); dir[i*3]=Math.cos(t)*r; dir[i*3+1]=u; dir[i*3+2]=Math.sin(t)*r; }
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
geo.setAttribute('aR', new THREE.BufferAttribute(aR, 1));
const mat = new THREE.ShaderMaterial({
  transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
  uniforms:{ uPix:{value:renderer.getPixelRatio()}, uSize:{value: small()? 1.7 : 1.3}, uA:{value:1} },
  vertexShader:`attribute float aR; uniform float uPix,uSize; varying float vA;
    void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*mv;
      gl_PointSize = uSize*uPix*(.55+aR*1.1)*(8./-mv.z); vA = .35+aR*.65; }`,
  fragmentShader:`uniform float uA; varying float vA;
    void main(){ float d = length(gl_PointCoord-.5); if(d>.5) discard; gl_FragColor = vec4(vec3(.95),(1.-d*2.)*vA*uA*.85); }`
});
const group = new THREE.Group(); group.add(new THREE.Points(geo, mat)); scene.add(group);

/* sections */
const secs = [...document.querySelectorAll('[data-shape]')];
let centers = [];
function measure(){
  const max = document.documentElement.scrollHeight - innerHeight;
  centers = secs.map(s => { const r = s.getBoundingClientRect(), top = r.top + scrollY;
    if (s.classList.contains('works') && !small()) return Math.min(max, top + (r.height - innerHeight)/2);
    return Math.min(max, top + r.height/2 - innerHeight/2); });
}
function sizeRing(){ const R = 2.25/visH()*innerHeight*2*1.34; document.documentElement.style.setProperty('--ring', Math.round(Math.min(R, innerWidth-32))+'px'); }
function resize(){
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth/innerHeight; camera.position.z = innerWidth < 760 ? 11 : 8; camera.updateProjectionMatrix();
  sizeWorks(); measure(); sizeRing(); S.frame = frame();
  ortho.left = -innerWidth/2; ortho.right = innerWidth/2; ortho.top = innerHeight/2; ortho.bottom = -innerHeight/2; ortho.updateProjectionMatrix();
}

/* ---------------- wavy project cards ---------------- */
const cardScene = new THREE.Scene();
const ortho = new THREE.OrthographicCamera(-1,1,1,-1,-10,10);
const cards = [...document.querySelectorAll('.card')].map(el => {
  const m = new THREE.ShaderMaterial({ transparent:true,
    uniforms:{ uTex:{value:null}, uT:{value:0}, uWave:{value:0}, uHover:{value:0}, uRev:{value:0}, uMouse:{value:new THREE.Vector2(.5,.5)}, uAsp:{value:1.6}, uSize:{value:new THREE.Vector2(1,1)} },
    vertexShader:`uniform float uT,uWave,uHover; uniform vec2 uSize; varying vec2 vUv;
      void main(){ vUv = uv; vec3 p = position; float amp = (.012 + uWave*.05 + uHover*.02);
        p.y += sin(p.x*5.5 + uT*1.6)*amp + sin(p.x*2.1 - uT)*amp*.6;
        p.x += sin(p.y*4. + uT*1.3)*amp*.5;
        gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
    fragmentShader:`uniform sampler2D uTex; uniform float uT,uRev,uAsp; uniform vec2 uMouse; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
      float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*n(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }
      void main(){
        vec4 img = texture2D(uTex, vUv);
        vec2 q = vec2(vUv.x*uAsp, vUv.y);
        float f = fbm(q*3. + vec2(uT*.12, -uT*.08)), g = fbm(q*6. - vec2(uT*.2, uT*.05) + f*2.);
        vec3 opal = .5 + .5*cos(6.2831*(vec3(0.,.33,.67) + f*1.6 + g*.8 + uT*.05));
        vec3 pearl = mix(vec3(.96,.96,.975), opal, .13 + .07*g);
        float sheen = smoothstep(.0,.08, .08 - abs(fract(vUv.x*.8 + vUv.y*.6 - uT*.12) - .5 + .02*sin(uT+vUv.y*9.)));
        pearl += sheen*.25 - (1.-f)*.06;
        float sparkle = step(.996, h(floor(vUv*vec2(uAsp,1.)*260.) + floor(uT*6.)));
        pearl += sparkle*.6;
        vec2 dm = vec2((vUv.x-uMouse.x)*uAsp, vUv.y-uMouse.y);
        float r = uRev*2.2, edge = .06 + .1*g;
        float m = (1. - smoothstep(r - edge, r + edge, length(dm) + (f-.5)*.25)) * smoothstep(0.,.04,uRev);
        vec3 col = mix(pearl, img.rgb, m);
        float rim = smoothstep(edge, 0., abs(length(dm) + (f-.5)*.25 - r)) * step(.001,uRev) * (1.-step(.99,uRev));
        col += rim*opal*.6;
        gl_FragColor = vec4(col, img.a);
      }`
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1,1,40,24), m); mesh.visible = false; cardScene.add(mesh);
  const c = { el, media: el.querySelector('.media'), mesh, hover:0, ht:0, rev:0, mx:.5, my:.5 };
  const setM = e => { const r = c.media.getBoundingClientRect(); c.mx = (e.clientX - r.left)/r.width; c.my = 1 - (e.clientY - r.top)/r.height; };
  el.addEventListener('pointerenter', e => { c.ht = 1; setM(e); }); el.addEventListener('pointerleave', () => c.ht = 0);
  el.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && c.rev < .05) setM(e); });
  el.addEventListener('pointerdown', e => { setM(e); c.ht = 1; if (e.pointerType !== 'mouse'){ clearTimeout(c.to); c.to = setTimeout(() => c.ht = 0, 4000); } });
  makeTexture(el).then(t => { m.uniforms.uTex.value = t; mesh.visible = true; });
  return c;
});
function makeTexture(el){
  return new Promise(res => {
    const W = 1280, H = 800, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    g.fillStyle = el.dataset.mat; g.fillRect(0,0,W,H);
    const ix = W*.07, iy = H*.075, iw = W - ix*2, ih = H - iy*2;
    const done = () => { const t = new THREE.CanvasTexture(cv); t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; res(t); };
    if (el.dataset.sat){
      g.fillStyle = '#16211f'; g.fillRect(ix,iy,iw,ih);
      const gr = g.createRadialGradient(ix+iw*.4, iy+ih*.58, 10, ix+iw*.4, iy+ih*.58, iw*.3); gr.addColorStop(0,'#2d4a63'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(ix,iy,iw,ih);
      const gr2 = g.createRadialGradient(ix+iw*.72, iy+ih*.3, 10, ix+iw*.72, iy+ih*.3, iw*.25); gr2.addColorStop(0,'#3b4f33'); gr2.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle = gr2; g.fillRect(ix,iy,iw,ih);
      g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1; for (let x=ix;x<ix+iw;x+=36){ g.beginPath(); g.moveTo(x,iy); g.lineTo(x,iy+ih); g.stroke(); } for (let y=iy;y<iy+ih;y+=36){ g.beginPath(); g.moveTo(ix,y); g.lineTo(ix+iw,y); g.stroke(); }
      g.setLineDash([12,8]); g.strokeStyle = '#9fd3ff'; g.lineWidth = 3; g.strokeRect(ix+iw*.25, iy+ih*.42, iw*.3, ih*.32); g.setLineDash([]);
      g.fillStyle = '#9fd3ff'; g.font = '500 30px Geist, Arial'; g.fillText('water · 0.91', ix+iw*.25, iy+ih*.42-14);
      g.fillStyle = 'rgba(20,22,26,.85)'; g.fillRect(ix+iw*.05, iy+ih*.82, iw*.9, 70); g.fillStyle = '#e9e8ea'; g.font = '400 30px Geist, Arial'; g.fillText('› Where is the water in this image?', ix+iw*.08, iy+ih*.82+45);
      return done();
    }
    const img = new Image(); img.onload = () => {
      const r = Math.max(iw/img.width, ih/img.height), sw = iw/r, sh = ih/r;
      g.drawImage(img, 0, 0, sw, sh, ix, iy, iw, ih); done(); };
    img.onerror = done; img.src = el.querySelector('img').src;
  });
}

addEventListener('resize', resize); resize();
addEventListener('load', () => { measure(); S.frame = frame(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); S.frame = frame(); });

/* ---------------- loop ---------------- */
const smooth = t => t*t*(3-2*t);
const names = secs.map(s => s.dataset.shape);
const LT = { start:null, tgt:new Float32Array(N*3) };
let time = 0, last = performance.now(), lastY = scrollY, vel = 0, gmx = 0, gmy = 0, hasPtr = false;
const tgt = new Float32Array(N*3);
addEventListener('pointermove', e => { gmx = e.clientX/innerWidth - .5; gmy = e.clientY/innerHeight - .5; hasPtr = true; }, {passive:true});

function frameLoop(now){
  const dt = Math.min(.05, (now-last)/1000); last = now; time += dt;
  const y = scrollY; vel += ((Math.min(1, Math.abs(y - lastY)/60)) - vel)*.1; lastY = y;
  let i = 0; while (i < centers.length-1 && y > centers[i+1]) i++;
  let t = 0, j = i;
  if (i < centers.length-1 && y > centers[i]){ j = i+1; t = (y - centers[i]) / Math.max(1, centers[j]-centers[i]); t = smooth(Math.min(1, Math.max(0, (t-.15)/.7))); }
  let na = names[i], nb = names[j], A = S[na], B = S[nb], pa = P[na], pb = P[nb];
  let burst = Math.sin(Math.PI*t) * (na===nb ? 0 : 1.1);
  if (!LOADER.done){
    window.__glLoader = true;
    if (LT.start === null && portraitReady) LT.start = time;
    const lt = LT.start === null ? 0 : time - LT.start;
    const sc = small() ? .62 : 1, u = visH()/innerHeight/sc, cx0 = small() ? 0 : -P.head[0]/sc, cy0 = -P.head[1]/sc;
    LOADER.p = Math.min(1, lt/2.6);
    const T = LT.tgt, p = LOADER.p, R = 46*u, NC = 28, sk = S.scatter;
    if (lt < 2.6){
      for (let n=0,q=0;n<N;n++,q+=3){
        const c = n % NC;
        if (n % 22 === 0 && c < p*NC){ const a = -Math.PI/2 + c/NC*Math.PI*2, j = (.5 + 2.4*c/NC)*u;
          T[q] = cx0 + Math.cos(a)*R + dir[q]*j; T[q+1] = cy0 - Math.sin(a)*R + dir[q+1]*j; T[q+2] = 0; }
        else { const f = 1 - .3*p; T[q] = cx0 + (sk[q]-cx0)*f; T[q+1] = cy0 + (sk[q+1]-cy0)*f; T[q+2] = sk[q+2]*f; }
      }
    } else if (lt < 3.05){
      for (let n=0,q=0;n<N;n++,q+=3){ const r = (6 + 22*aR[n])*u; T[q] = cx0 + dir[q]*r; T[q+1] = cy0 + dir[q+1]*r; T[q+2] = dir[q+2]*r; }
    } else if (lt < 3.4){
      const VR = visH()/sc*.55; for (let n=0,q=0;n<N;n++,q+=3){ const r = (.15 + .85*Math.sqrt(aR[n]))*VR; T[q] = cx0 + dir[q]*r*1.3; T[q+1] = cy0 + dir[q+1]*r; T[q+2] = dir[q+2]*r*.5; }
    } else {
      T.set(S.head);
      if (lt > 5) finishLoad();
    }
    A = B = T; na = nb = 'head'; pa = pb = P.head; t = 0; burst = 0;
  }
  const k = reduce ? 1 : 1 - Math.pow(.004, dt);
  const sc0 = small() ? .62 : 1, V = visH();
  const rx = (gmx*V*camera.aspect - group.position.x)/sc0, ry = (-gmy*V - group.position.y)/sc0, rr = .55, push = (fine && hasPtr && !reduce) ? .5 : 0;
  const breathe = reduce ? 0 : .04;
  for (let n=0, q=0; n<N; n++, q+=3){
    const w = burst*(.4 + aR[n]);
    const wob = Math.sin(time*.8 + aR[n]*40)*breathe;
    tgt[q]   = A[q]   + (B[q]  -A[q]  )*t + dir[q]*w   + wob;
    tgt[q+1] = A[q+1] + (B[q+1]-A[q+1])*t + dir[q+1]*w + wob*.7;
    tgt[q+2] = A[q+2] + (B[q+2]-A[q+2])*t + dir[q+2]*w;
    if (push){ const dx = tgt[q]-rx, dy = tgt[q+1]-ry, d2 = dx*dx+dy*dy; if (d2 < rr*rr){ const d = Math.sqrt(d2)+1e-4, f = (1-d/rr)*push; tgt[q] += dx/d*f; tgt[q+1] += dy/d*f; } }
    pos[q] += (tgt[q]-pos[q])*k; pos[q+1] += (tgt[q+1]-pos[q+1])*k; pos[q+2] += (tgt[q+2]-pos[q+2])*k;
  }
  geo.attributes.position.needsUpdate = true;
  const ox = small() ? 0 : pa[0] + (pb[0]-pa[0])*t, oy = pa[1] + (pb[1]-pa[1])*t, sp = pa[3] + (pb[3]-pa[3])*t;
  group.position.x += (ox - group.position.x)*k; group.position.y += (oy - group.position.y)*k;
  mat.uniforms.uA.value += ((pa[2] + (pb[2]-pa[2])*t) - mat.uniforms.uA.value)*k;
  const sc = small() ? .62 : 1; group.scale.setScalar(sc);
  group.rotation.y = Math.sin(time*.25)*.6*sp + gmx*.25*(1-(na==='frame'?1:0));
  group.rotation.x = gmy*.12;
  if (na === 'galaxy' || nb === 'galaxy') group.rotation.z = time*.05*((na==='galaxy'?1-t:0)+(nb==='galaxy'?t:0));
  else group.rotation.z *= .95;

  /* cards */
  for (const c of cards){
    const r = c.media.getBoundingClientRect();
    const vis = r.right > -50 && r.left < innerWidth+50 && r.bottom > -50 && r.top < innerHeight+50;
    c.mesh.visible = vis && !!c.mesh.material.uniforms.uTex.value;
    if (!vis) continue;
    c.hover += (c.ht - c.hover)*.08;
    c.rev += ((reduce ? c.ht : c.ht) - c.rev)*(c.ht ? .035 : .06);
    c.mesh.position.set(r.left + r.width/2 - innerWidth/2, innerHeight/2 - (r.top + r.height/2), 0);
    c.mesh.scale.set(r.width, r.height, 1);
    const u = c.mesh.material.uniforms; u.uT.value = time; u.uWave.value = reduce ? 0 : vel; u.uHover.value = c.hover; u.uRev.value = c.rev; u.uMouse.value.set(c.mx, c.my); u.uAsp.value = r.width/r.height;
  }

  renderer.clear(); renderer.render(scene, camera); renderer.clearDepth(); renderer.render(cardScene, ortho);
  requestAnimationFrame(frameLoop);
}
requestAnimationFrame(frameLoop);
})();
