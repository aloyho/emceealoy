
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const navbar=document.getElementById('navbar');
const menu=document.getElementById('navLinks');
const hamburger=document.getElementById('hamburger');
function updateNav(){navbar.classList.toggle('scrolled',scrollY>60)}
addEventListener('scroll',updateNav,{passive:true});updateNav();
function setMenu(open){
 menu.classList.toggle('open',open);hamburger.classList.toggle('open',open);
 hamburger.setAttribute('aria-expanded',String(open));hamburger.setAttribute('aria-label',open?'Close menu':'Open menu');
 document.body.style.overflow=open?'hidden':'';
}
function toggleMenu(){setMenu(!menu.classList.contains('open'))}
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{
 if(!menu.classList.contains('open'))return;
 if(e.key==='Escape'){setMenu(false);hamburger.focus()}
 if(e.key==='Tab'){
  const items=[...menu.querySelectorAll('a'),hamburger],first=items[0],last=items.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 }
});
matchMedia('(min-width:961px)').addEventListener('change',e=>{if(e.matches)setMenu(false)});
function showYear(year,button,animate=true){
 document.querySelectorAll('.events-list').forEach(panel=>{const active=panel.id==='events-'+year;panel.hidden=!active;panel.classList.toggle('active',active)});
 document.querySelectorAll('.yt').forEach(tab=>{const active=tab===button;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1});
 if(animate&&!reducedMotion.matches){document.querySelectorAll('#events-'+year+' .ev').forEach((row,i)=>{row.getAnimations().forEach(a=>a.cancel());row.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:260,delay:Math.min(i*25,150),fill:'backwards',easing:'ease-out'})})}
}
const tablist=document.querySelector('.year-tabs');
const tabs=[...tablist.querySelectorAll('.yt')].sort((a,b)=>Number(b.textContent)-Number(a.textContent));
tabs.forEach(tab=>tablist.append(tab));
showYear(tabs[0].textContent.trim(),tabs[0],false);
tablist.addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
 const current=tabs.indexOf(document.activeElement);if(current<0)return;e.preventDefault();
 const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(current+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
 tabs[next].focus();showYear(tabs[next].textContent.trim(),tabs[next]);
});
// Bounded entrances retain visible content when scripting is unavailable.
const reveals=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
 if(!isIntersecting)return;
 if(!reducedMotion.matches)target.animate([{opacity:.35,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:450,easing:'ease-out'});
 reveals.unobserve(target);
}),{threshold:.08});
document.querySelectorAll('.fi,.wi,.svc').forEach(el=>reveals.observe(el));
// One continuous belt implementation for photos and client names.
// Recycle existing items instead of duplicating photographs in the page.
document.querySelectorAll('.gallery-rail,.logo-ticker-wrap').forEach(viewport=>{
 const track=viewport.querySelector('.logo-track')||viewport;
 if(track!==viewport){
  const seen=new Set();
  [...track.children].forEach(item=>{const name=item.querySelector('img')?.alt||item.textContent.trim();if(seen.has(name))item.remove();else{seen.add(name);item.removeAttribute('aria-hidden')}});
 }
 let frame=0,previous=0,position=viewport.scrollLeft,resumeAt=0;
 const isVisible=()=>{const r=viewport.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight};
 const ready=()=>!document.hidden&&!reducedMotion.matches;
 const start=()=>{if(!frame&&ready())frame=requestAnimationFrame(tick)};
 function tick(time){
  frame=0;
  if(!ready()){previous=0;return}
  const elapsed=previous?Math.min(time-previous,50):0;previous=time;
  if(isVisible()&&time>=resumeAt){
   position+=elapsed*(track===viewport?.052:.045);
   const first=track.firstElementChild;
   const gap=parseFloat(getComputedStyle(track).columnGap)||0;
   const step=first.getBoundingClientRect().width+gap;
   if(step>0&&position>=step){track.append(first);position-=step}
   viewport.scrollLeft=position;
  }else position=viewport.scrollLeft;
  frame=requestAnimationFrame(tick);
 }
 // Every touch pause expires, even if the browser never sends pointerup.
 function manual(){position=viewport.scrollLeft;resumeAt=performance.now()+1200;start()}
 ['pointerdown','touchstart','touchmove','touchend','touchcancel','wheel'].forEach(type=>viewport.addEventListener(type,manual,{passive:true}));
 ['pointerup','pointercancel','lostpointercapture'].forEach(type=>viewport.addEventListener(type,manual,{passive:true}));
 viewport.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key))manual()});
 addEventListener('pageshow',start);start();
 document.addEventListener('visibilitychange',start);
 reducedMotion.addEventListener('change',start);
});


const heroFrame=document.querySelector('.hero-right');
let frameVisible=false;
function syncHeroMotion(){heroFrame.classList.toggle('motion-visible',frameVisible&&!document.hidden)}
new IntersectionObserver(entries=>{frameVisible=entries[0].isIntersecting;syncHeroMotion()}).observe(heroFrame);
document.addEventListener('visibilitychange',syncHeroMotion);
const statElements=[...document.querySelectorAll('.hero-stats .stat-num')];
const statFinal=statElements.map(el=>el.textContent);
let countFrame=0;
function finishStats(){cancelAnimationFrame(countFrame);statElements.forEach((el,i)=>el.textContent=statFinal[i])}
const statObserver=new IntersectionObserver(entries=>{
 if(!entries[0].isIntersecting)return;statObserver.disconnect();
 if(reducedMotion.matches)return;
 const began=performance.now(),targets=[100,11,1000];
 function count(now){
  const progress=Math.min((now-began)/2000,1),eased=1-Math.pow(1-progress,3);
  statElements.forEach((el,i)=>{el.textContent=progress===1?statFinal[i]:Math.floor(targets[i]*eased)+(i===1?'':'+')});
  if(progress<1)countFrame=requestAnimationFrame(count);
 }
 countFrame=requestAnimationFrame(count);
},{threshold:.5});
statObserver.observe(document.querySelector('.hero-stats'));
reducedMotion.addEventListener('change',e=>{if(e.matches)finishStats()});
