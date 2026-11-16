import React from 'react';
import { motion, useTransform } from 'motion/react';
import { artwork } from './cardData';

export function CardTitle({ card, progress }) {
  const y = useTransform(progress,[0,1],[39.07,25.65]);
  const scale = useTransform(progress,[0,1],[1,0.7664]);
  return <motion.h2 className="card-title" style={{y,scale}}>
    {card.titleAsset ? <img src={card.titleAsset} alt={card.title} /> : card.title}
  </motion.h2>;
}

export function ContextChips({ chips, progress }) {
  const y = useTransform(progress,[0,1],[118.46,83.89]);
  const scale = useTransform(progress,[0,1],[1,0.7284]);
  const x = useTransform(progress,[0,1],[18,21]);
  return <motion.div className="card-context-chips" style={{x,y,scale}}>
    {chips.map((chip,index) => <span key={chip} className={index===chips.length-1?'intent-chip':''}>{chip}</span>)}
  </motion.div>;
}

export function ImageBlock({ card, progress }) {
  const y = useTransform(progress,[0,1],[171,120]);
  return <motion.div className="image-block" style={{y}}>
    {card.images.map(({src,alt},index) => <div key={src} className={'image-orb orb-'+index}
      style={{left:[18,85,155,228][index]}}>
      <img src={src} alt={alt} draggable="false" />
    </div>)}
    <div className="image-more-glow" /><img className="image-more" src={artwork.img} alt="" />
  </motion.div>;
}

export function CardSummary({ card, progress }) {
  const opacity = useTransform(progress,[0,.45,1],[1,0,0]);
  const y = useTransform(progress,[0,1],[326,356]);
  return <motion.div className="card-summary" style={{y,opacity}}>
    <p><strong className="count-chip">{card.nearbyCount}</strong> {card.summary}</p>
    <p>Check out your <strong>{card.summaryAction}</strong></p>
  </motion.div>;
}

export function DetailBlocks({ card, progress, onRegenerate, onCollapse }) {
  const opacity = useTransform(progress,[0,.32,1],[0,0,1]);
  const y = useTransform(progress,[0,1],[411,260]);
  const pointerEvents = useTransform(progress,value=>value>.92?'auto':'none');
  return <motion.div className="detail-blocks" style={{y,opacity,pointerEvents}}>
    <section className="note-block">
      <img className="block-shell" src={artwork.imgUnion} alt="" />
      <h3>{card.noteTitle}</h3><p>{card.note}</p>
      <img className="note-dots" src={artwork.imgGroup2147228782} alt="" />
    </section>
    <section className="photo-block">
      <img className="block-shell" src={artwork.img3} alt="" />
      <div className="photo-window"><img src={card.photo.src} alt={card.photo.alt} /></div>
      <h3>{card.photoTitle}</h3>
      <span className="photo-source"><img src={artwork.img2} alt="Instagram" /></span>
      <div className="photo-dots">{Array.from({length:6},(_,index)=><img key={index} src={index?artwork.img13:artwork.img12} alt="" />)}</div>
    </section>
    <section className="map-block">
      <img className="map-line" src={artwork.imgRectangle1954137608} alt="" />
      <img className="map-pin" src={artwork.img1} alt="" /><strong>{card.travelTime}</strong>
      <img className="map-foot" src="/assets/e1f18c3b-e42f-4666-b938-e5b8ca640677.svg" alt="" />
    </section>
    <button className="card-collapse" aria-label="카드 접기" onClick={onCollapse}><img src={artwork.imgVector} alt="" /></button>
    <button className="card-refresh" aria-label="카드 다시 생성" onClick={onRegenerate}><img src={artwork.imgRefresh} alt="" /></button>
  </motion.div>;
}
