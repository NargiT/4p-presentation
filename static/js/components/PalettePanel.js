import { html } from '../html.js';
import { INSTRUCTIONS } from '../constants.js';

export default function PalettePanel({ onAdd, isDisabled }) {
  return html`
    <div className="palette-panel">
      <div className="palette-items">
        ${Object.entries(INSTRUCTIONS).map(([id, instr]) => html`
          <button
            key=${id}
            className=${'instr-btn btn-' + id}
            onClick=${() => onAdd(id)}
            disabled=${isDisabled}
          >
            <img src=${instr.img} alt=${instr.label} />
          </button>
        `)}
      </div>
      <img src="static/img/kpop-characters.png" alt="" className="kpop-characters" />
    </div>
  `;
}
