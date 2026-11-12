import React, {useState, useRef, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import Feed from './Feed';
import Expanded from './Expanded';
import './design.css';
import './review.css';

function App(){
 const [progress,setProgress]=useState(0),[scale,setScale]=useState(0.7),[speed,setSpeed]=useState(480),[distance,setDistance]=useState(150),[dragging,setDragging]=useState(false);
 const area=useRef(null),gesture=useRef(null),animation=useRef(null),value=useRef(0);
 const mobile=new URLSearchParams(location.search).has('mobile');
 const update=p=>{value.current=p;setProgress(p)};
 useEffect(()=>{const obs=new ResizeObserver(([entry])=>setScale(Math.min(entry.contentRect.width/440,entry.contentRect.height/956)));obs.observe(area.current);return ()=>{obs.disconnect();cancelAnimationFrame(animation.current)}},[]);
 function settle(target){cancelAnimationFrame(animation.current);const start=value.current,now=performance.now();function tick(time){const t=Math.min(1,(time-now)/speed),ease=1-Math.pow(1-t,3);update(start+(target-start)*ease);if(t<1)animation.current=requestAnimationFrame(tick)}animation.current=requestAnimationFrame(tick)}
 function down(e,side){if(gesture.current)return;cancelAnimationFrame(animation.current);gesture.current={id:e.pointerId,x:e.clientX,y:e.clientY,start:value.current,side};e.currentTarget.setPointerCapture(e.pointerId);setDragging(true)}
 function move(e){const g=gesture.current;if(!g||g.id!==e.pointerId)return;const dx=(e.clientX-g.x)/scale,dy=(e.clientY-g.y)/scale;const projection = {bottom: dx + dy, opposite: -dx - dy, top: dx - dy}; const delta = projection[g.side] / Math.SQRT2;update(Math.max(0,Math.min(1,g.start+delta/distance)))}
 function end(e,cancel=false){const g=gesture.current;if(!g||g.id!==e.pointerId)return;gesture.current=null;setDragging(false);settle(cancel?(g.start>=.5?1:0):(value.current>=.45?1:0))}
 const handle=(side)=>({onPointerDown:e=>down(e,side),onPointerMove:move,onPointerUp:e=>end(e),onPointerCancel:e=>end(e,true),onLostPointerCapture:e=>end(e,true),onKeyDown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();settle(value.current<.5?1:0)}}});
 return <main className={mobile?'review mobile':'review'}>
 {!mobile&&<aside className="review-panel"><span className="eyebrow">SPOTIAL / REVIEW 01</span><h1>정보가 펼쳐지는<br/>첫 번째 움직임.</h1><p>미술관 카드 · Suggest Feed → Summarized Card</p><div className="controls"><button className={progress<.5?'selected':''} onClick={()=>settle(0)}>기본 보기</button><button className={progress>=.5?'selected':''} onClick={()=>settle(1)}>확장 보기</button></div><div className="instructions"><strong>흰색 핸들을 당겨보세요</strong><p>기본 카드의 오른쪽 아래 핸들을 바깥쪽으로 당기면 카드가 펼쳐집니다. 짧게 당겼다 놓으면 돌아옵니다.</p><p>확장된 화면에서는 오른쪽 위 핸들을 안쪽으로 당겨 접을 수 있습니다.</p></div><label>정착 애니메이션 <output>{speed} ms</output><input type="range" min="180" max="900" step="20" value={speed} onChange={e=>setSpeed(+e.target.value)}/></label><label>확장 드래그 거리 <output>{distance} px</output><input type="range" min="80" max="240" step="10" value={distance} onChange={e=>setDistance(+e.target.value)}/></label><div className="readout"><span>{dragging?'드래그 중':progress>.99?'Summarized Card':progress<.01?'Suggest Feed':'전환 중'}</span><span>{Math.round(progress*100)}%</span></div><button className="reset" onClick={()=>{setSpeed(480);setDistance(150);settle(0)}}>다시 시작 ↺</button><a className="mobile-link" href="?mobile=1" target="_blank" rel="noreferrer">모바일 화면만 열기 ↗</a><p className="scope">이번 검토 범위는 카드와 1단계 확장입니다. 발화·다른 카드·원출처 이동은 아직 연결되지 않았습니다. 모션 수치는 검토용 제안입니다.</p></aside>}
 <section className="preview-area" ref={area} aria-label="Spotial 모바일 미리보기"><div className="device" style={{width:440*scale,height:956*scale}}><div className="canvas" style={{transform:`scale(${scale})`,'--progress':progress}}>
 <div className="feed-layer"><Feed/></div><div className="expanded-layer" aria-hidden={progress<.5}><Expanded/></div>
 <button className="drag-handle bottom" aria-label="카드 확장 핸들" aria-expanded={progress>.5} style={{top:570+204*progress,opacity:1-progress,pointerEvents:progress>.98?'none':'auto'}} {...handle('bottom')}/>
 <button className="drag-handle opposite" aria-label="왼쪽 위 카드 확장 핸들" style={{opacity:1-progress,visibility:progress>=1?'hidden':'visible'}} {...handle('opposite')}/>
 <button className="drag-handle upper" aria-label="카드 접기 핸들" aria-expanded={progress>.5} style={{opacity:progress,pointerEvents:progress<.02?'none':'auto'}} {...handle('top')}/>
 <button className="drag-handle lower" aria-label="카드 접기" style={{opacity:progress,pointerEvents:progress<.98?'none':'auto'}} onClick={()=>settle(0)}/>
 </div></div></section>
 </main>
}
createRoot(document.getElementById('root')).render(<App/>);

