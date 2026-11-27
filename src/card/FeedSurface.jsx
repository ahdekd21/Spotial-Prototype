import React, { useLayoutEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';

export function FeedIcon({ name, ...props }) {
  return <img alt="" draggable="false" src={'/feed/' + name + '.svg'} {...props}/>;
}

function PreviewStack({ card, progress }) {
  const y = useTransform(progress, [0, 1], [170, 120]);
  const width = useTransform(progress, [0, 1], [213.46, 140]);
  const x = useTransform(progress, [0, 1], [151, 228]);
  const extra = useTransform(progress, [0, .55, 1], [0, .5, 1]);
  const compact = useTransform(progress, [0, 1], [1, 0]);
  return <motion.div className="preview-stack" style={{ y }}>
    <span className="preview-tile first">{card.labels[0]}</span>
    <span className="preview-tile second">{card.labels[1]}</span>
    <motion.span className="preview-tile third" style={{ opacity: extra }}>{card.labels[2]}</motion.span>
    <motion.span className="preview-tile map-tile" style={{ width, x }}>
      <motion.span style={{ opacity: compact }}>{card.map}</motion.span>
      <motion.span style={{ opacity: extra }}>{card.labels[3]}</motion.span>
    </motion.span>
    <motion.span className="preview-plus" style={{ opacity: extra }}><FeedIcon name="plus"/><b>+</b></motion.span>
  </motion.div>;
}

function SummaryDetails({ card, onAction, enabled }) {
  return <div className="summary-grid" inert={!enabled} aria-hidden={!enabled}>
    <div className="metric-tile glass-tile"><FeedIcon name="route" className="route-line"/>
      <FeedIcon name="walk"/><b>{card.distance}</b></div>
    <div className="place-tile glass-tile"><strong>{card.place}</strong><small>{card.address}</small>
      <span>{card.metric} <b>{card.value}</b></span></div>
    <div className="note-tile glass-tile"><small>{card.noteLabel}</small><strong>{card.note}</strong></div>
    <button className="cta-tile glass-tile" onClick={() => onAction('app', card)}>{card.cta} ↗</button>
    <button className="media-tile" aria-label={'저장 자료 보기 · ' + card.media} onClick={() => onAction('full', card)}>
      <FeedIcon name="photo-shape" className="media-shell"/><span>{card.media}</span>
      <i><FeedIcon name="social"/></i><FeedIcon name="dots" className="media-dots"/>
    </button>
  </div>;
}

function FoldingTitle({ card, progress, compact, detail }) {
  const firstLine = useRef(null);
  const lineWidth = useMotionValue(0);
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => lineWidth.set(entry.contentRect.width));
    observer.observe(firstLine.current);
    return () => observer.disconnect();
  }, [lineWidth]);
  const x = useTransform([progress, lineWidth], ([fraction, width]) => fraction * (width + 6));
  const y = useTransform(progress, [0, 1], [32, 0]);
  const scale = useTransform(progress, [0, 1], [1, .94]);
  const sameTitle = card.lines.join(' ') === card.title;
  return <>
    <motion.h2 style={{ scale, transformOrigin: '0 0', opacity: sameTitle ? 1 : compact }}>
      <span ref={firstLine} className="title-line">{card.lines[0]}</span>
      <motion.span className="title-line" style={{ x, y }}>{card.lines[1]}</motion.span>
    </motion.h2>
    {!sameTitle && <motion.h2 className="expanded-title" style={{ opacity: detail }}>{card.title}</motion.h2>}
  </>;
}

export function FeedSurface({ card, progress, expanded, onAction, onRefresh, onCollapse }) {
  const height = useTransform(progress, [0, 1], [406, 610]);
  const titleY = useTransform(progress, [0, 1], [31, 35]);
  const titleX = useTransform(progress, [0, 1], [24, 22]);
  const compact = useTransform(progress, [0, .37], [1, 0]);
  const detail = useTransform(progress, [.36, 1], [0, 1]);
  const chipY = useTransform(progress, [0, 1], [118.46, 78]);
  const chipScale = useTransform(progress, [0, 1], [1, .72]);
  const mapWidth = useTransform(progress, [0, 1], [0, 67]);
  const detailY = useTransform(progress, [0, 1], [350, 260]);
  const imageY = useTransform(progress, [0, 1], [-33, 12]);
  const imageHeight = useTransform(progress, [0, 1], [520, 680]);
  const type = card.palette;
  const background = type === 'harbour' ? 'harbour-summary' : type + '-feed';
  return <motion.article className={'feed-surface palette-' + type} aria-label={card.title} style={{ height }}>
    <motion.div className="surface-color" style={{ y: imageY, height: imageHeight }}>
      <FeedIcon name={background}/><motion.img src={'/feed/' + type + '-summary.svg'} alt="" style={{ opacity: progress }}/>
    </motion.div>
    <motion.div className="surface-title" style={{ x: titleX, y: titleY }}>
      <FoldingTitle card={card} progress={progress} compact={compact} detail={detail}/>
    </motion.div>
    <motion.div className="surface-tags" style={{ y: chipY, scale: chipScale }}>
      <span>{card.source}</span><motion.i className="map-tag" style={{ width: mapWidth, opacity: progress }}><span>Map</span></motion.i><b>{card.intent}</b>
    </motion.div>
    <PreviewStack card={card} progress={progress}/>
    <motion.div className="surface-caption" style={{ opacity: compact }}>
      <p>{card.lead} <b><FeedIcon name="train"/>{card.distance}</b> {card.fact}</p>
      <p><strong>{card.keyword}</strong> {card.caption}</p>
    </motion.div>
    <motion.div className="surface-detail" style={{ y: detailY, opacity: detail }}>
      <SummaryDetails card={card} onAction={onAction} enabled={expanded}/>
      <div className="summary-tools" inert={!expanded}><button aria-label="피드로 접기" onClick={onCollapse}><FeedIcon name="collapse"/></button>
        <button aria-label="피드 다시 보기" onClick={onRefresh}><FeedIcon name="refresh"/></button></div>
    </motion.div>
  </motion.article>;
}
