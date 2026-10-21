import { stages, torque, medal } from './data.js';
import { Game } from './engine.js';
import { foodArt } from './food-art.js';
import { APP_TITLE } from './config.js';
import { LitmusExperiment, litmusMessage, litmusScene, paperName } from './litmus.js';

const app = document.querySelector('#app');
const game = new Game();
let muted = true, audio, last = '';
let demoExperiment, demoProperty, demoLiquid;
function resetDemo() {
  demoExperiment = new LitmusExperiment();
  demoExperiment.select('blue');
  demoProperty = 'acid';
  demoLiquid = '檸檬汁';
}
resetDemo();
const button = (text, action, extra = '') => `<button data-action="${action}" ${extra}>${text}</button>`;

function titleMarkup() {
  return `<h1 class="school-title" aria-label="${APP_TITLE}"><span class="school-name">內湖國中</span><span class="market-name">陽光科學夜市</span></h1>`;
}

function paperButton(paper, selected, disabled, demo = false) {
  const name = `${paperName(paper)}石蕊試紙`;
  return button(`<span class="paper-choice-preview paper-${paper}" aria-hidden="true"></span><span>${name}</span>`, `${demo ? 'demo-' : ''}${paper}`,
    `class="paper-choice ${paper}-choice ${selected === paper ? 'selected' : ''}" aria-label="${demo ? '示範' : ''}${name}" aria-pressed="${selected === paper}" ${disabled ? 'disabled' : ''}`);
}

function experimentMarkup(experiment, name, disabled, demo = false) {
  const snapshot = experiment.snapshot();
  const label = snapshot.busy ? '檢測中，請稍候' : snapshot.paper ? '點液體檢測' : '先選擇一張試紙';
  return `${button(`${litmusScene(snapshot, name)}<span class="sample-callout">${label}</span>`, demo ? 'demo-dip' : 'dip',
    `class="sample-button" aria-label="${demo ? '示範：' : ''}${label}" ${disabled || !snapshot.paper || snapshot.busy ? 'disabled' : ''}`)}
    <p class="litmus-status" role="status" aria-live="polite">${litmusMessage(snapshot)}</p>`;
}

function answerButton(text, action, extra = '', className = '') {
  const chosen = game.lastAnswer === action;
  const wrong = chosen && game.answerState === 'wrong';
  const correct = chosen && game.answerState === 'correct';
  const marker = wrong ? '<span class="answer-marker" aria-hidden="true">✕ 再想想</span>' : correct ? '<span class="answer-marker" aria-hidden="true">✓ 答對了</span>' : '';
  return button(`<span>${text}</span>${marker}`, action, `class="answer-button ${className} ${wrong ? 'answer-wrong' : correct ? 'answer-correct' : ''}" aria-label="${action === 'lift' ? '用力！' : text.replace(/<[^>]*>/g, '')}" aria-describedby="answer-feedback" ${extra}`);
}

function sound(ok) {
  if (muted) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.frequency.value = ok ? 660 : 220;
    gain.gain.setValueAtTime(.06, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .15);
    oscillator.start(); oscillator.stop(audio.currentTime + .15);
  } catch { /* Visual and textual feedback remains available without audio. */ }
}

function leverDiagram(q, pivot, outcome = '') {
  const t = torque(q, pivot);
  return `<div class="lever-scene ${outcome}" style="--pivot:${pivot / q.length * 100}%;--origin:${pivot / q.length * 100}%">
    <div class="beam"><span class="crate">📦</span><span class="hand">👇</span></div>
    <span class="fulcrum">▲</span>
    <div class="arms"><span>抗力臂 ${t.resistanceArm} m</span><span>施力臂 ${t.effortArm} m</span></div>
    </div><p class="pivot-position">支點距貨箱 ${pivot} m ／ 槓桿全長 ${q.length} m</p>`;
}

function leverNumbers(q, pivot) {
  const t = torque(q, pivot);
  return `<div class="facts"><span>貨箱質量 <b>${q.mass} kg</b></span><span>抗力約 <b>${q.mass} kgf</b></span><span>玩家施力 <b>${q.force} kgf</b></span></div>
    <div class="math">施力力矩：${q.force} × ${t.effortArm} = <b>${t.effort} kgf·m</b><br>
    抗力力矩：${q.mass} × ${t.resistanceArm} = <b>${t.resistance} kgf·m</b></div>`;
}

