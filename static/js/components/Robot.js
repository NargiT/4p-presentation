import { html } from '../html.js';
import { INSTRUCTIONS } from '../constants.js';

export default function Robot({ isRunning, isSad, instruction, broadcasting }) {
  const cls = 'robot'
    + (isRunning    ? ' running'      : '')
    + (isSad        ? ' sad'          : '')
    + (broadcasting ? ' broadcasting' : '');

  let screenContent;
  if (isSad) {
    screenContent = '😢';
  } else if (instruction && INSTRUCTIONS[instruction]) {
    const instr = INSTRUCTIONS[instruction];
    screenContent = html`
      <div className="robot-screen-badge" style=${{ background: instr.color }}>
        <img src=${instr.img} alt=${instruction} className="robot-screen-instr" />
      </div>`;
  } else if (isRunning) {
    screenContent = '⚙️';
  } else {
    screenContent = '❤️';
  }

  return html`
    <div className=${cls}>
      <div className="robot-antenna">
        <div className="robot-antenna-ball" data-ant-ball="1"></div>
        <div className="robot-antenna-stem"></div>
      </div>
      <div className="robot-head">
        <div className="robot-ear robot-ear-left"></div>
        <div className="robot-ear robot-ear-right"></div>
        <div className="robot-eyes">
          <div className="robot-eye"></div>
          <div className="robot-eye"></div>
        </div>
        <div className="robot-mouth"></div>
      </div>
      <div className="robot-neck"></div>
      <div className="robot-body-wrap">
        <div className="robot-arm robot-arm-left"></div>
        <div className="robot-body">
          <div className="robot-screen">${screenContent}</div>
          <div className="robot-buttons">
            <div className="robot-button" style=${{ background: '#ffd600' }}></div>
            <div className="robot-button" style=${{ background: '#43a047' }}></div>
            <div className="robot-button" style=${{ background: '#e53935' }}></div>
          </div>
        </div>
        <div className="robot-arm robot-arm-right"></div>
      </div>
    </div>
  `;
}
