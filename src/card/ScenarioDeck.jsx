import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { CardHandles } from './CardHandles';
import { FeedSurface } from './FeedSurface';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const spring = { type: 'spring', stiffness: 280, damping: 33, mass: .95 };

function DeckLayer({ index, count, position, expansion, selected, busy, expanded, card, onAction, toggle, collapse, refresh }) {
  const folded = useMotionValue(0);
  const progress = selected ? expansion : folded;
  const offset = useTransform(position, value => index - value);
  const y = useTransform([offset, expansion], ([n, p]) =>
    n < 0 ? n * 470 : Math.min(1, n) * (436 + 197 * p) + Math.max(0, n - 1) * 90);
  const scaleY = useTransform(offset, n => 1 - .81 * Math.min(1, Math.max(0, n)));
  const scaleX = useTransform(offset, n => 1 - .018 * Math.min(1, Math.max(0, n)));
  const opacity = useTransform(offset, n => clamp(1 + n, 0, 1));
  const shade = useTransform(offset, n => clamp(n * 1.3, 0, 1));
  const contentOpacity = useTransform(offset, [.65, 1], [1, 0]);
  const foldedRadius = useTransform(scaleY, value => '36px / ' + 30 / value + 'px');
  const reduced = useReducedMotion();
  return <motion.div className="deck-item scenario-layer" style={{ y, scaleY, scaleX, opacity, zIndex: count - index }}
    inert={!selected} aria-hidden={!selected}>
    <motion.div style={{ opacity: contentOpacity }}><FeedSurface card={card} progress={progress} expanded={selected && expanded}
      onAction={onAction} onCollapse={collapse} onRefresh={refresh}/></motion.div>
    <motion.div className="folded-shade" style={{ opacity: shade, borderRadius: foldedRadius }}/>
    {selected && <CardHandles progress={progress} visible={!busy} reducedMotion={reduced} deckInput={toggle}/>}
  </motion.div>;
}