function tutorial(s) {
  let scene = '';
  if (game.stage === 0) scene = `<div class="tutorial-food">${foodArt(stages[0].questions[0])}</div><p>看包裝與食物狀態，判斷是否必須冷藏。</p><p>「可常溫保存」不代表「不能冷藏」。<br>這裡判斷的是冷藏的必要性。</p>`;
  if (game.stage === 1) scene = `<div class="lever-demo">${leverDiagram({ mass: 12, force: 6, length: 6 }, 2, 'balance')}</div>
    <div class="math">6 × 4 = 24 kgf·m<br>12 × 2 = 24 kgf·m</div><p>24＝24：力矩平衡，挑戰通過。<br>施力力矩較大：才會抬起貨箱。</p>`;
  if (game.stage === 2) {
    const busy = demoExperiment.busy;
    scene = `<p>示範不計分：先選試紙，再點杯中液體。</p>
      <div class="choices demo-fluids">${button('檸檬汁', 'demo-acid', busy ? 'disabled' : '')}${button('小蘇打水', 'demo-base', busy ? 'disabled' : '')}${button('純水', 'demo-neutral', busy ? 'disabled' : '')}</div>
      <div class="choices two">${paperButton('red', demoExperiment.paper, busy, true)}${paperButton('blue', demoExperiment.paper, busy, true)}</div>
      ${experimentMarkup(demoExperiment, demoLiquid, false, true)}<p class="science-note">先看原色；末端進入液面後，才觀察變色或不變色。</p>`;
  }
  if (game.stage === 3) scene = '<div class="demo-planets">☀️　🌑　🟠　🪐</div><p>最近：水星 · 最大：木星 · 環最顯著：土星</p>';
  return `<div class="tutorial"><div class="eyebrow">先看示範 · 不限時間</div>${scene}<h2>${s.tip}</h2>
    ${button(game.stage === 1 ? '開始練習 →' : '我準備好了 →', 'begin', `class="primary wide" ${game.stage === 2 && demoExperiment.busy ? 'disabled' : ''}`)}
    <p class="subtle">看懂再開始，不會自動跳過。</p></div>`;
}

const planetClasses = { 水星: 'mercury', 金星: 'venus', 地球: 'earth', 火星: 'mars', 木星: 'jupiter', 土星: 'saturn', 天王星: 'uranus', 海王星: 'neptune' };
const defaultHints = ['依題目條件判斷是否必須冷藏，不是選擇要放哪裡。', '按左右移動支點，再按「用力！」測試。', '選試紙 → 點液體 → 判斷性質。', '點擊行星，發射科學光束！'];

function feedback() {
  const success = ['feedback', 'practice-feedback'].includes(game.phase);
  const wrong = game.answerState === 'wrong';
  const attempts = game.practicing ? game.practiceAttempts : game.records[game.stage][game.question]?.attempts;
  const title = wrong ? `✕ 還沒答對，${game.stage === 1 ? '請調整支點再試' : '請再選一次'}` : success ? `✓ ${game.stage === 1 ? '挑戰通過' : '答對了'}！請按「${continueLabel().replace(' →', '')}」繼續` : '';
  return `<div id="answer-feedback" class="feedback ${success ? 'success' : ''} ${wrong ? 'try-again' : ''}" role="status" aria-live="polite" aria-atomic="true">${title ? `<strong class="feedback-title">${title}</strong>` : ''}<span>${game.feedback || defaultHints[game.stage]}</span>${wrong ? `<small class="feedback-attempt">第 ${attempts} 次嘗試・未得分，可以重試</small>` : ''}</div>`;
}

function continueLabel() {
  return game.phase === 'practice-feedback' ? '進入正式挑戰 →' : game.question === stages[game.stage].questions.length - 1 ? (game.stage === 3 ? '查看獎章 →' : '前往下一攤 →') : '下一題 →';
}

function continueButton() {
  if (!['feedback', 'practice-feedback'].includes(game.phase)) return '';
  return button(continueLabel(), 'next', `class="primary wide continue" ${game.canContinue ? '' : 'disabled'}`);
}

