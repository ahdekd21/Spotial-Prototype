import React, { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';

// A single closed perimeter keeps the two strokes attached during resizing.
export function CardHandles({ progress, visible, scale, onChange, onSettle, reducedMotion, deckInput }) {
  const arrival = useMotionValue(0);
  const gesture = useRef(null);
  useEffect(() => {
    if (!visible) { arrival.set(0); return; }
    const controls = animate(arrival,1,{duration:reducedMotion?0:0.65,ease:[.22,1,.36,1]});
    return () => controls.stop();
  },[visible,reducedMotion,arrival]);
  const height = useTransform(progress,value=>422+value*204);
  const path = useTransform(height,h=>
    'M 72 8 H 344 A 64 64 0 0 1 408 72 V '+(h-56)+' A 64 64 0 0 1 344 '+(h+8)+' H 72 A 64 64 0 0 1 8 '+(h-56)+' V 72 A 64 64 0 0 1 72 8 Z');
  const circumference = useTransform(height,h=>2*(272+h-128)+2*Math.PI*64);
  const topOffset = useTransform([progress,arrival,circumference],([p,entry,length])=>{
    const topLeft = length - Math.PI*16;
    const topRight = 272 + Math.PI*16;
    return -(topLeft + p*(length+topRight-topLeft) - 39 - (1-entry)*155);
  });
  const bottomOffset = useTransform([topOffset,circumference],([offset,length])=>offset-length/2);
  const dashArray = useTransform(circumference,length=>'78 '+(length-78));
  const topX = useTransform(progress,[0,1],[0,336]);
  const bottomX = useTransform(progress,[0,1],[336,0]);
  const bottomY = useTransform(progress,value=>340+204*value);
  function start(event, corner) {
    if (!visible || gesture.current) return;
    event.stopPropagation();
    const startProgress = progress.get();
    const expanded = startProgress>.5;
    gesture.current = {
      id:event.pointerId, x:event.clientX, y:event.clientY, startProgress,
      // Outward projection for each corner, reversed when contracting.
      horizontal: expanded ? (corner==='top' ? 1 : -1) : (corner==='top' ? -1 : 1),
      vertical: corner==='top' ? -1 : 1,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    onChange(startProgress);
  }
  function move(event) {
    const current=gesture.current;
    if (!current || event.pointerId!==current.id) return;
    const delta=((event.clientX-current.x)*current.horizontal+(event.clientY-current.y)*current.vertical)/(scale*150*Math.SQRT2);
    onChange(Math.max(0,Math.min(1,current.startProgress+delta)));
  }
  function finish(event,cancelled=false) {
    const current=gesture.current;
    if (!current || event.pointerId!==current.id) return;
    gesture.current=null;
    onSettle(cancelled ? Number(current.startProgress>.5) : Number(progress.get()>.45));
  }
  const events=corner=>deckInput ? {
    'data-handle': corner,
    onClick: event => { if (event.detail === 0) deckInput(); },
  } : ({
    onPointerDown:event=>start(event,corner),onPointerMove:move,
    onPointerUp:event=>finish(event),onPointerCancel:event=>finish(event,true),
    onLostPointerCapture:event=>finish(event,true),
    onKeyDown:event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSettle(Number(progress.get()<.5));}},
  });
  return <motion.div className="card-handles" animate={{opacity:visible?1:0}}
    transition={{duration:.16}} style={{pointerEvents:visible?'auto':'none'}}>
    <svg aria-hidden="true" width="416" height="642">
      <motion.path d={path} strokeDasharray={dashArray} strokeDashoffset={topOffset} style={deckInput ? {opacity:progress} : undefined} />
      <motion.path d={path} strokeDasharray={dashArray} strokeDashoffset={bottomOffset} />
    </svg>
    <motion.button className="corner-touch" disabled={!visible} style={{x:topX,y:0}} tabIndex={visible?0:-1}
      aria-label="위쪽 핸들 당겨 카드 펼치기 또는 접기" {...events('top')} />
    <motion.button className="corner-touch" disabled={!visible} style={{x:bottomX,y:bottomY}} tabIndex={visible?0:-1}
      aria-label="아래쪽 핸들 당겨 카드 펼치기 또는 접기" {...events('bottom')} />
  </motion.div>;
}
