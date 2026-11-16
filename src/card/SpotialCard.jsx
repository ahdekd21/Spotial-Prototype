import React from 'react';
import { motion, useTransform } from 'motion/react';
import { CardAtmosphere } from './CardAtmosphere';
import { CardSkeleton } from './CardSkeleton';
import { CardTitle, ContextChips, ImageBlock, CardSummary, DetailBlocks } from './CardContent';
import { CardHandles } from './CardHandles';

function Reveal({ children, loading, order, reducedMotion }) {
  return <motion.div className="component-reveal" initial={false}
    animate={{opacity:loading?0:1, y:loading?8:0, filter:loading?'blur(6px)':'blur(0px)'}}
    transition={{duration:reducedMotion?0:.34, delay:loading?0:order*.035, ease:[.22,1,.36,1]}}>
    {children}
  </motion.div>;
}

export function SpotialCard({ card, progress, loading, active, moving, scale,
  onChange, onSettle, onRegenerate, reducedMotion }) {
  const height=useTransform(progress,value=>406+204*value);
  return <div className="spotial-card" aria-label={card.title} aria-busy={loading}>
    <motion.article className="card-surface" style={{height}}>
      <CardAtmosphere active={active} />
      <Reveal loading={loading} order={0} reducedMotion={reducedMotion}><CardTitle card={card} progress={progress}/></Reveal>
      <Reveal loading={loading} order={1} reducedMotion={reducedMotion}><ContextChips chips={card.chips} progress={progress}/></Reveal>
      <Reveal loading={loading} order={2} reducedMotion={reducedMotion}><ImageBlock card={card} progress={progress}/></Reveal>
      <Reveal loading={loading} order={3} reducedMotion={reducedMotion}><CardSummary card={card} progress={progress}/></Reveal>
      <DetailBlocks card={card} progress={progress} onRegenerate={onRegenerate} onCollapse={()=>onSettle(0)} />
      <CardSkeleton loading={loading}/>
    </motion.article>
    {active&&<CardHandles progress={progress} visible={!loading&&!moving} scale={scale}
      onChange={onChange} onSettle={onSettle} reducedMotion={reducedMotion}/>}
  </div>;
}
