import { html } from '../html.js';
import { GRID_SIZE, DAEMON, OBSTACLES, TROPHIES } from '../constants.js';
import Dragon from './Dragon.js';

const OBSTACLE_SET = new Set(OBSTACLES.map(o => `${o.x},${o.y}`));

const TERRAIN = ['cell-grass','cell-grass','cell-grass','cell-grass-dark','cell-grass-dark','cell-dirt','cell-dirt','cell-stone','cell-stone','cell-stone-dark'];
function terrain(x, y) {
  return TERRAIN[(x * 7 + y * 13 + x * y * 3) % TERRAIN.length];
}

const FOOT_ANGLE = { right: 90, left: 270, up: 0, down: 180 };
const NUMS = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);

function trophyFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return TROPHIES[Math.abs(h) % TROPHIES.length];
}

const CONFETTI_COLORS = ['#ff4081', '#ffd600', '#00e676', '#448aff', '#e040fb', '#ff6d00', '#00bcd4'];
const confetti = Array.from({ length: 55 }, (_, i) => ({
  left:     Math.random() * 100,
  delay:    -(Math.random() * 4),
  duration: 2 + Math.random() * 1.5,
  color:    CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  width:    6 + Math.floor(Math.random() * 7),
  height:   9 + Math.floor(Math.random() * 8),
  rot:      Math.floor(Math.random() * 360),
}));

export default function Grid({ character, gridEffect, daemonBeaten, characterDefeated, singing, showTrophy, childName, footsteps = [] }) {
  const footMap = new Map();
  for (const f of footsteps) footMap.set(`${f.x},${f.y}`, f.dir);

  const cells = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const isChar     = character.x === x && character.y === y;
      const isDaemon   = x === DAEMON.x && y === DAEMON.y;
      const isObstacle = OBSTACLE_SET.has(`${x},${y}`);
      const footDir    = !isChar ? footMap.get(`${x},${y}`) : undefined;
      cells.push(html`
        <div
          key=${`${x}-${y}`}
          className=${
            'cell '
            + terrain(x, y)
            + (isChar     ? ' has-character' : '')
            + (isDaemon && !daemonBeaten ? ' cell-daemon'        : '')
            + (isDaemon &&  daemonBeaten ? ' cell-daemon-beaten' : '')
            + (isObstacle ? ' cell-obstacle' : '')
          }
        >
          ${footDir !== undefined ? html`<div className="cell-footstep" style=${{ transform: `rotate(${FOOT_ANGLE[footDir]}deg)` }}></div>` : null}
          ${isChar
            ? html`
              <div className="char-wrapper">
                ${singing ? html`<img src="static/img/sing.svg" alt="chanter" className="sing-bubble" />` : null}
                <img src=${characterDefeated ? 'static/img/sprites/girl_defeat.png' : 'static/img/sprites/girl_' + character.dir + '.png'} alt="personnage" className="character-sprite" />
              </div>`
            : isObstacle
              ? '🪨'
              : isDaemon
                ? html`<${Dragon} beaten=${daemonBeaten} />`
                : null
          }
        </div>
      `);
    }
  }

  return html`
    <div className="main-area">
      <div className="screen-monitor">
        <div className="screen-bezel">
          <div className="screen-face" data-screen-face="1">
            <div className="grid-coords-wrapper">
              <div className="grid-corner"></div>
              <div className="grid-col-labels grid-col-labels-top">
                ${NUMS.map(n => html`<div key=${n} className="grid-coord-label">${n}</div>`)}
              </div>
              <div className="grid-corner"></div>
              <div className="grid-row-labels grid-row-labels-left">
                ${NUMS.map(n => html`<div key=${n} className="grid-coord-label">${n}</div>`)}
              </div>
              <div className=${'grid' + (gridEffect === 'error' ? ' grid-error' : gridEffect === 'win' ? ' grid-win' : '')}>
                ${cells}
              </div>
              <div className="grid-row-labels grid-row-labels-right">
                ${NUMS.map(n => html`<div key=${n} className="grid-coord-label">${n}</div>`)}
              </div>
              <div className="grid-corner"></div>
              <div className="grid-col-labels grid-col-labels-bottom">
                ${NUMS.map(n => html`<div key=${n} className="grid-coord-label">${n}</div>`)}
              </div>
              <div className="grid-corner"></div>
            </div>
            ${showTrophy ? html`
              <div className="win-overlay">
                ${confetti.map((c, i) => html`
                  <div key=${i} className="confetti-piece" style=${{
                    left:              `${c.left}%`,
                    width:             `${c.width}px`,
                    height:            `${c.height}px`,
                    background:        c.color,
                    animationDuration: `${c.duration}s`,
                    animationDelay:    `${c.delay}s`,
                    transform:         `rotate(${c.rot}deg)`,
                  }} />
                `)}
                <div className="win-message">
                  <span className="win-trophy">${trophyFor(childName)}</span>
                  <span className="win-text">Bravo ${childName} !</span>
                </div>
              </div>
            ` : null}
          </div>
          <div className="screen-chin">
            <div className="screen-led"></div>
            <span className="screen-brand">ÉCRAN</span>
          </div>
        </div>
        <div className="screen-neck"></div>
        <div className="screen-base"></div>
      </div>
    </div>
  `;
}
