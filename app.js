
(function(){
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasG = !!window.gsap;
if (hasG && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* плавный скролл */
let lenis = null;
if (window.Lenis && !reduce) {
  lenis = new Lenis({lerp: .09, smoothWheel: true});
  if (hasG) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  else { (function r(t){lenis.raf(t);requestAnimationFrame(r)})(); }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const el = document.querySelector(id); if (!el) return;
    e.preventDefault(); lenis.scrollTo(el, {offset: -20, duration: 1.4});
  }));
}

/* малина: последовательность кадров из Блендера */
const cv = document.getElementById('spin'), ctx = cv.getContext('2d');
const F = 36, frames = []; let loaded = 0, cur = -1;
for (let i = 0; i < F; i++) {
  const im = new Image(); im.src = 'https://cdn.jsdelivr.net/gh/Oza8383/neiromalina-site@main/img/spin/b' + String(i).padStart(2, '0') + '.webp';
  im.onload = () => { loaded++; if (i === 0) draw(0); }; frames.push(im);
}
function draw(i) {
  i = ((Math.round(i) % F) + F) % F;
  if (i === cur || !frames[i].complete) return; cur = i;
  ctx.clearRect(0, 0, 720, 720); ctx.drawImage(frames[i], 0, 0, 720, 720);
}
let auto = 0, scrollRot = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; });
const depthEls = [...document.querySelectorAll('.hero [data-depth]')];
const hero = document.querySelector('.hero');
(function loop() {
  auto += reduce ? 0 : .06;
  mx += (tmx - mx) * .06; my += (tmy - my) * .06;
  const sy = scrollY;
  if (sy < hero.offsetHeight * 1.2) {
    draw(auto + sy / 22 + mx * 8);
    cv.style.transform = `translate(-50%,-50%) translate(${mx * 30}px,${my * 24 + sy * .18}px) rotate(${mx * 6}deg) scale(${1 - Math.min(sy / 2600, .2)})`;
    depthEls.forEach(el => {
      const d = +el.dataset.depth;
      const base = el.classList.contains('giant') ? 'translate(-50%,-50%) ' : '';
      el.style.transform = base + `translate3d(${mx * -120 * d}px,${my * -90 * d - sy * d * .35}px,0)`;
    });
  }
  requestAnimationFrame(loop);
})();

/* бегущая строка */
const words = ['письма', 'посты', 'таблицы', 'фото', 'видео', 'чат-боты', 'жизнь малина'];
const icons = ['berry-s', 'o-lilac', 'o-glass'];
const row = document.getElementById('tick');
let html = '';
for (let k = 0; k < 2; k++) words.forEach((w, i) => html += `<span>${w}<img src="https://cdn.jsdelivr.net/gh/Oza8383/neiromalina-site@main/img/${icons[i % 3]}.webp" alt=""></span>`);
row.innerHTML = html;

