import {context, saves, chunks, propose} from './pizza.js';
import {prepareArtwork,mountVectors} from './artwork.js';
const $=s=>document.querySelector(s);
const el=id=>document.getElementById(id);
const image=s=>'assets/'+s;
const scroller=el('scroller'),stage=el('stage');
let deck=propose(), selected=0, depth='entry', textMode=false, appParent='full', sourceId, feedback, timer;
let gesture=null, suppressUntil=0, summaryGesture=false;
const current=()=>deck[selected];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const preview = new URLSearchParams(location.search).get('view');
const referenceEntry = ['feed','summary'].includes(preview);
function size(){const r=el('device').getBoundingClientRect();el('device').style.setProperty('--u',r.width/440+'px');paint();}
function setDepth(d){
  depth=d;
  for(const name of ['entry','splash','layer','full','source','app'])el(name).hidden=!(name===d || name==='layer'&&['feed','summary'].includes(d));
  el('input').hidden=!['feed','summary','full','source'].includes(d);
  el('device').dataset.depth=d; paint();
}
function enter(){
  if(depth!=='entry') return;
  el('splash').querySelector('.splash-gallery').innerHTML=Object.values(saves).map(s=>'<img src="'+image(s.photo)+'" alt="">').join('');
  setDepth('splash');setTimeout(()=>{if(depth==='splash')setDepth('feed')},reduce.matches?0:580);
}
el('spot').onclick=enter;
el('spot').onpointerdown=e=>{const btn=e.currentTarget;btn.setPointerCapture(e.pointerId);const x=e.clientX;btn.onpointermove=m=>{const d=Math.min(0,m.clientX-x);btn.style.translate=d+'px';if(d< -32){btn.onpointermove=null;btn.style.translate='';enter()}};btn.onpointerup=btn.onpointercancel=()=>{btn.onpointermove=null;btn.style.translate=''}};
function header(){
  el('device').classList.toggle('text-mode',textMode);
  el('mode').setAttribute('aria-pressed',String(textMode));
  el('context').innerHTML=textMode?(referenceEntry?'<p>At <b>Crown St</b> at 19:40, your reminders suggest somewhere to eat.</p>':'<p>In <b>Surry Hills</b> at 15:20, you’re looking for somewhere to eat.</p>'):
    '<div><strong>AT</strong><b>'+context.place+'</b><time>'+context.time+'</time></div><div><span>Maps</span><i>⌖</i><strong>FOR</strong><em>Eat</em></div>';
}
el('mode').onclick=()=>{textMode=!textMode;header()};
function note(msg){clearTimeout(feedback);el('notice').textContent=msg;feedback=setTimeout(()=>el('notice').textContent='',3000)}
function detailPills(r){
  const first=r.items[0];return '<div class="pill distance">⌖ '+saves.pin.walk+' min</div><div class="pill"><b>'+saves.pin.title+'</b><small>Open till '+saves.pin.closes+'</small></div><div class="pill quote"><small>'+first.app+'</small><b>'+first.text+'</b></div><button class="pill action" data-app="pin">Open in Maps ↗</button><button class="picture" data-source="'+r.hero+'"><img src="'+image(saves[r.hero].photo)+'" alt=""><span>'+saves[r.hero].title+'</span></button>';
}
function cards(){
  stage.innerHTML=deck.map((r,i)=>'<article class="card" data-i="'+i+'"><div class="surface"><div class="inside"></div><h1>'+r.lead+' <span>'+r.tail+'</span></h1><div class="tags"><b>'+r.items[0].app+'</b><em>Eat</em></div><div class="orbs">'+[r.items[0],saves.post,saves.pin].map((s,k)=>'<img class="orb o'+k+'" src="'+image(k===0&&s.id==='message'?'dining.jpg':s.photo)+'" alt="'+s.title+'">').join('')+'</div><div class="caption"><p>'+r.prompt+' · <b>'+saves.pin.walk+' min</b> away</p><p>'+(r.id==='pick'?'“'+saves.message.text+'”':r.items[0].text)+'</p></div><div class="details">'+detailPills(r)+'</div></div><button class="handle lower" aria-label="Expand card"></button><button class="handle upper" aria-label="Open full Spotlight"></button></article>').join('');
  el('rail').querySelectorAll('.snap').forEach(anchor=>anchor.remove());
  for(const [i,card] of [...stage.children].entries()){
    card.dataset.recipe=deck[i].id;
    for(const kind of ['full','refresh']){
      const button=document.createElement('button');
      button.className='vector-action '+kind;
      button.setAttribute('aria-label',kind==='full'?'Expand Spotlight':'Regenerate suggestions');
      card.append(button);
    }
  }
  deck.forEach((_,i)=>{const a=document.createElement('i');a.className='snap';a.style.top=i*100/deck.length+'%';el('rail').append(a)});
  el('rail').style.height=(deck.length*100)+'%';paint();
  mountVectors();
}
function paint(){
  const h=scroller.clientHeight;
  if(!h)return;
  const pos=scroller.scrollTop/h;
  selected=Math.max(0,Math.min(deck.length-1,Math.round(pos)));
  const u=el('device').clientWidth/440;
  for(const [i,c] of [...stage.children].entries()){
    const d=i-pos, a=Math.abs(d), gap=Math.min(a,1);
    // Perspective projection keeps the card rigid. Fog and distance share one depth coordinate.
    const z=-(gap*350+Math.max(0,a-1)*155)*u;
    const y=(d>=0?1:-1)*(gap*(depth==='summary'?718:529)+Math.max(0,a-1)*200)*u;
    c.style.transform='translate3d(0,'+y+'px,'+z+'px) rotateX('+(reduce.matches?0:(d>=0?-1:1)*gap*26)+'deg)';
    c.style.opacity=String(Math.max(0,1-Math.min(1,a)**2)*Math.exp(-a*1.28));
    c.style.zIndex=String(10-Math.round(a*3));c.inert=i!==selected;
    c.classList.toggle('expanded',depth==='summary'&&i===selected);
  }
}
let frame=0;scroller.onscroll=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;paint()})};
function goCard(i){scroller.scrollTo({top:Math.max(0,Math.min(deck.length-1,i))*scroller.clientHeight,behavior:reduce.matches?'instant':'smooth'})}
function expand(){if(depth==='feed'){scroller.scrollTop=selected*scroller.clientHeight;setDepth('summary')}else if(depth==='summary')full()}
function full(){
  const r=current();el('full').innerHTML='<div class="full-scroll"><div class="hero" style="background-image:linear-gradient(transparent,#090909),url('+image(saves[r.hero].photo)+')"><button data-source="'+r.hero+'">'+r.title+'</button></div><div class="grid"><div>'+r.items.filter(s=>['note','content'].includes(s.kind)).map(tile).join('')+(!r.keys.includes('message')?'':tile(saves.pin))+'</div><div><div class="tile facts"><b>Open now <span>'+saves.pin.closes+'</span></b><b>Margherita <span>$'+saves.pin.price+'</span></b><b>Walk <span>'+saves.pin.walk+' min</span></b></div>'+r.items.filter(s=>s.kind==='image'||s.kind==='map'&&!r.keys.includes('message')).map(tile).join('')+'<aside>'+r.items.length+' saved items</aside></div></div></div><button class="handle lower" aria-label="Return to summary"></button><button class="back">‹ Summary</button>';setDepth('full');
}
function tile(s){const dest=chunks[s.id].route;return '<button class="tile '+s.kind+'" data-'+dest+'="'+s.id+'"><img src="'+image(s.photo)+'" alt=""><label>'+s.app+'</label><b>'+(s.kind==='note'?'“'+s.text+'”':s.title)+'</b><small>'+(s.kind==='note'?'— Jordan':s.text)+'</small></button>'}
function source(id){sourceId=id;const s=saves[id];el('source').innerHTML='<button class="back">‹ Full</button><div class="source-meta"><small>'+s.app+' · Saved '+s.savedAt.slice(0,10)+'</small><h1>'+s.title+'</h1></div><button class="source-shot" data-app="'+id+'"><img src="'+image(s.screen)+'" alt="Saved '+s.app+' screen"></button>';setDepth('source')}
function openApp(id){appParent=depth;const img=el('app').querySelector('img');img.src=image(saves[id].screen);img.alt=saves[id].title+' in '+saves[id].app;setDepth('app')}
function back(){if(depth==='app')setDepth(appParent);else if(depth==='source')setDepth('full');else if(depth==='full')setDepth('summary');else if(depth==='summary')setDepth('feed');else setDepth('entry')}
el('device').onclick=e=>{
  if(performance.now()<suppressUntil)return;
  const b=e.target.closest('button');
  if(b?.matches('.back,#home'))back();
  else if(b?.matches('.vector-action.full'))full();
  else if(b?.matches('.vector-action.refresh')){setDepth('feed');goCard((selected+1)%deck.length)}
  else if(b?.dataset.app)openApp(b.dataset.app);
  else if(b?.dataset.source){if(depth==='summary')full();source(b.dataset.source)}
  else if(b?.matches('.handle'))depth==='full'?back():expand();
  else if(depth==='feed'&&e.target.closest('.surface'))expand();
};
function handle(d){if(d>0)expand();else if(depth==='full'||depth==='summary')back()}
el('device').addEventListener('pointerdown',e=>{
  if(!e.target.closest('.handle'))return;
  const b=e.target.closest('.handle');b.setPointerCapture(e.pointerId);const y=e.clientY;
  b.onpointerup=end=>{if(Math.abs(end.clientY-y)>18){suppressUntil=performance.now()+400;handle(end.clientY-y)}};
});
const span=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
const device=el('device');
device.addEventListener('touchstart',e=>{
  if(!['feed','summary','full'].includes(depth))return;
  if(e.touches.length===2){e.preventDefault();gesture=span(e.touches);summaryGesture=false}
  else summaryGesture=depth==='summary'&&!e.target.closest('.handle')?{y:e.touches[0].clientY}:false;
},{passive:false});
device.addEventListener('touchmove',e=>{
  if(gesture!==null&&e.touches.length===2){e.preventDefault();if(gesture===Infinity)return;const diff=span(e.touches)-gesture;if(Math.abs(diff)>36){handle(diff);gesture=Infinity;suppressUntil=performance.now()+500}}
  else if(summaryGesture&&Math.abs(e.touches[0].clientY-summaryGesture.y)>9){summaryGesture=false;setDepth('feed');suppressUntil=performance.now()+450}
},{passive:false});
device.addEventListener('touchend',e=>{if(!e.touches.length){gesture=null;summaryGesture=false}});
device.addEventListener('touchcancel',()=>{gesture=null;summaryGesture=false});
scroller.addEventListener('wheel',e=>{if(depth==='summary'&&e.deltaY)setDepth('feed')},{passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){back();return}if(e.target.matches('input'))return;if(depth==='feed'&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();goCard(selected+(e.key==='ArrowDown'?1:-1))}if(e.key==='Enter'&&e.target===scroller)expand()});
el('input').onsubmit=e=>{e.preventDefault();const input=el('input').querySelector('input'),q=input.value.trim();if(!q)return;const next=propose(q);if(!next.length){note('메뉴, 길찾기, 사진 중 무엇을 볼까요?');return}deck=next;setDepth('feed');scroller.scrollTop=0;cards();input.value='';input.blur();note(current().title)};
header();cards();new ResizeObserver(size).observe(device);setDepth('entry');
el('device').classList.toggle('reference-entry',referenceEntry);
prepareArtwork().then(()=>{if(referenceEntry)setDepth(preview)}).catch(console.error);
