import { html } from '../html.js';

export default function PipelineHeader({ phase, statusText, statusError }) {
  const codeActive   = phase === 'compile';
  const binaryActive = phase === 'compile' || phase === 'encode' || phase === 'execute';
  const execActive   = phase === 'execute';

  return html`
    <div className="pipeline-header">
      <div className=${'pipe-stage' + (codeActive ? ' active' : '')} id="pipe-code">
        <span className="pipe-icon">📋</span>
        <div className="pipe-text">
          <div className="pipe-title">Code</div>
          <div className="pipe-sub">Instructions</div>
        </div>
      </div>
      <div className=${'pipe-stage' + (binaryActive ? ' active' : '')} id="pipe-binary">
        <span className="pipe-icon">🖥️</span>
        <div className="pipe-text">
          <div className="pipe-title">Programme</div>
          <div className="pipe-sub">Créé par l'ordi</div>
        </div>
      </div>
      <div className=${'pipe-stage' + (execActive ? ' active' : '')} id="pipe-exec">
        <span className="pipe-icon">📺</span>
        <div className="pipe-text">
          <div className="pipe-title">Écran</div>
          <div className="pipe-sub">Résultat</div>
        </div>
        <span className=${'status-label' + (statusError ? ' error' : '')}>${statusText}</span>
      </div>
    </div>
  `;
}