/* курсор */
if (fine) {
  const c = document.querySelector('.cur'), r = document.querySelector('.cur-ring');
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
  addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; c.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`; });
  /* жидкая капля: тянется по скорости и направлению */
  let pvx=0,pvy=0,sc=1;
  (function l() { const nx=rx+(x-rx)*.16, ny=ry+(y-ry)*.16; pvx=nx-rx; pvy=ny-ry; rx=nx; ry=ny;
    const v=Math.min(Math.hypot(pvx,pvy),40), ang=Math.atan2(pvy,pvx)*57.3; sc+=((1+v/30)-sc)*.25;
    r.style.transform = r.classList.contains('has-lbl') ? `translate(${rx}px,${ry}px) translate(-50%,-50%)` : `translate(${rx}px,${ry}px) translate(-50%,-50%) rotate(${ang}deg) scale(${sc},${1/Math.sqrt(sc)})`;
    requestAnimationFrame(l); })();
  /* шлейф искр и малинок, взрыв по клику */
  const tc=document.getElementById('ctrail'),tx=tc.getContext('2d'),berryI=new Image();berryI.src='https://cdn.jsdelivr.net/gh/Oza8383/neiromalina-site@main/img/berry-s.webp';
  let TP=[],lx=x,ly=y,TW,TH,dpr=Math.min(devicePixelRatio||1,2);
  function ts(){TW=innerWidth;TH=innerHeight;tc.width=TW*dpr;tc.height=TH*dpr;tx.setTransform(dpr,0,0,dpr,0,0);} ts();addEventListener('resize',ts);
  const cols=['255,94,79','155,123,255','255,110,160','106,69,224'];
  function emit(px,py,n,spd,berries){for(let i=0;i<n;i++){const a=Math.random()*6.283,s=Math.random()*spd;TP.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s-(berries?1:0),l:1,d:.012+Math.random()*.02,r:1.6+Math.random()*2.8,c:cols[Math.random()*4|0],b:berries&&Math.random()<.35,rot:Math.random()*6,vr:(Math.random()-.5)*.2});}}
  addEventListener('pointermove',e=>{const d=Math.hypot(e.clientX-lx,e.clientY-ly);if(d>6){emit(e.clientX,e.clientY,Math.min(3,1+d/30|0),1.2,false);if(Math.random()<.04)TP.push({x:e.clientX,y:e.clientY,vx:(Math.random()-.5),vy:-.5,l:1,d:.012,r:0,c:'',b:true,rot:0,vr:.05});lx=e.clientX;ly=e.clientY;}});
  const waves=[];
  addEventListener('pointerdown',e=>{emit(e.clientX,e.clientY,26,7,true);waves.push({x:e.clientX,y:e.clientY,r:6,l:1});});
  (function tl(){tx.clearRect(0,0,TW,TH);
    for(const w of waves){w.r+=6;w.l-=.04;tx.beginPath();tx.strokeStyle=`rgba(255,157,184,${Math.max(w.l,0)})`;tx.lineWidth=2;tx.arc(w.x,w.y,w.r,0,6.283);tx.stroke();}
    for(let i=waves.length-1;i>=0;i--)if(waves[i].l<=0)waves.splice(i,1);
    for(const p of TP){p.x+=p.vx;p.y+=p.vy;p.vx*=.95;p.vy=p.vy*.95+.04;p.l-=p.d;p.rot+=p.vr;
      if(p.b){if(berryI.complete){const s=16*Math.max(p.l,0)+6;tx.save();tx.globalAlpha=Math.max(p.l,0);tx.translate(p.x,p.y);tx.rotate(p.rot);tx.drawImage(berryI,-s/2,-s/2,s,s);tx.restore();}}
      else{tx.beginPath();tx.fillStyle=`rgba(${p.c},${Math.max(p.l,0)})`;tx.shadowColor=`rgba(${p.c},.9)`;tx.shadowBlur=8;tx.arc(p.x,p.y,p.r*Math.max(p.l,.1),0,6.283);tx.fill();}}
    tx.shadowBlur=0;TP=TP.filter(p=>p.l>0);if(TP.length>400)TP.splice(0,TP.length-400);
    requestAnimationFrame(tl);})();
  document.querySelectorAll('a,button,summary,.mod').forEach(el => { el.addEventListener('mouseenter', () => r.classList.add('big')); el.addEventListener('mouseleave', () => r.classList.remove('big')); });
  /* магнитные кнопки */
  document.querySelectorAll('.mag').forEach(b => {
    b.addEventListener('mousemove', e => { const q = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - q.left - q.width / 2) * .25}px,${(e.clientY - q.top - q.height / 2) * .35}px)`; });
    b.addEventListener('mouseleave', () => b.style.transform = '');
  });
  /* наклон билета */
  document.querySelectorAll('.tilt').forEach(el => {
    el.addEventListener('mousemove', e => { const q = el.getBoundingClientRect(); el.style.transform = `rotateY(${((e.clientX - q.left) / q.width - .5) * 10}deg) rotateX(${-((e.clientY - q.top) / q.height - .5) * 10}deg)`; });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });
}

/* шапка прячется при прокрутке вниз */
let last = 0; const hdr = document.getElementById('hdr');
addEventListener('scroll', () => { const y = scrollY; hdr.classList.toggle('hide', y > last && y > 300); last = y; }, {passive: true});

