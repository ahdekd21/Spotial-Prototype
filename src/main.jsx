import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { ScenarioDeck } from './card/ScenarioDeck';
import { FeedIcon } from './card/FeedSurface';
import { previews } from './card/feedPreview';
import './card/card.css';
import './card/feed.css';

const CardReview = lazy(() => import('./CardReview'));
const query = new URLSearchParams(location.search);
const scenario = previews[query.get('scenario')?.toUpperCase()] || previews.A;
const ease = [.22, 1, .36, 1];

function Entry({ context, onEnter, opening, scale }) {
  const reduced = useReducedMotion();
  const labels = ['store', 'water', 'orange', 'night', 'shore'];
  return <motion.section className="entry-layer" aria-label="Spotial 진입" exit={{ opacity: 0, scale: reduced ? 1 : 1.04 }}>
    <div className="entry-mosaic" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => <div key={i}>{i >= 6 && i < 11 && <img alt="" src={'/feed/entry-' + labels[i - 6] + '.png'}/>}</div>)}
    </div>
    <div className="entry-context"><strong>From</strong><b>{context.app}</b>
      {['location', 'messages', 'heart'].map(name => <i key={name}><FeedIcon name={name}/></i>)}</div>
    <div className="entry-corners" aria-hidden="true"/><FeedIcon className="entry-fog" name="entry-footer"/>
    <motion.button className={'entry-spot' + (opening ? ' entering' : '')} aria-label="Spot을 안쪽으로 당겨 진입"
      drag={opening ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={.42}
      onDragEnd={(_, info) => { if (info.offset.x > 26 * scale) onEnter(); }} onClick={onEnter}>
      <FeedIcon name="spot"/><span>{opening ? 'Spotializing' : 'Spot'}</span>
    </motion.button>
  </motion.section>;
}

function Context({ data, textMode }) {
  return <div className="feed-context"><AnimatePresence initial={false} mode="wait">
    {textMode ? <motion.p key="text" className="context-sentence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      At <b>{data.place}</b> at {data.time}, you’re using {data.app} to {data.intent.toLowerCase()}.
    </motion.p> : <motion.div key="chips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="context-row"><strong>At</strong><div className="chip-pair location-pair"><b>{data.place}</b><time>{data.time}</time></div></div>
      <div className="context-row"><div className="chip-pair app-pair"><span>{data.app}</span><i><FeedIcon name="location"/></i></div>
        <strong>For</strong><b className="intent">{data.intent}</b>{data.app === 'Camera' && <b className="intent">See Ref</b>}</div>
    </motion.div>}
  </AnimatePresence></div>;
}

