import { useState, useRef, useCallback } from 'react';
import { html, Fragment } from './html.js';
import { GRID_SIZE, START, INSTRUCTIONS, DAEMON, OBSTACLES, CHILD_NAME } from './constants.js';
import ProgramPanel from './components/ProgramPanel.js';
import TowerCol from './components/TowerCol.js';
import Grid from './components/Grid.js';
import PalettePanel from './components/PalettePanel.js';
import BroadcastPacket from './components/BroadcastPacket.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const BROADCAST_MS  = 600; // antenna broadcast duration per step
const PRELOAD_MS    = 300; // when to switch robot screen to next instruction
const POST_MOVE_MS  = 120; // brief pause after character moves
const POP_MS        = 250; // instruction pops in list before robot/broadcast

const STORAGE_KEY = '4p-saves';
function readSaves() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export default function App() {
  const [character, setCharacter]     = useState({ ...START });
  const [program, setProgram]         = useState([]);
  const [execState, setExecState]     = useState('idle');
  const [currentStep, setCurrentStep] = useState(-1);
  const [activeStep, setActiveStep]   = useState(-1);
  const [errorStep, setErrorStep]     = useState(-1);
  const [statusText, setStatusText]   = useState('');
  const [statusError, setStatusError] = useState(false);
  const [gridEffect, setGridEffect]     = useState('');
  const [daemonBeaten, setDaemonBeaten] = useState(false);
  const [singing, setSinging]           = useState(false);
  const [showTrophy, setShowTrophy]     = useState(false);
  const [childName, setChildName] = useState(CHILD_NAME);
  const [saves, setSaves] = useState(readSaves);
  const [splash, setSplash] = useState(() => !localStorage.getItem('4p-splash-seen'));
  const [splashHiding, setSplashHiding] = useState(false);
  const [footsteps, setFootsteps] = useState([]);
  const [robotInstruction, setRobotInstruction]     = useState(null);
  const [robotBroadcasting, setRobotBroadcasting]   = useState(false);
  const [robotBroadcastRev, setRobotBroadcastRev]   = useState(false);

  function dismissSplash() {
    localStorage.setItem('4p-splash-seen', '1');
    setSplashHiding(true);
    setTimeout(() => setSplash(false), 500);
  }

  const execStateRef         = useRef('idle');
  const characterRef         = useRef({ ...START });
  const currentStepRef       = useRef(-1);
  const posHistoryRef        = useRef([]);
  const autoPlayGenRef       = useRef(0);
  const programRef           = useRef([]);
  const robotBroadcastingRef = useRef(false);

  function setExecStateSync(s)        { execStateRef.current = s;         setExecState(s); }
  function setCurrentStepSync(s)      { currentStepRef.current = s;       setCurrentStep(s); }
  function setCharacterSync(c)        { characterRef.current = c;         setCharacter(c); }
  function setProgramSync(p)          { programRef.current = p;           setProgram(p); }
  function setRobotBroadcastingSync(v){ robotBroadcastingRef.current = v; setRobotBroadcasting(v); }

  function executeStep(stepIndex) {
    const prog = programRef.current;
    const char = characterRef.current;

    posHistoryRef.current[stepIndex] = { ...char };
    setCurrentStepSync(stepIndex);
    setActiveStep(stepIndex);
    setErrorStep(-1);

    // Sing action: no movement, check adjacency to daemon
    if (prog[stepIndex] === 'sing') {
      const dist = Math.abs(char.x - DAEMON.x) + Math.abs(char.y - DAEMON.y);
      if (dist === 1) {
        setStatusError(false);
        setActiveStep(-1);
        setExecStateSync('done');
        setSinging(true);
        setTimeout(() => {
          setSinging(false);
          setDaemonBeaten(true);
        }, 1000);
        setTimeout(() => {
          setShowTrophy(true);
          setGridEffect('win');
          setTimeout(() => setGridEffect(''), 1500);
          setStatusText('🎉 Démon vaincu ! Le K-pop idol sauve le monde !');
        }, 1500);
      } else {
        setStatusText(`🎵 Le démon est trop loin ! (Étape ${stepIndex + 1} / ${prog.length})`);
        if (stepIndex === prog.length - 1) {
          setActiveStep(-1);
          setExecStateSync('done');
        }
      }
      return;
    }

    const instr = INSTRUCTIONS[prog[stepIndex]];
    const nx = char.x + instr.dx;
    const ny = char.y + instr.dy;

    if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) {
      setErrorStep(stepIndex);
      setActiveStep(-1);
      setGridEffect('error');
      setStatusText('❌ Hors du monde !');
      setStatusError(true);
      setExecStateSync('done');
      return;
    }

    if (OBSTACLES.some(o => o.x === nx && o.y === ny)) {
      setErrorStep(stepIndex);
      setActiveStep(-1);
      setGridEffect('error');
      setStatusText('🪨 Obstacle ! Tu ne peux pas passer !');
      setStatusError(true);
      setExecStateSync('done');
      return;
    }

    if (nx === DAEMON.x && ny === DAEMON.y) {
      setErrorStep(stepIndex);
      setActiveStep(-1);
      setGridEffect('error');
      setStatusText('👹 Tu t\'as fait dévorer par le démon !');
      setStatusError(true);
      setExecStateSync('done');
      return;
    }

    setFootsteps(prev => [...prev, { x: char.x, y: char.y, dir: prog[stepIndex] }]);
    setCharacterSync({ x: nx, y: ny, dir: prog[stepIndex] });

    setStatusText(`Étape ${stepIndex + 1} / ${prog.length}`);

    if (stepIndex === prog.length - 1) {
      setActiveStep(-1);
      setStatusText('✅ Terminé !');
      setTimeout(() => {
        if (execStateRef.current === 'done') setStatusText('');
      }, 2000);
      setExecStateSync('done');
    }
  }

  async function runAutoPlay() {
    const gen = ++autoPlayGenRef.current;

    while (execStateRef.current === 'playing' && gen === autoPlayGenRef.current) {
      const nextIdx = currentStepRef.current + 1;
      if (nextIdx >= programRef.current.length) break;

      // ── Phase 0: instruction pops in program list ──
      setActiveStep(nextIdx);
      await sleep(POP_MS);
      if (execStateRef.current !== 'playing' || gen !== autoPlayGenRef.current) return;

      // ── Phase 1: robot receives instruction, antenna starts broadcasting ──
      setRobotInstruction(programRef.current[nextIdx]);
      setRobotBroadcastingSync(true);

      // ── Phase 2: halfway through – robot preloads next instruction ──
      await sleep(PRELOAD_MS);
      if (execStateRef.current !== 'playing' || gen !== autoPlayGenRef.current) {
        setRobotBroadcastingSync(false);
        return;
      }
      const followIdx = nextIdx + 1;
      if (followIdx < programRef.current.length) {
        setRobotInstruction(programRef.current[followIdx]);
      }

      await sleep(BROADCAST_MS - PRELOAD_MS);
      if (execStateRef.current !== 'playing' || gen !== autoPlayGenRef.current) {
        setRobotBroadcastingSync(false);
        return;
      }

      // ── Phase 3: broadcast done – character moves ──
      setRobotBroadcastingSync(false);
      executeStep(nextIdx);

      await sleep(POST_MOVE_MS);
    }

    setRobotBroadcastingSync(false);
  }

  async function handlePlayPause() {
    // Only block when a manual step broadcast is running (paused state).
    // During auto-play the user must be able to pause at any time.
    if (execStateRef.current === 'paused' && robotBroadcastingRef.current) return;
    const es = execStateRef.current;
    if (es === 'idle') {
      if (programRef.current.length === 0) return;
      setExecStateSync('playing');
      setCurrentStepSync(-1);
      posHistoryRef.current = [];
      setCharacterSync({ ...START });
      setActiveStep(-1);
      setErrorStep(-1);
      setStatusText('');
      setStatusError(false);
      setFootsteps([]);
      runAutoPlay();
    } else if (es === 'playing') {
      setExecStateSync('paused');
    } else if (es === 'paused') {
      setExecStateSync('playing');
      runAutoPlay();
    }
  }

  async function stepBack() {
    const es = execStateRef.current;
    if (es === 'playing' || currentStepRef.current < 0 || robotBroadcastingRef.current) return;

    const undoIdx = currentStepRef.current;

    // Phase 0: instruction pops in list (lock ref immediately)
    robotBroadcastingRef.current = true;
    setActiveStep(undoIdx);
    await sleep(POP_MS);

    // Phase 1: robot screen + reverse broadcast
    setRobotInstruction(programRef.current[undoIdx]);
    setRobotBroadcastRev(true);
    setRobotBroadcasting(true); // rising edge fires BroadcastPacket with correct instruction
    await sleep(BROADCAST_MS);
    setRobotBroadcastingSync(false);
    setRobotBroadcastRev(false);

    setActiveStep(-1);
    setErrorStep(-1);
    setStatusError(false);
    setGridEffect('');
    setShowTrophy(false);
    setDaemonBeaten(false);
    setSinging(false);
    if (programRef.current[undoIdx] !== 'sing') setFootsteps(prev => prev.slice(0, -1));
    setCharacterSync({ ...posHistoryRef.current[undoIdx] });
    const newStep = undoIdx - 1;
    setCurrentStepSync(newStep);
    if (es === 'done') setExecStateSync('paused');
    if (newStep >= 0) {
      setStatusText(`Étape ${newStep + 1} / ${programRef.current.length}`);
      setActiveStep(newStep);
      setRobotInstruction(programRef.current[newStep]);
    } else {
      setStatusText('');
      setRobotInstruction(null);
    }
  }

  async function stepForward() {
    const es = execStateRef.current;
    if ((es !== 'paused' && es !== 'idle') || robotBroadcastingRef.current) return;
    if (currentStepRef.current >= programRef.current.length - 1) return;

    // First-step from idle: initialise exactly like play, but stay paused
    if (es === 'idle') {
      if (programRef.current.length === 0) return;
      setCurrentStepSync(-1);
      posHistoryRef.current = [];
      setCharacterSync({ ...START });
      setActiveStep(-1);
      setErrorStep(-1);
      setStatusText('');
      setStatusError(false);
      setFootsteps([]);
      setExecStateSync('paused');
    }

    const nextIdx = currentStepRef.current + 1;

    // Phase 0: instruction pops in list (lock ref immediately, state update deferred)
    robotBroadcastingRef.current = true;
    setActiveStep(nextIdx);
    await sleep(POP_MS);
    if (execStateRef.current !== 'paused') { robotBroadcastingRef.current = false; return; }

    // Phase 1: robot screen + broadcast
    setRobotInstruction(programRef.current[nextIdx]);
    setRobotBroadcastRev(false);
    setRobotBroadcasting(true); // rising edge fires BroadcastPacket with correct instruction
    await sleep(BROADCAST_MS);
    setRobotBroadcastingSync(false);

    if (execStateRef.current !== 'paused') return;
    executeStep(nextIdx);
  }

  function persistSaves(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaves(next);
  }

  function saveProgram(name) {
    const trimmed = name.trim();
    if (!trimmed || programRef.current.length === 0) return;
    const next = saves.filter(s => s.name !== trimmed).concat({ name: trimmed, program: programRef.current });
    persistSaves(next);
    setChildName(trimmed);
  }

  function loadSave(save) {
    setExecStateSync('idle');
    setCurrentStepSync(-1);
    posHistoryRef.current = [];
    setProgramSync([...save.program]);
    setCharacterSync({ ...START });
    setActiveStep(-1);
    setErrorStep(-1);
    setStatusText('');
    setStatusError(false);
    setGridEffect('');
    setDaemonBeaten(false);
    setSinging(false);
    setShowTrophy(false);
    setChildName(save.name);
    setRobotInstruction(null);
    setRobotBroadcastingSync(false);
  }

  function deleteSave(name) {
    persistSaves(saves.filter(s => s.name !== name));
  }

  function pauseAndClearError(newProgLength) {
    // Rewind to just before the failed step so re-executing it is the next action.
    // If no error, keep currentStep so execution continues from where it paused.
    const rewindTo = (statusError && errorStep >= 0) ? errorStep - 1 : currentStepRef.current;
    setCurrentStepSync(Math.min(rewindTo, newProgLength - 1));
    setExecStateSync('paused');
    setActiveStep(-1);
    setErrorStep(-1);
    setStatusText('');
    setStatusError(false);
    setGridEffect('');
    setDaemonBeaten(false);
    setSinging(false);
    setShowTrophy(false);
  }

  function addInstruction(id) {
    if (execStateRef.current === 'playing') return;
    const newProg = [...programRef.current, id];
    if (execStateRef.current !== 'idle') pauseAndClearError(newProg.length);
    setProgramSync(newProg);
  }

  function removeInstruction(index) {
    if (execStateRef.current === 'playing') return;
    const newProg = programRef.current.filter((_, i) => i !== index);
    if (execStateRef.current !== 'idle') pauseAndClearError(newProg.length);
    setProgramSync(newProg);
  }

  function resetAll() {
    const es = execStateRef.current;
    if (es === 'playing') return;
    setExecStateSync('idle');
    setCurrentStepSync(-1);
    posHistoryRef.current = [];
    setProgramSync([]);
    setCharacterSync({ ...START });
    setActiveStep(-1);
    setErrorStep(-1);
    setStatusText('');
    setStatusError(false);
    setGridEffect('');
    setDaemonBeaten(false);
    setSinging(false);
    setShowTrophy(false);
    setFootsteps([]);
    setRobotInstruction(null);
    setRobotBroadcastingSync(false);
  }

  const isPlaying   = execState === 'playing';
  const isPaused    = execState === 'paused';
  const isIdle      = execState === 'idle';

  const manualBroadcast = isPaused && robotBroadcasting;
  const playDisabled  = (isIdle && program.length === 0) || manualBroadcast;
  const prevDisabled  = isPlaying || currentStep < 0   || manualBroadcast;
  const nextDisabled  = (!isPaused && !isIdle) || currentStep >= program.length - 1 || manualBroadcast;
  const resetDisabled = isPlaying || manualBroadcast;

  return html`<${Fragment}>
    <${BroadcastPacket} instruction=${robotInstruction} broadcasting=${robotBroadcasting} reverse=${robotBroadcastRev} />
    ${splash ? html`
      <div className=${'splash-screen' + (splashHiding ? ' hiding' : '')} onClick=${dismissSplash}>
        <div className="splash-card">
          <img src="static/img/kpop.jpg" alt="K-Pop Demon Hunters" className="splash-img" />
          <div className="splash-hint">Appuie n'importe où pour commencer !</div>
        </div>
      </div>
    ` : null}
    <div className="app-container">
      <${ProgramPanel}
        program=${program}
        activeStep=${activeStep}
        errorStep=${errorStep}
        onRemove=${removeInstruction}
        onPlay=${handlePlayPause}
        onPrev=${stepBack}
        onNext=${stepForward}
        onReset=${resetAll}
        playDisabled=${playDisabled}
        prevDisabled=${prevDisabled}
        nextDisabled=${nextDisabled}
        resetDisabled=${resetDisabled}
        isPlaying=${isPlaying}
        statusText=${statusText}
        statusError=${statusError}
        saves=${saves}
        onSave=${saveProgram}
        onLoad=${loadSave}
        onDelete=${deleteSave}
      />
      <${TowerCol}
        isRunning=${isPlaying}
        isSad=${statusError}
        instruction=${robotInstruction}
        broadcasting=${robotBroadcasting}
      />
      <${Grid}
        character=${character}
        gridEffect=${gridEffect}
        daemonBeaten=${daemonBeaten}
        characterDefeated=${statusError}
        singing=${singing}
        showTrophy=${showTrophy}
        childName=${childName}
        footsteps=${footsteps}
      />
      <${PalettePanel}
        onAdd=${addInstruction}
        isDisabled=${isPlaying}
      />
    </div>
  <//>`;
}