/* формы */
document.querySelectorAll('.lead-form').forEach(f => f.addEventListener('submit', e => {
  e.preventDefault(); const ok = f.nextElementSibling; ok.textContent = f.dataset.ok; f.style.display = 'none'; ok.style.display = 'block';
}));

/* разбиваем манифест на слова */
const mf = document.getElementById('mf');
mf.innerHTML = mf.innerHTML.replace(/(<span class="hl">.*?<\/span>|[^\s<]+)/g, m => `<span class="w">${m}</span>`);




/* ===== ПОРТРЕТ ИЗ ЧАСТИЦ ===== */
(function(){
  const box=document.getElementById('me3d'); if(!box) return;
  const wrap=box.querySelector('.me-wrap'),img=wrap.querySelector('.me');
  const cv=document.createElement('canvas');cv.className='pcv';wrap.appendChild(cv);const x=cv.getContext('2d');
  let P=[],W=0,H=0,buf,d32,ready=false,active=false,hover=false,mx=-9999,my=-9999,calm=0,seen=false;
  const pink=(255<<24)|(184<<16)|(157<<8)|255, lil=(255<<24)|(255<<16)|(162<<8)|185;
  function build(){
    W=Math.round(img.clientWidth);H=Math.round(img.clientHeight); if(!W||!H) return false;
    cv.width=W;cv.height=H;cv.style.width=W+'px';cv.style.height=H+'px';cv.style.left=img.offsetLeft+'px';cv.style.top=img.offsetTop+'px';
    const o=document.createElement('canvas');o.width=W;o.height=H;const ox=o.getContext('2d');ox.drawImage(img,0,0,W,H);
    let d; try{d=ox.getImageData(0,0,W,H).data;}catch(e){return false;}
    P=[];const st=W>420?3:4;
    for(let yy=0;yy<H;yy+=st)for(let xx=0;xx<W;xx+=st){const i=(yy*W+xx)*4;if(d[i+3]>110)P.push({hx:xx,hy:yy,x:xx,y:yy,vx:0,vy:0,dl:0,c:(255<<24)|(d[i+2]<<16)|(d[i+1]<<8)|d[i],g:Math.random()<.5?pink:lil});}
    buf=x.createImageData(W,H);d32=new Uint32Array(buf.data.buffer);ready=true;return true;
  }
  function scatter(cx,cy,mode){
    for(const p of P){
      if(mode==='gen'){const a=Math.random()*6.283,r=Math.max(W,H)*(.5+Math.random()*.7);p.x=W/2+Math.cos(a)*r;p.y=H/2+Math.sin(a)*r;p.vx=p.vy=0;p.dl=Math.floor((H-p.hy)/H*40+Math.random()*25);}
      else{const dx=p.hx-cx,dy=p.hy-cy,dd=Math.hypot(dx,dy)+1,f=(18+Math.random()*22)*Math.min(1,180/dd);p.vx+=dx/dd*f;p.vy+=dy/dd*f-Math.random()*4;p.dl=0;}
    }
    wake();
  }
  function wake(){active=true;calm=0;box.classList.add('pmode');}
  function step(){
    if(!active) return;
    d32.fill(0);let energy=0;
    for(const p of P){
      if(p.dl>0){p.dl--;}else{
        let ax=(p.hx-p.x)*.055,ay=(p.hy-p.y)*.055;
        if(hover){const dx=p.x-mx,dy=p.y-my,dd=dx*dx+dy*dy;if(dd<6400){const q=Math.sqrt(dd)+.1,f=(80-q)/80*6;ax+=dx/q*f;ay+=dy/q*f;}}
        p.vx=(p.vx+ax)*.84;p.vy=(p.vy+ay)*.84;p.x+=p.vx;p.y+=p.vy;}
      const sp=Math.abs(p.vx)+Math.abs(p.vy);energy+=sp+Math.abs(p.hx-p.x)*.05;
      const ix=p.x|0,iy=p.y|0;
      if(ix>=0&&iy>=0&&ix<W-1&&iy<H-1){const col=sp>2.2?p.g:p.c,k=iy*W+ix;d32[k]=col;d32[k+1]=col;d32[k+W]=col;d32[k+W+1]=col;}
    }
    x.putImageData(buf,0,0);
    if(!hover&&energy/P.length<.05){if(++calm>20){active=false;box.classList.remove('pmode');}}else calm=0;
  }
  (function loop(){step();requestAnimationFrame(loop);})();
  function local(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height];}
  box.addEventListener('pointermove',e=>{if(!ready)return;[mx,my]=local(e);hover=true;wake();});
  box.addEventListener('pointerleave',()=>{hover=false;mx=my=-9999;});
  box.addEventListener('click',e=>{if(!ready)return;const[a,b]=local(e);scatter(a,b,'burst');});
  function init(){ if(seen) return; if(!build()) return; seen=true; if(!reduce) scatter(0,0,'gen'); }
  new IntersectionObserver(es=>{if(es[0].isIntersecting){img.complete?init():img.addEventListener('load',init,{once:true});}},{threshold:.35}).observe(box);
  addEventListener('resize',()=>{if(ready){const wasSeen=seen;build();}});
})();

