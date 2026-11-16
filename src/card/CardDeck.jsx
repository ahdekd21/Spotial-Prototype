import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform, useReducedMotion } from 'motion/react';
import { SpotialCard } from './SpotialCard';
import { cards } from './cardData';

const clamp = value => Math.max(0,Math.min(cards.length-1,value));
const spring = {type:'spring',stiffness:250,damping:30,mass:.9};
export function settleIndex(position, velocity) {
  return Math.round(clamp(position+Math.max(-.6,Math.min(.6,velocity*.18))));
}

function DeckItem({ index, position, active, expanded, ...props }) {
  const closed=useMotionValue(0);
  const relative=useTransform(position,value=>index-value);
  const y=useTransform([relative,expanded],([offset,expansion])=>offset>=0
    ? (offset<=1 ? offset*450 : 450+(offset-1)*88) + Math.min(1,offset)*204*expansion
    : offset*470);
  const scaleY=useTransform(relative,offset=>1-Math.min(1,Math.abs(offset))*.80);
  const scaleX=useTransform(relative,offset=>1+Math.min(1,Math.max(0,offset))*.025);
  const opacity=useTransform(relative,offset=>offset<0?Math.max(0,1+offset*1.2):1);
  const dim=useTransform(relative,offset=>Math.min(1,Math.abs(offset)));
  return <motion.div className="deck-item" style={{y,scaleX,scaleY,opacity,zIndex:cards.length-index}}
    aria-hidden={!active} inert={!active}>
    <SpotialCard {...props} active={active} card={cards[index]} progress={active?expanded:closed}/>
    <motion.div className="folded-shade" style={{opacity:dim}} />
  </motion.div>;
}

export function CardDeck({ scale, generation, requestedState, onState, onRegenerate }) {
  const reducedMotion=useReducedMotion();
  const position=useMotionValue(0);
  const expanded=useMotionValue(0);
  const [active,setActive]=useState(0);
  const [moving,setMoving]=useState(false);
  const [loading,setLoading]=useState(true);
  const [isExpanded,setIsExpanded]=useState(false);
  const root=useRef(null);
  const gesture=useRef(null);
  const wheelTimer=useRef(null);
  const wheelState=useRef({time:0,velocity:0});
  const deckAnimation=useRef(null);
  const cardAnimation=useRef(null);
  const settleToken=useRef(0);

  function stopDeck(){deckAnimation.current?.stop();clearTimeout(wheelTimer.current);settleToken.current++;}
  function settleDeck(target) {
    stopDeck();
    const token=settleToken.current;
    const destination=clamp(Math.round(target));
    setMoving(true);
    deckAnimation.current=animate(position,destination,{
      ...spring,duration:reducedMotion?0:undefined,
      onComplete:()=>{
        if(token!==settleToken.current)return;
        setActive(destination);setMoving(false);onState({active:destination,expanded:false,moving:false});
      },
    });
  }
  function settleCard(target) {
    if(loading||moving)return;
    cardAnimation.current?.stop();
    setIsExpanded(Boolean(target));
    cardAnimation.current=animate(expanded,target,reducedMotion?{duration:0}:spring);
    onState({active,expanded:Boolean(target),moving:false});
  }
  function changeCard(value) {
    cardAnimation.current?.stop();
    expanded.set(value);
  }
  useEffect(()=>{
    stopDeck();cardAnimation.current?.stop();expanded.set(0);position.set(0);
    setActive(0);setMoving(false);setIsExpanded(false);setLoading(true);
    onState({active:0,expanded:false,moving:false});
    const timer=setTimeout(()=>setLoading(false),800);
    return ()=>clearTimeout(timer);
  },[generation]);
  useEffect(()=>{
    if(requestedState?.action==='expand')settleCard(1);
    if(requestedState?.action==='collapse')settleCard(0);
    if(requestedState?.action==='next'&&!loading&&expanded.get()<.02)settleDeck(active+1);
    if(requestedState?.action==='previous'&&!loading&&expanded.get()<.02)settleDeck(active-1);
  },[requestedState]);
  useEffect(()=>{
    const node=root.current;
    function wheel(event) {
      event.preventDefault();
      if(loading||expanded.get()>.02||isExpanded)return;
      stopDeck();setMoving(true);
      const now=performance.now();
      const unit=event.deltaMode===1?16:event.deltaMode===2?440:1;
      const delta=Math.max(-.55,Math.min(.55,event.deltaY*unit/420));
      const elapsed=Math.max(16,now-wheelState.current.time);
      wheelState.current={time:now,velocity:delta/(elapsed/1000)};
      position.set(clamp(position.get()+delta));
      wheelTimer.current=setTimeout(()=>settleDeck(settleIndex(position.get(),wheelState.current.velocity)),130);
    }
    node.addEventListener('wheel',wheel,{passive:false});
    return ()=>{node.removeEventListener('wheel',wheel);clearTimeout(wheelTimer.current);};
  },[loading,isExpanded,active,reducedMotion]);
  useEffect(()=>()=>{stopDeck();cardAnimation.current?.stop();},[]);
  function start(event) {
    if(event.target.closest('button')||loading||expanded.get()>.02||gesture.current)return;
    stopDeck();
    gesture.current={id:event.pointerId,startY:event.clientY,previousY:event.clientY,
      origin:position.get(),time:performance.now(),velocity:0};
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function move(event) {
    const current=gesture.current;
    if(!current||current.id!==event.pointerId)return;
    const now=performance.now();
    const movement=(current.startY-event.clientY)/scale;
    if(Math.abs(movement)>5)setMoving(true);
    current.velocity=(current.previousY-event.clientY)/(scale*420*Math.max(.008,(now-current.time)/1000));
    current.previousY=event.clientY;current.time=now;
    position.set(clamp(current.origin+movement/420));
  }
  function finish(event,cancelled=false) {
    const current=gesture.current;
    if(!current||current.id!==event.pointerId)return;
    gesture.current=null;
    const velocity=performance.now()-current.time>100?0:current.velocity;
    settleDeck(cancelled?active:settleIndex(position.get(),velocity));
  }
  return <div ref={root} className="card-deck" onPointerDown={start} onPointerMove={move}
    onPointerUp={event=>finish(event)} onPointerCancel={event=>finish(event,true)}
    onLostPointerCapture={event=>finish(event,true)}
    onKeyDown={event=>{
      if(event.target!==event.currentTarget||loading||isExpanded)return;
      if(event.key==='ArrowDown'){event.preventDefault();settleDeck(active+1);}
      if(event.key==='ArrowUp'){event.preventDefault();settleDeck(active-1);}
    }} tabIndex={0} aria-label="제안 카드 스택. 위아래로 스크롤해 카드를 선택하세요.">
    {cards.map((card,index)=><DeckItem key={card.id} index={index} position={position}
      active={index===active} expanded={expanded} moving={moving} loading={loading}
      scale={scale} onChange={changeCard} onSettle={settleCard}
      onRegenerate={onRegenerate} reducedMotion={reducedMotion}/>)}
    <div className="deck-live" role="status" aria-live="polite">{loading?'카드 생성 중':(active+1)+'번째 카드'+(isExpanded?' 펼침':' 선택됨')}</div>
  </div>;
}
