import { useState } from 'react';
import { html } from '../html.js';
import { INSTRUCTIONS } from '../constants.js';

{
  const href = '/static/css/ProgramPanel.css';
  if (!document.head.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

export default function ProgramPanel({
  program,
  activeStep,
  errorStep,
  onRemove,
  onPlay,
  onPrev,
  onNext,
  onReset,
  playDisabled,
  prevDisabled,
  nextDisabled,
  resetDisabled,
  isPlaying,
  statusText,
  statusError,
  saves,
  onSave,
  onLoad,
  onDelete,
}) {
  const [saveName, setSaveName] = useState('');
  const [showSaves, setShowSaves] = useState(false);

  function handleSave() {
    onSave(saveName);
    setSaveName('');
  }

  const query = saveName.trim().toLowerCase();
  const visibleSaves = saves
    .filter(s => !query || s.name.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));

  return html`
    <div className="program-panel">
      <div className="program-list">
        ${program.length === 0
          ? html`<div className="empty-hint">Clique sur les instructions<br />pour créer ton programme !</div>`
          : program.map((id, i) => {
              const instr = INSTRUCTIONS[id];
              let cls = 'program-item';
              if (i === activeStep) cls += ' active';
              if (i === errorStep)  cls += ' error';
              return html`
                <div key=${i} className=${cls} style=${{ borderColor: instr.color }} onClick=${() => onRemove(i)}>
                  <span className="prog-icon" style=${{ background: instr.color }}>
                    <img src=${instr.img} alt=${instr.label} />
                  </span>
                  <span className="step-num">${i + 1}</span>
                </div>
              `;
            })
        }
      </div>
      ${statusText ? html`
        <div className=${'status-bar' + (statusError ? ' error' : '')}>
          ${statusText}
        </div>
      ` : null}
      <div className="program-controls">
        <button className="btn btn-step"  onClick=${onPrev}  disabled=${prevDisabled}>⏮</button>
        <button className="btn btn-play"  onClick=${onPlay}  disabled=${playDisabled}>
          ${isPlaying ? '⏸' : '▶'}
        </button>
        <button className="btn btn-step"  onClick=${onNext}  disabled=${nextDisabled}>⏭</button>
        <button className="btn btn-reset" onClick=${onReset} disabled=${resetDisabled}>↺</button>
        <button className="btn-save-toggle" onClick=${() => setShowSaves(s => !s)}>💾</button>
      </div>
      <div className=${'save-section' + (showSaves ? ' open' : '')}>
        <div className="save-input-row">
          <input
            className="save-name-input"
            type="text"
            placeholder="Nom (rechercher ou sauvegarder)…"
            value=${saveName}
            onInput=${e => setSaveName(e.target.value)}
            onKeyDown=${e => { if (e.key === 'Enter') handleSave(); }}
          />
          <button
            className="btn-save"
            onClick=${handleSave}
            disabled=${!saveName.trim() || program.length === 0}
            title="Sauvegarder"
          >💾</button>
        </div>
        ${visibleSaves.length > 0 ? html`
          <div className="saves-list">
            ${visibleSaves.map(s => html`
              <div key=${s.name} className="save-item">
                <span className="save-item-name">${s.name}</span>
                <button className="btn-load"   onClick=${() => onLoad(s)}      title="Charger">📂</button>
                <button className="btn-delete" onClick=${() => onDelete(s.name)} title="Supprimer">🗑</button>
              </div>
            `)}
          </div>
        ` : null}
      </div>
    </div>
  `;
}