/* ===== 3D-портрет: слои двигаются на разной глубине ===== */
(function(){
  const box=document.getElementById('me3d'); if(!box) return;
  const L=[...box.querySelectorAll('.L')];
  let tx=0,ty=0,cx=0,cy=0;
  box.addEventListener('pointermove',e=>{const q=box.getBoundingClientRect();tx=(e.clientX-q.left)/q.width-.5;ty=(e.clientY-q.top)/q.height-.5;});
  box.addEventListener('pointerleave',()=>{tx=ty=0;});
  (function f(t){ cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;
    const idle=reduce?0:Math.sin((t||0)/1600)*.15;
    L.forEach(el=>{const z=+el.dataset.z;el.style.transform=`translate3d(${(cx+idle*.3)*z*-46}px,${cy*z*-34}px,0)`;});
    box.style.transform=`rotateY(${cx*10}deg) rotateX(${-cy*8}deg)`;
    requestAnimationFrame(f);})();
})();

/* ===== ВИТРИНА: подсветка за курсором ===== */
document.querySelectorAll('.tile').forEach(t=>t.addEventListener('pointermove',e=>{const q=t.getBoundingClientRect();t.style.setProperty('--x',(e.clientX-q.left)+'px');t.style.setProperty('--y',(e.clientY-q.top)+'px');}));

/* ===== ВИТРИНА: чат печатает ===== */
(function(){
  const box=document.getElementById('msgs'); if(!box) return;
  const S=[
    ['Напиши клиенту, что заказ задержится на два дня. Вежливо и без канцелярита','Здравствуйте, Анна! Честно предупреждаю: заказ приедет на два дня позже, в пятницу. Простите за ожидание. Если удобнее, привезём в субботу утром.'],
    ['Придумай темы постов для кофейни на неделю','1. Как мы выбираем зёрна\n2. Бариста советует: кофе к десерту\n3. Закулисье: как чистим кофемашину\n4. Опрос: раф или флэт уайт?\n5. Утро понедельника без спешки'],
    ['Сделай из этой таблицы короткий отчёт для начальника','Коротко: продажи во втором квартале выросли, лучше всего шли подарочные наборы. Просела только доставка. Предлагаю обсудить её в четверг.']
  ];
  let k=0,run=false;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function play(){ if(run) return; run=true;
    while(true){ const [q,a]=S[k%S.length]; k++;
      box.innerHTML='';
      const u=document.createElement('div');u.className='m u';box.appendChild(u);
      await sleep(80);u.classList.add('on');
      for(let i=0;i<=q.length;i++){u.textContent=q.slice(0,i);await sleep(reduce?0:22);}
      await sleep(350);
      const m=document.createElement('div');m.className='m a';m.innerHTML='<div class="ai-h"><img src="https://cdn.jsdelivr.net/gh/Oza8383/neiromalina-site@main/img/berry-s.webp" alt="">Нейросеть</div><span class="dots"><b></b><b></b><b></b></span>';box.appendChild(m);
      await sleep(60);m.classList.add('on');await sleep(900);
      const t=document.createElement('span');m.querySelector('.dots').replaceWith(t);
      const c=document.createElement('span');c.className='caret';m.appendChild(c);
      for(let i=0;i<=a.length;i+=2){t.textContent=a.slice(0,i);await sleep(reduce?0:16);}
      c.remove();await sleep(3200);
    }}
  new IntersectionObserver(e=>{if(e[0].isIntersecting)play();},{threshold:.3}).observe(box);
})();