function play() {
  const s = stages[game.stage], q = game.current;
  const locked = game.phase !== 'play' || game.isTesting ? 'disabled' : '';
  const heading = `<div class="question-line">${game.practicing ? '引導練習 · 不計分' : `第 ${game.question + 1}／${s.questions.length} 題`}</div>`;
  let content = '';
  if (game.stage === 0) {
    content = `<div class="food-scene ${locked ? 'food-confirmed' : ''}">${foodArt(q)}<h2>${q.name}</h2><p class="food-condition">${q.condition}</p></div>
      <p class="food-task"><strong>依上述條件，是否必須冷藏？</strong></p>
      ${feedback()}<div class="choices two">${answerButton('必須冷藏', 'required', locked)}${answerButton('可常溫保存', 'room-ok', locked)}</div>${continueButton()}
      <p class="science-note">可常溫保存不代表禁止冷藏；本題只判斷是否必須冷藏。</p>`;
  }
  if (game.stage === 1) {
    // Feedback and controls precede the longer explanation, so taps have a visible result.
    content = `${leverDiagram(q, game.pivot, game.outcome || '')}${feedback()}${continueButton()}
      <div class="choices two">${button('← 支點向左', 'left', locked || game.pivot === 1 ? 'disabled' : '')}${button('支點向右 →', 'right', locked || game.pivot === q.length - 1 ? 'disabled' : '')}</div>
      ${answerButton('用力！', 'lift', locked, 'primary wide')}${leverNumbers(q, game.pivot)}
      <p class="science-note">地球表面附近，1 kg 物體重量約 1 kgf。理想模型不計槓桿重量與摩擦。力矩相等時平衡通過；施力力矩較大才抬起。</p>`;
  }
  if (game.stage === 2) {
    content = `<h2>${q.name}</h2><div class="choices two">${paperButton('red', game.selected, !!locked)}${paperButton('blue', game.selected, !!locked)}</div>
      ${experimentMarkup(game.experiment, q.name, game.phase !== 'play')}
      <div class="observations">${Object.keys(game.observations).length ? '<strong>本題已完成的觀察</strong>' : ''}${['red', 'blue'].map(p => game.observations[p] ? `<span class="observation-card"><i class="mini-paper paper-${p}" aria-hidden="true"></i> ${paperName(p)}試紙：原色${paperName(p)} → ${game.observations[p] === p ? `維持${paperName(p)}，未變色` : `浸入區變成${paperName(game.observations[p])}`}<i class="mini-paper paper-${game.observations[p]}" aria-hidden="true"></i></span>` : '').join('') || '檢測可重複，不影響分數'}</div>
      ${feedback()}<div class="choices three">${answerButton('酸性', 'acid', locked)}${answerButton('中性', 'neutral', locked)}${answerButton('鹼性', 'base', locked)}</div>${continueButton()}
      <p class="science-note">沒有變色不一定是中性；可換另一張試紙。這是模擬檢測，請勿飲用實驗液體。</p>`;
  }
  if (game.stage === 3) content = `<h2>${q.name}</h2>${feedback()}<div class="planet-grid ${locked ? 'hit' : ''}">${q.choices.map(p => answerButton(`<span class="planet ${planetClasses[p]}"></span><span>${p}</span>`, p, locked)).join('')}</div>${continueButton()}`;
  return heading + content;
}

