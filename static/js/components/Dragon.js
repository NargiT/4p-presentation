import { useState, useEffect } from 'react';
import { html } from '../html.js';

const IDLE_SEQ = ['01', '02', '01', '03'];

export default function Dragon({ beaten }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (beaten) return;
    const id = setInterval(() => setIdx(i => (i + 1) % IDLE_SEQ.length), 160);
    return () => clearInterval(id);
  }, [beaten]);

  const src = beaten
    ? 'static/img/sprites/dragon_beaten.png'
    : 'static/img/sprites/dragon_idle_' + IDLE_SEQ[idx] + '.png';

  return html`<img src=${src} alt="daemon" className="dragon-sprite" />`;
}