/* ===== ВИТРИНА: картинка проявляется из шума ===== */
(function(){
  const g=document.getElementById('gen'); if(!g) return;
  const img=g.querySelector('img'),cv=g.querySelector('canvas'),x=cv.getContext('2d'),sc=g.querySelector('.scan'),pp=document.getElementById('genp');
  let p=0,dir=1,on=false;
  new IntersectionObserver(e=>{on=e[0].isIntersecting;},{threshold:.2}).observe(g);
  (function f(){ if(on){ const w=cv.width=g.clientWidth/3|0,h=cv.height=g.clientHeight/3|0;
      p+=dir*(reduce?1:.0045); if(p>1.35){dir=-1;} if(p<-.05){dir=1;}
      const q=Math.min(1,Math.max(0,p));
      const d=x.createImageData(w,h),a=(1-q)*150;
      for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=v;d.data[i+1]=v*.6;d.data[i+2]=v;d.data[i+3]=a;}
      x.putImageData(d,0,0);
      img.style.filter=`blur(${(1-q)*18}px) saturate(${.3+q*.7})`;img.style.transform=`scale(${1.1-q*.1})`;
      sc.style.top=(q*110-10)+'%';sc.style.opacity=q<1?1:0;
      pp.textContent=Math.round(q*100)+'%'; }
    requestAnimationFrame(f);})();
})();

/* ===== ВИТРИНА: бот гоняет заявки ===== */
(function(){
  const fl=document.getElementById('flow'); if(!fl) return;
  const svg=fl.querySelector('svg'),paths=[document.getElementById('p1'),document.getElementById('p2')];
  const toast=document.getElementById('toast'),names=['Мария','Олег','Светлана','Ильдар','Катя'];
  let n=0,on=false;
  new IntersectionObserver(e=>{on=e[0].isIntersecting;},{threshold:.2}).observe(fl);
  function dot(path,delay,cb){ const L=path.getTotalLength(),c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('r','1.6');c.setAttribute('fill','#FF9DB8');c.style.filter='drop-shadow(0 0 3px #FF9DB8)';svg.appendChild(c);
    const t0=performance.now()+delay;
    (function f(t){const k=(t-t0)/1100; if(k<0){requestAnimationFrame(f);return;} if(k>1){c.remove();cb&&cb();return;}
      const pt=path.getPointAtLength(L*k);c.setAttribute('cx',pt.x);c.setAttribute('cy',pt.y);requestAnimationFrame(f);})(performance.now());
  }
  function cycle(){ if(on){ dot(paths[0],0,()=>dot(paths[1],250,()=>{toast.querySelector('span').textContent=names[n++%names.length]+': ответ отправлен';toast.classList.add('on');setTimeout(()=>toast.classList.remove('on'),1800);})); }
    setTimeout(cycle,2600);}
  cycle();
})();

/* ===== ВИТРИНА: ролик с субтитрами ===== */
(function(){
  const sub=document.getElementById('sub'),pr=document.getElementById('vprog'),wv=document.getElementById('wave'); if(!sub) return;
  for(let i=0;i<26;i++){const b=document.createElement('i');b.style.animationDelay=(-Math.random())+'s';b.style.animationDuration=(.6+Math.random()*.8)+'s';wv.appendChild(b);}
  const words='Привет! Этот ролик я собрал за один вечер с нейросетью'.split(' ');
  sub.innerHTML=words.map(w=>`<span>${w}</span>`).join(' ');
  const sp=[...sub.children];let i=0;
  setInterval(()=>{sp.forEach((s,j)=>s.classList.toggle('on',j===i%sp.length));pr.style.width=((i%sp.length+1)/sp.length*100)+'%';i++;},reduce?2000:420);
})();