function render() {
  game.tick();
  // No wall-clock field in the render key: idle time never replaces a pressed button.
  const key = JSON.stringify([game.phase, game.stage, game.question, game.pivot, game.feedback, game.selected, game.observations, muted, game.practicing, game.outcome, game.reaction, game.canContinue, game.answerState, game.lastAnswer, game.experiment.snapshot().phase, demoExperiment.snapshot().phase, demoExperiment.paper, demoProperty]);
  if (key === last) return;
  last = key;
  // Preserve the focused control through synchronous redraws for keyboard users.
  const focusAction = app.contains(document.activeElement) ? document.activeElement.dataset.action : null;
  if (game.phase === 'home') {
    app.innerHTML = `<section class="home"><div class="lanterns" aria-hidden="true"><span class="lantern-icon">🏮</span><span class="lantern-icon">🏮</span></div>
      ${titleMarkup()}<p class="lead">逛一圈夜市，帶走一身科學超能力。</p><div class="market-art"><span>🥛</span><span>📦</span><span>🧪</span><span>🪐</span></div>
      <p>四個攤位・不限時間<br>滿分 100 分，60 分通過</p>${button('開始挑戰 →', 'start', 'class="primary wide"')}</section>`;
  } else if (game.phase === 'result') {
    const m = medal(game.score);
    app.innerHTML = `<section class="result"><div class="eyebrow">四個攤位，挑戰完成！</div>${titleMarkup()}<div class="badge ${m.tier}"><span>${m.symbol}</span><strong>${m.name}</strong></div>
      <div class="final-score">${game.score}<small>／100</small></div><h2>${game.score >= 60 ? '通過' : '未通過 · 參與獎章'}</h2>${button('重新挑戰', 'restart', 'class="primary wide"')}</section>`;
  } else {
    const s = stages[game.stage];
    const testing = game.isTesting || (game.stage === 2 && game.phase === 'tutorial' && demoExperiment.busy);
    app.innerHTML = `<header><span class="brand">🏮 ${APP_TITLE}</span>${button(muted ? '🔇 靜音' : '🔊 音效', 'mute', `class="sound" aria-label="切換靜音" ${testing ? 'disabled' : ''}`)}</header>
      <div class="hud"><span>${game.stage + 1}／4 · ${s.subject}</span><span class="untimed">不限時間</span><span>${game.score} 分</span></div>
      <div class="progress">${stages.map((_, i) => `<i class="${i <= game.stage ? 'on' : ''}"></i>`).join('')}</div>
      <section class="stall stall-${game.stage}"><div class="awning"></div><h1 class="stall-title">${s.icon} ${s.name}</h1>${game.phase === 'tutorial' ? tutorial(s) : play()}</section>`;
  }
  if (focusAction) {
    const target = [...app.querySelectorAll('button')].find(b => b.dataset.action === focusAction && !b.disabled);
    target?.focus({ preventScroll: true });
  }
}

app.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target || target.disabled) return;
  const action = target.dataset.action;
  if (action === 'start' || action === 'restart') { game.start(); resetDemo(); }
  else if (action === 'begin') { if (!(game.stage === 2 && demoExperiment.busy)) game.begin(); }
  else if (action === 'next') game.next();
  else if (action === 'mute') muted = !muted;
  else if (action === 'left' || action === 'right') game.move(action === 'left' ? -1 : 1);
  else if (action === 'red' || action === 'blue') game.select(action);
  else if (action === 'dip') game.dip();
  else if (action.startsWith('demo-')) {
    if (game.stage !== 2 || game.phase !== 'tutorial' || demoExperiment.busy) return;
    const value = action.slice(5);
    if (value === 'dip') demoExperiment.start(demoProperty);
    else if (value === 'red' || value === 'blue') demoExperiment.select(value);
    else if (['acid', 'base', 'neutral'].includes(value)) {
      demoProperty = value;
      demoLiquid = { acid: '檸檬汁', base: '小蘇打水溶液', neutral: '純水' }[value];
      demoExperiment.select(value === 'base' ? 'red' : 'blue');
    }
  } else sound(game.answer(action));
  render();
  if (target.classList.contains('answer-button')) {
    const message = document.querySelector('#answer-feedback');
    const rect = message?.getBoundingClientRect();
    const controls = [...app.querySelectorAll('.answer-button, .continue')].map(control => control.getBoundingClientRect());
    const bottom = Math.max(rect?.bottom ?? 0, ...controls.map(bounds => bounds.bottom));
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (rect && (rect.top < 12 || bottom > window.innerHeight - 12)) {
      // Keep the retry explanation and choices together when they fit on screen.
      if (bottom - rect.top <= window.innerHeight - 24) window.scrollBy({ top: rect.top - 12, behavior });
      else message.scrollIntoView({ block: 'nearest', behavior });
    }
  }
});

document.addEventListener('visibilitychange', render);
setInterval(render, 100); // Poll animation completion; identical states do not touch the DOM.
render();
