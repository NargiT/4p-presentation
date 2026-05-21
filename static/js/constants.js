export const CHILD_NAME = 'Champion';

export const TROPHIES = [
  '🏆','🥇','👑','⭐','🌟','💎','🪄','🚀','🦁','🐯',
  '🦅','🌈','🎯','🎸','🎺','🌸','🍀','🔮','🐉','🦋',
  '🌙','🎠','🦊','🎖️',
];

export const GRID_SIZE = 8;
export const START = { x: 0, y: 0, dir: 'down' };

export const INSTRUCTIONS = {
  right: { label: 'Aller à droite', img: 'static/img/arrow-right.svg', dx:  1, dy:  0, color: '#43a047' },
  left:  { label: 'Aller à gauche', img: 'static/img/arrow-left.svg',  dx: -1, dy:  0, color: '#1e88e5' },
  up:    { label: 'Aller en haut',  img: 'static/img/arrow-up.svg',    dx:  0, dy: -1, color: '#fb8c00' },
  down:  { label: 'Aller en bas',   img: 'static/img/arrow-down.svg',  dx:  0, dy:  1, color: '#8e24aa' },
  sing:  { label: 'Chanter',        img: 'static/img/sing.svg',        dx:  0, dy:  0, color: '#ffd600' },
};

export const INSTR_BITS = { right: '00', left: '01', up: '10', down: '11' };

export const DAEMON = { x: 7, y: 7 };

export const OBSTACLES = [
  { x: 2, y: 1 }, { x: 0, y: 2 }, { x: 2, y: 3 },
  { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 7, y: 0 },
  { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 },
  { x: 1, y: 5 }, { x: 3, y: 6 },
];
