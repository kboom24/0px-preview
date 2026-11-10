/* 0px site interactions. Draft. Vanilla JS, no dependencies. */
(function(){
"use strict";
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine=window.matchMedia('(pointer: fine)').matches;
var $=function(s,c){return (c||document).querySelector(s);};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v));};

/* nav */
var toggle=$('.nav-toggle');
if(toggle){toggle.addEventListener('click',function(){var nv=$('.nav');if(nv)document.documentElement.style.setProperty('--sheet-top',Math.max(0,nv.getBoundingClientRect().bottom)+'px');var o=document.body.classList.toggle('nav-open');toggle.setAttribute('aria-expanded',o?'true':'false');toggle.setAttribute('aria-label',o?'Close menu':'Open menu');});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('nav-open')){toggle.click();toggle.focus();}});}

/* reveal */
var rev=$$('[data-reveal]');
if(reduce||!('IntersectionObserver' in window)){rev.forEach(function(el){el.classList.add('in');});}
else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var d=e.target.getAttribute('data-delay');if(d)e.target.style.transitionDelay=d+'ms';e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:0.08});
  rev.forEach(function(el){io.observe(el);});}

/* statement words */
$$('[data-words]').forEach(function(el){
  var html='';el.textContent.trim().split(/\s+/).forEach(function(w){var g=w.indexOf('*')===0;w=w.replace(/\*/g,'');html+='<span class="w'+(g?' g':'')+'">'+w+'</span> ';});
  el.innerHTML=html;el.__w=$$('.w',el);
});

/* counters */
function fmt(v,dec,sep){var s=v.toFixed(dec);if(sep){var p=s.split('.');p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,',');s=p.join('.');}return s;}
var counters=$$('[data-count]');
function runCount(el){var to=parseFloat(el.getAttribute('data-count')),dec=+(el.getAttribute('data-dec')||0),pre=el.getAttribute('data-pre')||'',suf=el.getAttribute('data-suf')||'';
  if(reduce){el.textContent=pre+fmt(to,dec,true)+suf;return;}
  var t0=performance.now(),dur=1600;(function tick(now){var q=clamp((now-t0)/dur,0,1);q=1-Math.pow(1-q,4);el.textContent=pre+fmt(to*q,dec,true)+suf;if(q<1)requestAnimationFrame(tick);})(t0);}
if('IntersectionObserver' in window){var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){runCount(e.target);cio.unobserve(e.target);}});},{threshold:0.4});counters.forEach(function(c){cio.observe(c);});}
else counters.forEach(runCount);

/* pipeline */
var pipe=$('[data-pipe]');
var pnodes=pipe?$$('.pnode',pipe):[],psteps=pipe?$$('.pstep',pipe):[],plog=pipe?$$('.console-log li',pipe):[],pline=pipe?$('.pipe-line',pipe):null,pappr=pipe?$('.approve',pipe):null,pcount=pipe?$('.pipe-count',pipe):null;
var lastStep=-2;
function setStep(s,p){
  if(pline)pline.style.setProperty('--p',p.toFixed(3));
  if(s===lastStep)return;lastStep=s;
  pnodes.forEach(function(n,i){n.classList.toggle('on',i<=s);n.classList.toggle('cur',i===s);});
  psteps.forEach(function(n,i){n.classList.toggle('cur',i===s);n.setAttribute('aria-hidden',i===s?'false':'true');});
  plog.forEach(function(l){l.classList.toggle('on',+l.getAttribute('data-s')<=s);});
  if(pappr)pappr.classList.toggle('on',s>=3);
  if(pcount)pcount.textContent='Step '+(s+1)+' / 5';
}
if(pipe&&reduce){pnodes.forEach(function(n){n.classList.add('on');});psteps.forEach(function(n){n.classList.add('cur');});plog.forEach(function(l){l.classList.add('on');});if(pappr)pappr.classList.add('on');if(pline)pline.style.setProperty('--p','1');}

/* parallax */
var par=reduce?[]:$$('[data-speed]');

/* process index + services subnav active */
function activeLinks(sel,attr){var links=$$(sel);if(!links.length||!('IntersectionObserver' in window))return;
  var map={};links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a;});
  var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.remove('on');a.removeAttribute('aria-current');});var a=map[e.target.id];if(a){a.classList.add('on');a.setAttribute('aria-current','true');}}});},{rootMargin:'-45% 0px -50% 0px'});
  Object.keys(map).forEach(function(id){var t=document.getElementById(id);if(t)o.observe(t);});}
activeLinks('.ph-index a');activeLinks('.subnav a');

/* process tabs */
var ptabs=$('[data-ptabs]'),phases=$('[data-phases]'),pbar=ptabs?$('.ptabs-bar',ptabs):null;
if(ptabs)activeLinks('.ptabs-row a');
/* scroll loop */
var ticking=false;
function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(update);}
function update(){ticking=false;var vh=window.innerHeight;
  $$('[data-words]').forEach(function(el){var r=el.getBoundingClientRect();var p=clamp((vh*0.82-r.top)/(r.height+vh*0.32),0,1);var n=Math.round(p*el.__w.length*1.05);if(reduce)n=el.__w.length;el.__w.forEach(function(w,i){w.classList.toggle('on',i<n);});});
  if(pipe&&!reduce){var r=pipe.getBoundingClientRect();var p=clamp(-r.top/(r.height-vh),0,1);setStep(Math.min(4,Math.floor(p*5.4)),clamp(p*1.22,0,1));}
  if(pbar&&phases){var pr=phases.getBoundingClientRect();pbar.style.setProperty('--p',reduce?'1':clamp((vh*0.5-pr.top)/pr.height,0,1).toFixed(3));}
  par.forEach(function(el){var r=el.getBoundingClientRect();var c=(r.top+r.height/2-vh/2);var s=parseFloat(el.getAttribute('data-speed'));var o=clamp(c*s,-90,90);el.style.transform='translate3d(0,'+o.toFixed(1)+'px,0)';});
}
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);update();

/* magnetic buttons */
if(fine&&!reduce){$$('.magnetic').forEach(function(b){
  b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();var x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;b.style.transform='translate('+(x*0.22).toFixed(1)+'px,'+(y*0.32).toFixed(1)+'px)';});
  b.addEventListener('pointerleave',function(){b.style.transform='';});});}

/* cursor-reactive glow */
if(fine){$$('.glow-card').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');});});}

/* contact form (draft, not connected) */
var form=$('[data-draft-form]');
if(form){form.addEventListener('submit',function(e){e.preventDefault();var s=$('.form-status',form.parentNode);if(s){s.classList.add('show');s.focus();}});}
})();
