import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CardDeck } from './card/CardDeck';
import './card/card.css';

function App() {
  const [scale, setScale] = useState(.7);
  const [generation, setGeneration] = useState(0);
  const [request, setRequest] = useState(null);
  const [state, setState] = useState({active:0, expanded:false});
  const area = useRef(null);
  const mobile = new URLSearchParams(location.search).has('mobile');
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(entry.contentRect.width / 440, entry.contentRect.height / 956));
    });
    observer.observe(area.current);
    return () => observer.disconnect();
  }, []);
  const regenerate = () => setGeneration(value => value + 1);
  const action = name => setRequest({action:name, time:performance.now()});
  return <main className={mobile ? 'review mobile' : 'review'}>
    {!mobile && <aside className="review-panel">
      <h1>카드 인터랙션</h1>
      <p className="intro">생성부터 펼침, 다음 카드까지.<br/>직접 당기고 스크롤하며 확인하세요.</p>
      <button className="primary-control" onClick={regenerate}>0.8초 생성 다시 보기</button>
      <div className="review-controls">
        <button onClick={() => action('collapse')} aria-pressed={!state.expanded}>제안 카드</button>
        <button onClick={() => action('expand')} aria-pressed={state.expanded}>카드 펼침</button>
      </div>
      <section className="review-instructions">
        <h2>흰색 핸들 당기기</h2><p>바깥으로 당기면 정보가 펼쳐집니다. 펼친 상태에서는 안쪽으로 당겨 접습니다.</p>
        <h2>카드를 위아래로 밀기</h2><p>스크롤 중에는 핸들이 사라집니다. 카드가 중앙에 정착하면 테두리를 따라 다시 나타납니다.</p>
      </section>
      <div className="deck-navigation">
        <button onClick={() => action('previous')} disabled={state.active===0 || state.expanded} aria-label="이전 카드">↑</button>
        <span>{state.active + 1} / 3</span>
        <button onClick={() => action('next')} disabled={state.active===2 || state.expanded} aria-label="다음 카드">↓</button>
      </div>
      <p className="review-note">세 장은 동일한 샘플 카드입니다.<br/>타이틀 · 맥락칩 · 블럭 · 요약설명을 각각 교체할 수 있습니다.</p>
      <a href="?mobile=1" target="_blank" rel="noreferrer">모바일 화면 열기 ↗</a>
    </aside>}
    <section className="preview-area" ref={area} aria-label="Spotial 미리보기">
      <div className="device" style={{width:440*scale, height:956*scale}}>
        <div className="canvas" style={{transform:'scale(' + scale + ')'}}>
          <div className="edge-light" aria-hidden="true"/>
          <header className="phone-header"><span><b>spotial</b> suggest</span><span className="mode-indicator">▰ ▱</span></header>
          <div className="ambient-context"><div><b>AT</b><span>Sydney Harbour</span><time>17:32</time></div><div><span>Instagram</span><b>FOR</b><span className="lime-chip">Visit</span></div></div>
          <CardDeck scale={scale} generation={generation} requestedState={request} onState={setState} onRegenerate={regenerate}/>
          <footer className="phone-footer"><span>Ask Spotial anything...</span><button aria-label="새 카드 생성" onClick={regenerate}><i/></button></footer>
        </div>
      </div>
    </section>
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
