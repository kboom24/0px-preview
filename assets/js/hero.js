/* 0px hero: neural infrastructure that assembles the 0px mark. Draft. */
(function(){
"use strict";
var G={"vb": "-2 16.0 202.0 111.8", "ring": "M0.0,59.0a32.0,41.0 0 1,0 64.0,0a32.0,41.0 0 1,0 -64.0,0ZM14.5,59.0a17.5,26.5 0 1,1 35.0,0a17.5,26.5 0 1,1 -35.0,0Z", "pixel": "M26.0,53.0h12v12h-12Z", "p": "M76.01371071555398 123.75V40.0H92.03146501020952V48.1764082475142H92.23100488836116Q94.07691955566406 45.024577054110445 96.7594372142445 42.93752323497426Q99.44195487282494 40.85046941583807 102.83492521806197 39.799783880060374Q106.227895563299 38.74909834428267 110.09153192693537 38.74909834428267Q117.78926849365234 38.74909834428267 123.59858946366744 42.69818739457564Q129.40791043368253 46.64727644486861 132.6751813021573 53.67863915183328Q135.9424521706321 60.710001858797945 135.9424521706321 69.94273099032316Q135.9424521706321 79.31908347389916 132.71813305941492 86.36476343328303Q129.49381394819778 93.4104433926669 123.67017572576349 97.33067252419212Q117.84653750332919 101.25090165571733 109.97699390758167 101.25090165571733Q106.05608853426847 101.25090165571733 102.7333519675515 100.09999535300514Q99.41061540083452 98.94908905029297 96.79923317649147 96.67636177756569Q94.18785095214844 94.40363450483842 92.42964311079545 91.02362892844461H92.25873773748225V123.75ZM105.83671223033558 87.94756455854936Q110.00450827858666 87.94756455854936 113.06547685102983 85.83458120172673Q116.126445423473 83.72159784490412 117.82648259943181 79.69517100941052Q119.52651977539062 75.6687441739169 119.52651977539062 69.94273099032316Q119.52651977539062 64.18853412974966 117.82648259943181 60.19074179909447Q116.126445423473 56.192949468439274 113.06547685102983 54.079966111616656Q110.00450827858666 51.96698275479404 105.83671223033558 51.96698275479404Q101.52844862504439 51.96698275479404 98.2822574268688 54.19270081953569Q95.03606622869319 56.418418884277344 93.24967471036044 60.44439489191229Q91.4632831920277 64.47037089954723 91.4632831920277 69.94273099032316Q91.4632831920277 75.38690740411931 93.24967471036044 79.44151791659269Q95.03606622869319 83.49612842906605 98.2822574268688 85.7218464938077Q101.52844862504439 87.94756455854936 105.83671223033558 87.94756455854936Z", "x": "M136.4923359264027 100.0 160.77557164972478 65.53864565762606 160.46104292436078 72.95319297096947 137.9709611372514 40.0H155.80599559437144L161.26798664439806 48.611117276278414Q163.56799593838778 52.448824102228336 165.6398308493874 56.00041129372337Q167.71166576038706 59.5519984852184 169.78304984352803 63.16017844460227H164.46626697887072Q166.6231037486683 59.5519984852184 168.70903049815783 56.00041129372337Q170.79495724764735 52.448824102228336 173.1522355513139 48.611117276278414L178.7278629649769 40.0H196.30653936212713L173.30148731578478 72.95319297096947L173.58783236416903 65.51046198064631L197.27199762517756 100.0H179.379243330522L173.15539134632456 90.48700506036931Q170.88356572931463 86.76293459805575 168.82559724287552 83.33907560868697Q166.7676287564364 79.91521661931819 164.69579384543678 76.42067302357067H169.32489776611328Q167.19579384543678 79.91521661931819 165.12395893443716 83.33907560868697Q163.0521240234375 86.76293459805575 160.69439489191228 90.48700506036931L154.32827203924003 100.0Z"};
var hero=document.querySelector('[data-hero]');
if(!hero) return;
var cv=hero.querySelector('canvas');
var ctx=cv.getContext('2d',{alpha:false});
if(!ctx) return;
document.documentElement.classList.add('has-canvas');
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var vb=G.vb.split(' ').map(Number); // x y w h
var paths={ring:new Path2D(G.ring),pixel:new Path2D(G.pixel),p:new Path2D(G.p),x:new Path2D(G.x)};
var W=0,H=0,DPR=1,dots=[],nodes=[],pulses=[],mark={x:0,y:0,s:1,w:0,h:0},t0=performance.now(),last=t0,running=false,visible=true;
var mouse={x:-9999,y:-9999,tx:-9999,ty:-9999,on:false};
var scrollP=0;
var C=[[54,226,255],[111,107,255],[199,125,255]];
function mix(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
function grad(t){t=Math.max(0,Math.min(1,t));return t<.52?mix(C[0],C[1],t/.52):mix(C[1],C[2],(t-.52)/.48);}
function rnd(a,b){return a+Math.random()*(b-a);}
// seeded random for stable layouts
var seed=7;function sr(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
function layout(){
  var r=hero.getBoundingClientRect();
  W=Math.round(r.width);H=Math.round(r.height);
  DPR=Math.min(window.devicePixelRatio||1,2);
  cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
  var inner=hero.querySelector('.hero-inner');
  var top=inner?inner.getBoundingClientRect().top-r.top:H*.5;
  var avail=Math.max(top,160);
  var mw=Math.min(W*(W<640?0.72:0.46),660,(avail*0.8)*vb[2]/vb[3]);
  mark.s=mw/vb[2];mark.w=mw;mark.h=vb[3]*mark.s;
  mark.x=(W-mw)/2-vb[0]*mark.s;
  mark.y=avail*0.52-mark.h/2-vb[1]*mark.s+ (W<640?8:18);
  sample();
  makeNodes();
}
function sample(){
  var step=Math.max(4.2,Math.min(7.5,mark.w/88));
  var ow=Math.ceil(vb[2]*mark.s)+4,oh=Math.ceil(vb[3]*mark.s)+4;
  var oc=document.createElement('canvas');oc.width=ow;oc.height=oh;
  var o=oc.getContext('2d');
  o.setTransform(mark.s,0,0,mark.s,-vb[0]*mark.s+2,-vb[1]*mark.s+2);
  o.fillStyle='#fff';o.fill(paths.ring,'evenodd');o.fill(paths.p);o.fill(paths.x);
  o.fillStyle='#f00';o.fill(paths.pixel);
  var data=o.getImageData(0,0,ow,oh).data;
  var old=dots;dots=[];seed=11;
  var ox=mark.x+vb[0]*mark.s-2,oy=mark.y+vb[1]*mark.s-2;
  for(var y=step/2;y<oh;y+=step){for(var x=step/2;x<ow;x+=step){
    var i=((y|0)*ow+(x|0))*4;
    if(data[i+3]>140){
      var isPix=data[i]>200&&data[i+1]<60;
      var tx=ox+x,ty=oy+y;
      var a=sr()*Math.PI*2,rad=Math.max(W,H)*(0.35+sr()*0.6);
      dots.push({tx:tx,ty:ty,x:W/2+Math.cos(a)*rad,y:H*.4+Math.sin(a)*rad*.6,sx:0,sy:0,vx:0,vy:0,
        d:sr()*900+((tx-mark.x)/mark.w)*500,pix:isPix,r:isPix?step*.46:step*.2,u:(tx-ox)/ow,ph:sr()*6.28});
    }
  }}
  dots.forEach(function(d){d.sx=d.x;d.sy=d.y;});
  if(old.length&&!reduce){ /* keep formed state on resize */ dots.forEach(function(d){d.x=d.tx;d.y=d.ty;d.d=-1e4;}); }
  dots.step=step;
}
function makeNodes(){
  nodes=[];seed=23;
  var n=W<640?34:70;
  for(var i=0;i<n;i++){
    var x=sr()*W,y=sr()*H*0.95;
    // keep a calm zone around the mark and the copy
    nodes.push({x:x,y:y,bx:x,by:y,z:0.35+sr()*0.65,ph:sr()*6.28,sp:0.2+sr()*0.5});
  }
}
function ease(t){return t>=1?1:1-Math.pow(2,-10*t);}
function spawnPulse(now){
  if(!dots.length||!nodes.length) return;
  var n=nodes[(Math.random()*nodes.length)|0];
  var d=dots[(Math.random()*dots.length)|0];
  pulses.push({n:n,d:d,t:now,dur:rnd(900,1700),c:grad(d.u)});
}
var nextPulse=0;
function frame(now){
  if(!running) return;
  var dt=Math.min(50,now-last);last=now;
  draw(now,dt);
  requestAnimationFrame(frame);
}
function draw(now,dt){
  var t=now-t0;
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  // ambient luminous field
  var cx=mark.x+(vb[0]+vb[2]/2)*mark.s,cy=mark.y+(vb[1]+vb[3]/2)*mark.s;
  var form=reduce?1:Math.min(1,Math.max(0,(t-400)/2600));
  var g=ctx.createRadialGradient(cx,cy,0,cx,cy,mark.w*0.95);
  g.addColorStop(0,'rgba(111,107,255,'+(0.20*form*(1-scrollP))+')');
  g.addColorStop(0.5,'rgba(54,226,255,'+(0.05*form*(1-scrollP))+')');
  g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // mouse spotlight
  mouse.x+=(mouse.tx-mouse.x)*0.12;mouse.y+=(mouse.ty-mouse.y)*0.12;
  if(mouse.on){
    var mg=ctx.createRadialGradient(mouse.x,mouse.y,0,mouse.x,mouse.y,260);
    mg.addColorStop(0,'rgba(140,130,255,.10)');mg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=mg;ctx.fillRect(mouse.x-260,mouse.y-260,520,520);
  }
  // network nodes + links
  var i,j,n,m;
  for(i=0;i<nodes.length;i++){n=nodes[i];
    var k=reduce?0:t*0.0003*n.sp;
    n.x=n.bx+Math.sin(k+n.ph)*18*n.z+(mouse.on?(mouse.x-W/2)*-0.02*n.z:0);
    n.y=n.by+Math.cos(k*1.3+n.ph)*14*n.z-scrollP*120*n.z;
  }
  ctx.lineWidth=1;
  var maxD=W<640?120:170;
  for(i=0;i<nodes.length;i++){n=nodes[i];
    for(j=i+1;j<nodes.length;j++){m=nodes[j];
      var dx=n.x-m.x,dy=n.y-m.y,dd=dx*dx+dy*dy;
      if(dd<maxD*maxD){var a=(1-Math.sqrt(dd)/maxD)*0.16*Math.min(n.z,m.z)*(0.4+0.6*form);
        ctx.strokeStyle='rgba(170,170,200,'+a+')';ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(m.x,m.y);ctx.stroke();}
    }
  }
  for(i=0;i<nodes.length;i++){n=nodes[i];
    ctx.fillStyle='rgba(220,220,240,'+(0.22+0.4*n.z)*(0.5+0.5*form)+')';
    ctx.beginPath();ctx.arc(n.x,n.y,0.8+n.z*1.3,0,6.283);ctx.fill();
  }
  // pulses: data travelling from the network into the mark
  if(!reduce&&form>0.9&&t>nextPulse){spawnPulse(t);nextPulse=t+rnd(90,260);}
  for(i=pulses.length-1;i>=0;i--){var p=pulses[i];var q=(t-p.t)/p.dur;
    if(q>=1){p.d.flash=1;pulses.splice(i,1);continue;}
    var e=q*q*(3-2*q);
    var px=p.n.x+(p.d.x-p.n.x)*e,py=p.n.y+(p.d.y-p.n.y)*e;
    var tail=Math.max(0,e-0.18),qx=p.n.x+(p.d.x-p.n.x)*tail,qy=p.n.y+(p.d.y-p.n.y)*tail;
    var lg=ctx.createLinearGradient(qx,qy,px,py);
    lg.addColorStop(0,'rgba('+p.c.map(Math.round)+',0)');lg.addColorStop(1,'rgba('+p.c.map(Math.round)+',.85)');
    ctx.strokeStyle=lg;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(qx,qy);ctx.lineTo(px,py);ctx.stroke();
    ctx.fillStyle='rgba('+p.c.map(Math.round)+',1)';ctx.beginPath();ctx.arc(px,py,1.8,0,6.283);ctx.fill();
  }
  // shimmer sweep across the mark
  var sweep=reduce?-1:((t-2600)%5200)/5200;
  var sw=-0.3+sweep*1.6;
  // dots
  var R=W<640?60:96;
  var spread=scrollP*scrollP;
  for(i=0;i<dots.length;i++){var d=dots[i];
    var q2=reduce?1:ease(Math.max(0,(t-d.d-200))/1900);
    var bx=d.sx+(d.tx-d.sx)*q2,by=d.sy+(d.ty-d.sy)*q2;
    // breathe
    if(!reduce&&q2>=1){bx+=Math.sin(t*0.0011+d.ph)*0.35;by+=Math.cos(t*0.0013+d.ph)*0.35;}
    // scroll disperse
    if(spread>0){bx+=(d.tx-cx)*spread*1.6+Math.sin(d.ph)*spread*90;by+=(d.ty-cy)*spread*1.6+Math.cos(d.ph)*spread*90-scrollP*60;}
    // mouse repel (spring)
    if(mouse.on&&!reduce){var mx=bx-mouse.x,my=by-mouse.y,md=mx*mx+my*my;
      if(md<R*R){var f=(1-Math.sqrt(md)/R);f=f*f*16;var l=Math.sqrt(md)||1;d.vx+=mx/l*f*0.12;d.vy+=my/l*f*0.12;}}
    d.vx*=0.86;d.vy*=0.86;var ox2=(d.ox||0)+d.vx,oy2=(d.oy||0)+d.vy;ox2*=0.9;oy2*=0.9;d.ox=ox2;d.oy=oy2;
    var x=bx+ox2,y=by+oy2;
    d.x=x;d.y=y;
    var alpha=(0.25+0.75*q2)*(1-scrollP*0.9);
    var u=d.u, hl=Math.max(0,1-Math.abs((u+(d.ty-mark.y)/mark.h*0.25)-sw)/0.12);
    if(d.flash){hl=Math.max(hl,d.flash);d.flash*=0.9;if(d.flash<0.02)d.flash=0;}
    var col;
    if(d.pix){col=grad(((t*0.00015)+u*3)%1);ctx.fillStyle='rgba('+col.map(Math.round)+','+alpha+')';
      var s=d.r*2;ctx.fillRect(x-s/2,y-s/2,s,s);continue;}
    if(hl>0){col=grad(u);var c2=mix([245,245,250],col,hl);ctx.fillStyle='rgba('+c2.map(Math.round)+','+alpha+')';}
    else ctx.fillStyle='rgba(240,240,246,'+(alpha*0.88)+')';
    var rr=d.r*(1+hl*0.6);
    ctx.beginPath();ctx.arc(x,y,rr,0,6.283);ctx.fill();
  }
}
function start(){if(running||reduce)return;running=true;last=performance.now();requestAnimationFrame(frame);}
function stop(){running=false;}
layout();
if(reduce){draw(1e6,16);}else start();
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){layout();if(reduce)draw(1e6,16);},120);});
hero.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;var r=hero.getBoundingClientRect();mouse.tx=e.clientX-r.left;mouse.ty=e.clientY-r.top;if(!mouse.on){mouse.x=mouse.tx;mouse.y=mouse.ty;}mouse.on=true;});
hero.addEventListener('pointerleave',function(){mouse.on=false;});
window.addEventListener('scroll',function(){var r=hero.getBoundingClientRect();scrollP=Math.max(0,Math.min(1,-r.top/(r.height*0.9)));
  var inner=hero.querySelector('.hero-inner');if(inner&&!reduce){inner.style.transform='translateY('+(scrollP*-60)+'px)';inner.style.opacity=String(1-scrollP*1.2);}
},{passive:true});
if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){visible=e.isIntersecting;if(visible)start();else stop();});}).observe(hero);}
document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else if(visible)start();});
window.__heroSeek=function(ms){t0=performance.now()-ms;};
})();