export function ScenarioDeck({ cards, scale, onAction, onExpanded }) {
  const position = useMotionValue(0);
  const expansion = useMotionValue(0);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const node = useRef(null);
  const pointers = useRef(new Map());
  const drag = useRef(null);
  const blockClick = useRef(false);
  const wheelTimer = useRef();
  const animations = useRef({});
  const lastIndex = cards.length - 1;
  const motionOptions = reduced ? { duration: 0 } : spring;

  function report(open) {
    setExpanded(open);
    onExpanded(open);
  }
  function stop() {
    clearTimeout(wheelTimer.current);
    animations.current.deck?.stop();
    animations.current.card?.stop();
  }
  function snap(target) {
    stop();
    const next = clamp(Math.round(target), 0, lastIndex);
    report(false);
    setBusy(true);
    animations.current.card = animate(expansion, 0, motionOptions);
    animations.current.deck = animate(position, next, { ...motionOptions, onComplete() {
      setIndex(next);
      setBusy(false);
    } });
  }
  function openCard(open) {
    stop();
    setBusy(false);
    report(open);
    animations.current.deck = animate(position, index, motionOptions);
    animations.current.card = animate(expansion, Number(open), motionOptions);
  }
  function expandFurther() {
    if (expanded) onAction('full', cards[index]);
    else openCard(true);
  }
  const span = () => {
    const [a, b] = pointers.current.values();
    return Math.hypot(a.x - b.x, a.y - b.y) / scale;
  };
  function start(e) {
    if (e.button !== 0) return;
    if (pointers.current.size >= 2) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const button = e.target.closest('button');
    (button || node.current).setPointerCapture(e.pointerId);
    blockClick.current = pointers.current.size === 2;
    stop();
    if (pointers.current.size === 2) {
      drag.current = { kind: 'pinch', distance: span(), initial: expansion.get(), wasOpen: expanded, amount: 0 };
      return;
    }
    // Ignore the remaining finger after a pinch until it is lifted.
    if (drag.current?.kind === 'drain') return;
    drag.current = { kind: e.target.closest('[data-handle]') ? 'handle' : 'pending',
      y: e.clientY, start: position.get(), initial: expansion.get(), wasOpen: expanded,
      previous: e.clientY, time: performance.now(), velocity: 0, amount: 0 };
  }
  function move(e) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = drag.current;
    if (!g || g.kind === 'drain') return;
    if (g.kind === 'pinch') {
      g.amount = span() - g.distance;
      expansion.set(clamp(g.initial + g.amount / 105, 0, 1));
      return;
    }
    const dy = (e.clientY - g.y) / scale;
    g.amount = dy;
    if (g.kind === 'handle') {
      expansion.set(clamp(g.initial + dy / 135, 0, 1));
      return;
    }
    if (g.kind === 'pending' && Math.abs(dy) < 5) return;
    g.kind = 'scroll';
    blockClick.current = true;
    setBusy(true);
    const now = performance.now();
    g.velocity = (g.previous - e.clientY) / (scale * 420 * Math.max(.008, (now - g.time) / 1000));
    g.previous = e.clientY;
    g.time = now;
    expansion.set(clamp(g.initial - Math.abs(dy) / 115, 0, 1));
    position.set(clamp(g.start - dy / 420, 0, lastIndex));
  }
  function finish(e, cancelled = false) {
    if (!pointers.current.delete(e.pointerId)) return;
    const g = drag.current;
    drag.current = pointers.current.size ? { kind: 'drain' } : null;
    if (!g || g.kind === 'drain') return;
    if (cancelled || g.kind === 'pending') { openCard(g.wasOpen); return; }
    if (g.kind === 'scroll') {
      const velocity = performance.now() - g.time > 100 ? 0 : g.velocity;
      snap(position.get() + clamp(velocity * .16, -.55, .55));
      return;
    }
    if (g.wasOpen && g.amount > 45) {
      openCard(true);
      onAction('full', cards[index]);
    } else if (g.kind === 'handle' && Math.abs(g.amount) < 5) {
      openCard(true);
      if (g.wasOpen) onAction('full', cards[index]);
    } else openCard(expansion.get() > (g.wasOpen ? .6 : .33));
  }

  useEffect(() => {
    const el = node.current;
    function wheel(e) {
      e.preventDefault();
      if (drag.current) return;
      const delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 420 : 1);
      if (e.ctrlKey) {
        if (delta < 0 && !wheelTimer.current) expandFurther();
        clearTimeout(wheelTimer.current);
        wheelTimer.current = setTimeout(() => { wheelTimer.current = null; }, 180);
        return;
      }
      stop();
      setBusy(true);
      expansion.set(Math.max(0, expansion.get() - Math.abs(delta) / 115));
      position.set(clamp(position.get() + clamp(delta / 420, -.85, .85), 0, lastIndex));
      wheelTimer.current = setTimeout(() => { wheelTimer.current = null; snap(position.get()); }, 110);
    }
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  });
  useEffect(() => () => stop(), []);

  return <div ref={node} className="card-deck scenario-deck" role="region" tabIndex={0} aria-label="Spotial 카드 피드"
    onClickCapture={e => {
      if (!blockClick.current || !e.detail) return;
      e.preventDefault(); e.stopPropagation(); blockClick.current = false;
    }}
    onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={e => finish(e, true)}
    onLostPointerCapture={e => finish(e, true)} onKeyDown={e => {
      if (e.target !== e.currentTarget) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); snap(index + (e.key === 'ArrowDown' ? 1 : -1));
      } else if (e.key === 'Enter') expandFurther();
      else if (e.key === 'Escape') openCard(false);
    }}>
    {cards.map((card, i) => <DeckLayer key={card.id} card={card} index={i} count={cards.length}
      selected={i === index} busy={busy} position={position} expansion={expansion} expanded={expanded}
      onAction={onAction} toggle={expandFurther} collapse={() => openCard(false)} refresh={() => snap(0)}/>)}
    <span className="deck-live" role="status">{cards[index].title} · {expanded ? 'Spotlight Summary' : 'Spotial Feed'}</span>
  </div>;
}
