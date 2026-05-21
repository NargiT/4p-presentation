import { useState, useEffect, useRef } from 'react';
import { html } from '../html.js';
import Robot from './Robot.js';

const ROBOT_H = 162;
const ROBOT_W = 86;

export default function TowerCol({ isRunning, isSad, instruction, broadcasting }) {
  const colRef  = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const col = colRef.current;
    if (!col) return;
    function measure() {
      const s = Math.min(
        (col.clientHeight - 20) / ROBOT_H,
        (col.clientWidth  - 20) / ROBOT_W,
      );
      setScale(Math.max(1, s));
    }
    const ro = new ResizeObserver(measure);
    ro.observe(col);
    measure();
    return () => ro.disconnect();
  }, []);

  const wrapStyle = { transform: `scale(${scale})`, transformOrigin: 'center center' };

  return html`
    <div className="tower-col" ref=${colRef}>
      <div style=${wrapStyle}>
        <${Robot}
          isRunning=${isRunning}
          isSad=${isSad}
          instruction=${instruction}
          broadcasting=${broadcasting}
        />
      </div>
    </div>
  `;
}