// Integration point for VibeTalk, SpotlightFull and the screenshot viewer.
// The standalone branch keeps the card mounted underneath the handoff.
export function SpotialExperience({ context = scenario, renderDestination }) {
  const host = useRef(null);
  const reduced = useReducedMotion();
  const [scale, setScale] = useState(0);
  const [phase, setPhase] = useState(query.get('view') === 'feed' ? 'feed' : 'ready');
  const [textMode, setTextMode] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [destination, setDestination] = useState(null);
  const [cards, setCards] = useState(context.cards);
  const [revision, setRevision] = useState(0);
  const [keywords, setKeywords] = useState([]);
  const enter = () => setPhase(value => value === 'ready' ? 'entering' : value);
  useEffect(() => {
    const resize = new ResizeObserver(([entry]) => {
      setScale(Math.min(entry.contentRect.width / 440, entry.contentRect.height / 956));
    });
    resize.observe(host.current);
    return () => resize.disconnect();
  }, []);
  useEffect(() => {
    if (phase !== 'entering') return;
    const timer = setTimeout(() => setPhase('feed'), reduced ? 0 : 680);
    return () => clearTimeout(timer);
  }, [phase, reduced]);
  useEffect(() => {
    if (!destination) return;
    const close = e => { if (e.key === 'Escape') setDestination(null); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [destination]);
  const open = (kind, card) => setDestination({ kind, card });
  function applyMatch(result) {
    const first = cards.find(card => card.id === result.cardId);
    if (result.status !== 'matched' || !first) return;
    setCards([first, ...cards.filter(card => card.id !== first.id)]);
    setKeywords(result.keywords || []);
    setRevision(value => value + 1);
    setExpanded(false);
    setDestination(null);
  }
  const inFeed = phase === 'feed';
  return <main className="experience-host" ref={host}>
    <div className="experience-frame" style={{ width: 440 * scale, height: 956 * scale }}>
      <div className="experience-canvas" style={{ transform: 'scale(' + scale + ')' }}>
        <motion.div className="active-light" aria-hidden="true" initial={false}
          animate={{ x: inFeed ? 15.66 : 32.58, y: inFeed ? 169.26 : 417.74, scaleX: inFeed ? 1 : 2.49, scaleY: inFeed ? 1 : 2.33 }}
          transition={{ duration: reduced ? 0 : .72, ease }}>
          <FeedIcon name={inFeed ? 'edge' : 'entry-edge'}/>
        </motion.div>
        <AnimatePresence initial={false}>{!inFeed && <Entry key="entry" context={context} scale={scale} onEnter={enter} opening={phase === 'entering'}/>}</AnimatePresence>
        {inFeed && <motion.div className={'feed-layer' + (expanded ? ' is-expanded' : '')} initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }}
          transition={{ duration: .4 }} inert={Boolean(destination)}>
          <header className="feed-header"><span><b>spotial</b> suggest</span>
            <button className="context-switch" aria-label="맥락을 문장으로 표시" aria-pressed={textMode} onClick={() => setTextMode(!textMode)}>
              <motion.i animate={{ x: textMode ? 0 : 41 }} transition={{ duration: .22 }}/><FeedIcon name="text-icon"/><span className="chip-symbol"/>
            </button></header>
          <Context data={context} textMode={textMode}/>
          {keywords.length > 0 && <div className="voice-clues">{keywords.join(' · ')}</div>}
          <ScenarioDeck key={revision} cards={cards} scale={scale} onAction={open} onExpanded={setExpanded}/>
          <div className="feed-fog" aria-hidden="true"/><FeedIcon className="footer-light" name="footer"/>
          <footer className="feed-footer">
            <AnimatePresence>{!expanded && <motion.div className="feed-inputs" exit={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0 }}>
              <button onClick={() => open('text')}>Ask Spotial anything...</button>
              <button aria-label="음성으로 입력" onClick={() => open('voice')}><FeedIcon name="dictate"/></button>
            </motion.div>}</AnimatePresence>
            <button className="talk-button" aria-label="바이브토크" onClick={() => open('voice')}><FeedIcon name="talk"/></button>
          </footer>
        </motion.div>}
        {destination && (renderDestination?.({ ...destination, context, candidates: cards, onMatch: applyMatch, onCancel: () => setDestination(null) }) ??
          <div className="handoff" role="dialog" aria-modal="true" aria-label="화면 연결 미리보기"><div>
            <small>연결 미리보기</small><h2>{{ voice: 'Vibe Talk', text: 'Ask Spotial', full: 'Spotlight (Full)', app: destination.card?.cta }[destination.kind]}</h2>
            <p>{destination.card?.title || context.app} · {['voice','text'].includes(destination.kind) ? '음성·질문 모듈' : '상세 화면 모듈'} 연결 예정</p>
            <button autoFocus onClick={() => setDestination(null)}>돌아가기</button>
          </div></div>)}
      </div>
    </div>
  </main>;
}

createRoot(document.getElementById('root')).render(<MotionConfig reducedMotion="user">
  {query.has('review') || query.has('mobile') ? <Suspense><CardReview/></Suspense> : <SpotialExperience/>}
</MotionConfig>);