/* ===== жидкий градиент на WebGL ===== */
(function(){
  const c=document.getElementById('liquid'); const gl=c.getContext('webgl'); if(!gl) return;
  const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs=`precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}
  void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=uv;q.x*=r.x/r.y;
    float tt=t*.06;vec2 w=vec2(fbm(q*1.6+tt),fbm(q*1.6-tt+5.2));
    float f=fbm(q*1.3+w*1.8+vec2(m.x*.4,m.y*.3));
    vec3 night=vec3(.07,.03,.12),lil=vec3(.42,.3,.95),cor=vec3(1.,.37,.31),pk=vec3(1.,.55,.7);
    vec3 col=mix(night,lil,smoothstep(.35,.85,f)*.75);
    col=mix(col,cor,smoothstep(.55,.95,fbm(q*1.1-w+tt*2.))*.55);
    col=mix(col,pk,smoothstep(.75,1.,f)*.35);
    float d=length(uv-vec2(.5+m.x*.2,.5-m.y*.2));col+=lil*.12*(1.-smoothstep(0.,.6,d));
    col*=1.-smoothstep(.4,1.2,length(uv-.5))*.6;
    gl_FragColor=vec4(col,1.);}`;
  function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o;}
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const lp=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
  const ur=gl.getUniformLocation(pr,'r'),ut=gl.getUniformLocation(pr,'t'),um=gl.getUniformLocation(pr,'m');
  function size(){const k=.5;c.width=c.clientWidth*k;c.height=c.clientHeight*k;gl.viewport(0,0,c.width,c.height);}
  size();addEventListener('resize',size);
  const t0=performance.now();
  (function f(){ if(scrollY<innerHeight*1.3){gl.uniform2f(ur,c.width,c.height);gl.uniform1f(ut,(performance.now()-t0)/1000*(reduce?0:1));gl.uniform2f(um,mx,my);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);} requestAnimationFrame(f);})();
})();

/* ===== частицы, разбегающиеся от курсора ===== */
(function(){
  const c=document.getElementById('parts'),x=c.getContext('2d'); if(reduce) return;
  const berry=new Image();berry.src='https://cdn.jsdelivr.net/gh/Oza8383/neiromalina-site@main/img/berry-s.webp';
  let W,H,P=[],px=-999,py=-999;
  function size(){W=c.width=c.clientWidth;H=c.height=c.clientHeight;}
  size();addEventListener('resize',size);
  const N=innerWidth<700?30:70;
  for(let i=0;i<N;i++)P.push({x:Math.random()*W,y:Math.random()*H,vx:0,vy:0,r:Math.random()*2.2+.6,s:Math.random()*.35+.08,b:i<9,rot:Math.random()*6,z:Math.random()*.7+.3,col:Math.random()<.5?'255,157,184':'185,162,255'});
  c.parentElement.addEventListener('pointermove',e=>{const q=c.getBoundingClientRect();px=e.clientX-q.left;py=e.clientY-q.top;});
  c.parentElement.addEventListener('pointerleave',()=>{px=py=-999;});
  (function f(){ if(scrollY<innerHeight*1.3){ x.clearRect(0,0,W,H);
    for(const p of P){const dx=p.x-px,dy=p.y-py,d=Math.hypot(dx,dy);
      if(d<140){const k=(140-d)/140*1.6;p.vx+=dx/d*k;p.vy+=dy/d*k;}
      p.vx*=.92;p.vy*=.92;p.x+=p.vx;p.y+=p.vy-p.s;p.rot+=.01;
      if(p.y<-30){p.y=H+30;p.x=Math.random()*W;} if(p.x<-30)p.x=W+30; if(p.x>W+30)p.x=-30;
      if(p.b&&berry.complete){const s=26*p.z;x.save();x.globalAlpha=.55*p.z;x.translate(p.x,p.y);x.rotate(p.rot);x.drawImage(berry,-s/2,-s/2,s,s);x.restore();}
      else{x.beginPath();x.fillStyle=`rgba(${p.col},${.35+p.z*.5})`;x.shadowColor=`rgba(${p.col},1)`;x.shadowBlur=8;x.arc(p.x,p.y,p.r,0,7);x.fill();x.shadowBlur=0;}
    }} requestAnimationFrame(f);})();
})();

