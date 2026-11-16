import React, { Component, useEffect, useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import { useReducedMotion } from 'motion/react';

class ShaderBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export function CardAtmosphere({ active }) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(!document.hidden);
  const [supported] = useState(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(context);
  });
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  return <div className="card-atmosphere" aria-hidden="true">
    {active && supported && <ShaderBoundary>
      <MeshGradient className="mesh-field" width="100%" height="100%"
        colors={['#baff71', '#8cc494', '#5274e0', '#334fff', '#5664e1']}
        distortion={0.42} swirl={0.12} grainMixer={0.025} grainOverlay={0.035}
        speed={visible && !reducedMotion ? 0.12 : 0} maxPixelCount={190000} minPixelRatio={1} />
    </ShaderBoundary>}
    <div className="atmosphere-lime" /><div className="atmosphere-blue" />
  </div>;
}
