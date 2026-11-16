import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

export function SkeletonSlot({ className = '', style, delay = 0 }) {
  return <div className={'skeleton-slot ' + className} style={{ ...style, '--phase': delay + 'ms' }}>
    <span className="skeleton-scan" />
    {Array.from({length: 6}, (_, index) => <i key={index} style={{
      left: (9 + index * 15) + '%', top: (20 + (index * 23) % 60) + '%',
      animationDelay: (index * -90) + 'ms',
    }} />)}
  </div>;
}

export function CardSkeleton({ loading }) {
  return <AnimatePresence>{loading && <motion.div className="card-skeleton" aria-hidden="true"
    initial={{opacity:1}} animate={{opacity:1}} exit={{opacity:0}}
    transition={{duration: 0.22}}>
    <SkeletonSlot style={{left:24, top:39, width:137, height:27}} />
    <SkeletonSlot style={{left:24, top:75, width:337, height:29}} delay={60} />
    {[117,70,64].map((width,index) => <SkeletonSlot key={index}
      className="pill" style={{left:[18,137,209][index],top:118,width,height:36}} delay={index*60} />)}
    {[18,85,155,228].map((left,index) => <SkeletonSlot key={index}
      className="circle" style={{left,top:171,width:140,height:140}} delay={index*90} />)}
    <SkeletonSlot style={{left:24,top:328,width:337,height:43}} delay={160} />
  </motion.div>}</AnimatePresence>;
}