/* ===== малиновый дождь в финале ===== */
(function(){
  const c=document.getElementById('rain'),x=c.getContext('2d'); if(reduce) return;
  const im=new Image();im.src='https://cdn.jsdelivr.net/gh/Oza8383/neiromalina-site@main/img/berry-s.webp';
  let W,H,B=[],on=false;
  function size(){W=c.width=c.clientWidth;H=c.height=c.clientHeight;}
  size();addEventListener('resize',size);
  new IntersectionObserver(e=>{on=e[0].isIntersecting;},{threshold:.15}).observe(c.parentElement);
  function spawn(){B.push({x:Math.random()*W,y:-60,v:1.5+Math.random()*2.5,r:Math.random()*6,vr:(Math.random()-.5)*.06,s:22+Math.random()*40,a:.35+Math.random()*.5});}
  (function f(){ if(on){ if(B.length<38&&Math.random()<.18)spawn(); x.clearRect(0,0,W,H);
    B=B.filter(b=>b.y<H+80); for(const b of B){b.y+=b.v;b.v+=.02;b.r+=b.vr;x.save();x.globalAlpha=b.a;x.translate(b.x,b.y);x.rotate(b.r);x.drawImage(im,-b.s/2,-b.s/2,b.s,b.s);x.restore();}}
    requestAnimationFrame(f);})();
})();

/* ===== подпись у курсора ===== */
if (fine) {
  const ring=document.querySelector('.cur-ring'),lbl=ring.querySelector('.lbl');
  document.querySelectorAll('[data-lbl],.btn').forEach(el=>{
    el.addEventListener('mouseenter',()=>{const t=el.dataset.lbl;if(t){lbl.textContent=t;ring.classList.add('has-lbl');}});
    el.addEventListener('mouseleave',()=>ring.classList.remove('has-lbl'));
  });
}

/* ===== заставка ===== */
const loader=document.getElementById('loader'),cnt=document.getElementById('cnt'),bar=document.getElementById('bar');
let shown=0,done=false;const tStart=performance.now();
function hideLoader(cb){ if(done) return; done=true;
  if(!hasG){loader.remove();cb&&cb();return;}
  const tl=gsap.timeline({onComplete:()=>{loader.remove();}});
  tl.to('#cnt,.loader .lb',{y:-60,opacity:0,duration:.6,ease:'expo.in'})
    .to('.loader .lmid',{scale:6,opacity:0,duration:.9,ease:'expo.in'},'<')
    .to(loader,{clipPath:'inset(0 0 100% 0)',duration:1.1,ease:'expo.inOut'},'-=.3')
    .add(()=>cb&&cb(),'-=.7');
}
let heroCb=null;
(function tick(){ const target=Math.min(100,Math.max(loaded/F*100,(performance.now()-tStart)/30));
  shown+=(target-shown)*.12; cnt.textContent=Math.round(shown); bar.style.width=shown+'%';
  if(shown>99.4||performance.now()-tStart>4500){cnt.textContent='100';bar.style.width='100%';setTimeout(()=>hideLoader(heroCb),250);return;}
  requestAnimationFrame(tick);})();

if (!hasG || !window.ScrollTrigger || reduce) {
  document.querySelectorAll('.rv,.hero h1 .ln span,.manifest .w').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; });
  return;
}

/* вход первого экрана, после заставки */
gsap.set('.hero-fade',{y:30,opacity:0});gsap.set('#spin',{scale:.5,opacity:0});gsap.set('.stage .orb,.tag3d',{opacity:0,scale:.4});gsap.set('.giant',{opacity:0});
heroCb=()=>{
  gsap.to('.hero h1 .ln span', {y: 0, duration: 1.4, ease: 'expo.out', stagger: .12});
  gsap.to('.hero-fade', {y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: .1, delay: .35});
  gsap.to('#spin', {scale: 1, opacity: 1, duration: 1.8, ease: 'expo.out'});
  gsap.to('.stage .orb,.tag3d', {opacity: 1, scale: 1, duration: 1.3, ease: 'back.out(1.7)', stagger: .07, delay: .4});
  gsap.to('.giant', {opacity: 1, duration: 2, delay: .3});
};
if(done) heroCb();

