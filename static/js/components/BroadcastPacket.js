import { useState, useEffect, useRef } from 'react';
import { html } from '../html.js';
import { INSTRUCTIONS } from '../constants.js';

const TRAVEL_MS = 460; // must arrive before BROADCAST_MS ends (600ms)

export default function BroadcastPacket({ instruction, broadcasting, reverse }) {
  const [packet, setPacket] = useState(null);
  const wasLive = useRef(false);

  useEffect(() => {
    if (!broadcasting) {
      wasLive.current = false;
      return;
    }
    // Only trigger on the rising edge of broadcasting
    if (wasLive.current) return;
    wasLive.current = true;

    if (!instruction || !INSTRUCTIONS[instruction]) return;

    const ball   = document.querySelector('[data-ant-ball]');
    const screen = document.querySelector('[data-screen-face]');
    if (!ball || !screen) return;

    const br = ball.getBoundingClientRect();
    const sr = screen.getBoundingClientRect();

    const antX = br.left + br.width  / 2;
    const antY = br.top  + br.height / 2;
    const scrX = sr.left + 24;
    const scrY = sr.top  + sr.height / 2;

    // reverse: packet flies from screen back to antenna
    const sx = reverse ? scrX : antX;
    const sy = reverse ? scrY : antY;
    const ex = reverse ? antX : scrX;
    const ey = reverse ? antY : scrY;

    const instr = INSTRUCTIONS[instruction];
    setPacket({ sx, sy, tx: ex - sx, ty: ey - sy, instr, flying: false });

    // Kick off travel on the next paint so the initial position renders first
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setPacket(p => p ? { ...p, flying: true } : null);
    }));

    // Clean up after animation
    setTimeout(() => setPacket(null), TRAVEL_MS + 80);
  }, [broadcasting, instruction, reverse]);

  if (!packet) return null;

  const wrapStyle = {
    position:      'fixed',
    left:          `${packet.sx}px`,
    top:           `${packet.sy}px`,
    transform:     packet.flying
      ? `translate(calc(-50% + ${packet.tx}px), calc(-50% + ${packet.ty}px)) scale(0.3)`
      : 'translate(-50%, -50%) scale(1)',
    opacity:       packet.flying ? 0 : 1,
    transition:    packet.flying
      ? `transform ${TRAVEL_MS}ms ease-in, opacity 120ms ${TRAVEL_MS - 60}ms ease-out`
      : 'none',
    pointerEvents: 'none',
    zIndex:        9999,
  };

  const badgeStyle = {
    width:          '52px',
    height:         '52px',
    background:     packet.instr.color,
    borderRadius:   '10px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    boxShadow:      `0 0 22px ${packet.instr.color}bb, 0 4px 12px rgba(0,0,0,0.45)`,
  };

  return html`
    <div style=${wrapStyle}>
      <div style=${badgeStyle}>
        <img
          src=${packet.instr.img}
          alt=${instruction}
          style=${{ width: '65%', height: '65%', objectFit: 'contain' }}
        />
      </div>
    </div>
  `;
}