/* кинетические заголовки: слова выезжают по одному */
document.querySelectorAll('.h2').forEach(h=>{
  const walk=n=>{[...n.childNodes].forEach(k=>{
    if(k.nodeType===3){const f=document.createDocumentFragment();k.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){f.appendChild(document.createTextNode(w));return;}const o=document.createElement('span');o.className='wd';const i=document.createElement('span');i.textContent=w;o.appendChild(i);f.appendChild(o);});k.replaceWith(f);}
    else if(k.nodeType===1&&k.tagName!=='BR')walk(k);});};
  walk(h);
  gsap.from(h.querySelectorAll('.wd>span'),{yPercent:115,rotate:6,duration:1.2,ease:'expo.out',stagger:.05,scrollTrigger:{trigger:h,start:'top 85%'}});
});

/* песочные часы переворачиваются при прокрутке */
gsap.fromTo('#hglass',{rotate:-20},{rotate:200,ease:'none',scrollTrigger:{trigger:'#hglass',start:'top bottom',end:'bottom top',scrub:1}});

/* карточки болей и страхов слегка разъезжаются веером */
gsap.utils.toArray('.pain').forEach((p,i)=>gsap.from(p,{rotate:(i-1.5)*5,ease:'none',scrollTrigger:{trigger:'.pains',start:'top bottom',end:'top 45%',scrub:1}}));

/* наклон блоков от скорости прокрутки */
const skewEls=gsap.utils.toArray('.mod');let skw=0;
ScrollTrigger.create({onUpdate:s=>{const v=gsap.utils.clamp(-6,6,s.getVelocity()/-400);if(Math.abs(v)>Math.abs(skw)){skw=v;gsap.to(skw_proxy,{v:0,duration:.8,ease:'power3',overwrite:true,onUpdate:()=>skewEls.forEach(e=>e.style.setProperty('--sk',skw_proxy.v+'deg'))});skw_proxy.v=skw;skw=0;}}});

/* манифест: слова загораются по мере прокрутки */
gsap.to('#mf .w', {opacity: 1, stagger: .1, ease: 'none', scrollTrigger: {trigger: '#mf', start: 'top 80%', end: 'bottom 45%', scrub: true}});

/* появление блоков */
ScrollTrigger.batch('.rv', {start: 'top 88%', onEnter: b => gsap.to(b, {opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .09})});

/* параллакс декоративных объектов */
document.querySelectorAll('[data-speed]').forEach(el => {
  gsap.to(el, {yPercent: () => +el.dataset.speed * -300, rotate: () => +el.dataset.speed * 60, ease: 'none', scrollTrigger: {trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true}});
});

/* бегущая строка реагирует на скорость прокрутки */
var skw_proxy={v:0};
const tl = gsap.to('#tick', {xPercent: -50, duration: 30, ease: 'none', repeat: -1});
ScrollTrigger.create({onUpdate: s => { const v = s.getVelocity() / 300; gsap.to(tl, {timeScale: 1 + Math.abs(v), duration: .2, overwrite: true}); gsap.to(tl, {timeScale: 1, duration: 1.2, delay: .2}); }});

/* горизонтальная программа */
ScrollTrigger.matchMedia({
  '(min-width: 861px)': () => {
    const track = document.querySelector('.htrack');
    const dist = () => track.scrollWidth - innerWidth;
    gsap.to(track, {x: () => -dist(), ease: 'none', scrollTrigger: {trigger: '.hpin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true}});
    gsap.utils.toArray('.mod .ic').forEach((ic, i) => gsap.to(ic, {rotate: i % 2 ? 14 : -14, y: -30, ease: 'none', scrollTrigger: {trigger: '.hpin', start: 'top top', end: () => '+=' + dist(), scrub: true}}));
  }
});

/* финальная ягода выезжает и крутится */
gsap.fromTo('#fberry', {y: 120, rotate: -25, scale: .7}, {y: 0, rotate: 8, scale: 1, ease: 'none', scrollTrigger: {trigger: '.final', start: 'top bottom', end: 'center center', scrub: true}});

addEventListener('load', () => ScrollTrigger.refresh());
})();
