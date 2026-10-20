import { stages, torque, litmus, medal } from './data.js';
import { Game } from './engine.js';
import { foodArt } from './food-art.js';

const app = document.querySelector('#app');
const game = new Game();
let muted = true, audio, last = '';
const button = (text, action, extra = '') => `<button data-action="${action}" ${extra}>${text}</button>`;

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
  if (game.stage === 0) scene = `<div class="tutorial-food">${foodArt(stages[0].questions[0])}</div><p>看包裝、看狀態，再決定保存位置。</p>`;
  if (game.stage === 1) scene = `<div class="lever-demo">${leverDiagram({ mass: 12, force: 6, length: 6 }, 2, 'balance')}</div>
    <div class="math">6 × 4 = 24 kgf·m<br>12 × 2 = 24 kgf·m</div><p>24＝24：力矩平衡，挑戰通過。<br>施力力矩較大：才會抬起貨箱。</p>`;
  if (game.stage === 2) scene = '<div class="paper-demo"><span class="paper blue to-red"></span> 遇酸 → 紅色<br><span class="paper red to-blue"></span> 遇鹼 → 藍色</div><p>中性：紅、藍試紙都維持原色</p>';
  if (game.stage === 3) scene = '<div class="demo-planets">☀️　🌑　🟠　🪐</div><p>最近：水星 · 最大：木星 · 環最顯著：土星</p>';
  return `<div class="tutorial"><div class="eyebrow">先看示範 · 不限時間</div>${scene}<h2>${s.tip}</h2>
    ${button(game.stage === 1 ? '開始練習 →' : '我準備好了 →', 'begin', 'class="primary wide"')}
    <p class="subtle">看懂再開始，不會自動跳過。</p></div>`;
}

const planetClasses = { 水星: 'mercury', 金星: 'venus', 地球: 'earth', 火星: 'mars', 木星: 'jupiter', 土星: 'saturn', 天王星: 'uranus', 海王星: 'neptune' };
const defaultHints = ['看清楚開封、含水與保存標示，再選位置。', '按左右移動支點，再按「用力！」測試。', '選試紙 → 點液體 → 判斷性質。', '點擊行星，發射科學光束！'];

function feedback() {
  const success = ['feedback', 'practice-feedback'].includes(game.phase);
  return `<div class="feedback ${success ? 'success' : ''} ${game.outcome === 'insufficient' ? 'try-again' : ''}" role="status" aria-live="polite">${game.feedback || defaultHints[game.stage]}</div>`;
}

function continueButton() {
  if (!['feedback', 'practice-feedback'].includes(game.phase)) return '';
  const text = game.phase === 'practice-feedback' ? '進入正式挑戰 →' : game.question === stages[game.stage].questions.length - 1 ? (game.stage === 3 ? '查看獎章 →' : '前往下一攤 →') : '下一題 →';
  return button(text, 'next', `class="primary wide continue" ${game.canContinue ? '' : 'disabled'}`);
}

function play() {
  const s = stages[game.stage], q = game.current;
  const locked = game.phase !== 'play' ? 'disabled' : '';
  const heading = `<div class="question-line">${game.practicing ? '引導練習 · 不計分' : `第 ${game.question + 1}／${s.questions.length} 題`}</div>`;
  let content = '';
  if (game.stage === 0) {
    content = `<div class="food-scene ${locked ? `food-slide to-${q.answer}` : ''}">${foodArt(q)}<h2>${q.name}</h2><p class="food-condition">${q.condition}</p></div>
      <div class="choices two">${button('🧊 放冰箱', 'cold', locked)}${button('🪵 放常溫架', 'shelf', locked)}</div>`;
  }
  if (game.stage === 1) {
    // Feedback and controls precede the longer explanation, so taps have a visible result.
    content = `${leverDiagram(q, game.pivot, game.outcome || '')}${feedback()}${continueButton()}
      <div class="choices two">${button('← 支點向左', 'left', locked || game.pivot === 1 ? 'disabled' : '')}${button('支點向右 →', 'right', locked || game.pivot === q.length - 1 ? 'disabled' : '')}</div>
      ${button('用力！', 'lift', `class="primary wide" ${locked}`)}${leverNumbers(q, game.pivot)}
      <p class="science-note">地球表面附近，1 kg 物體重量約 1 kgf。理想模型不計槓桿重量與摩擦。力矩相等時平衡通過；施力力矩較大才抬起。</p>`;
  }
  if (game.stage === 2) {
    content = `<h2>${q.name}</h2><div class="choices two">
      ${button('紅色石蕊試紙', 'red', `class="red-choice ${game.selected === 'red' ? 'selected' : ''}" ${locked}`)}
      ${button('藍色石蕊試紙', 'blue', `class="blue-choice ${game.selected === 'blue' ? 'selected' : ''}" ${locked}`)}</div>
      ${button(`<span class="beaker">🧪</span><span>${game.selected ? '點液體檢測' : '先選擇一張試紙'}</span>`, 'dip', `class="liquid" ${locked || !game.selected ? 'disabled' : ''}`)}
      <div class="observations">${['red', 'blue'].map(p => game.observations[p] ? `<span><i class="paper ${game.observations[p]}"></i>${p === 'red' ? '紅' : '藍'}試紙 → ${game.observations[p] === 'red' ? '紅' : '藍'}色${game.observations[p] === p ? '（未變色）' : '（變色）'}</span>` : '').join('') || '檢測可重複，不影響分數'}</div>
      <div class="choices three">${button('酸性', 'acid', locked)}${button('中性', 'neutral', locked)}${button('鹼性', 'base', locked)}</div>
      <p class="science-note">沒有變色不一定是中性；可換另一張試紙。這是模擬檢測，請勿飲用實驗液體。</p>`;
  }
  if (game.stage === 3) content = `<h2>${q.name}</h2><div class="planet-grid ${locked ? 'hit' : ''}">${q.choices.map(p => button(`<span class="planet ${planetClasses[p]}"></span><span>${p}</span>`, p, locked)).join('')}</div>`;
  return heading + content + (game.stage === 1 ? '' : feedback() + continueButton());
}

function render() {
  game.tick();
  // No wall-clock field in the render key: idle time never replaces a pressed button.
  const key = JSON.stringify([game.phase, game.stage, game.question, game.pivot, game.feedback, game.selected, game.observations, muted, game.practicing, game.outcome, game.reaction, game.canContinue]);
  if (key === last) return;
  last = key;
  // Preserve the focused control through synchronous redraws for keyboard users.
  const focusAction = app.contains(document.activeElement) ? document.activeElement.dataset.action : null;
  if (game.phase === 'home') {
    app.innerHTML = `<section class="home"><div class="lanterns">🏮 <span>SUNSHINE NIGHT MARKET</span> 🏮</div><div class="eyebrow">V6.1 · 慢慢想，也能闖關</div>
      <h1>陽光<span>夜市</span></h1><p class="lead">逛一圈夜市，帶走一身科學超能力。</p><div class="market-art"><span>🥛</span><span>📦</span><span>🧪</span><span>🪐</span></div>
      <div class="route">生物 → 物理 → 化學 → 地球科學</div><p>四個攤位・不限時間<br>滿分 100 分，60 分通過</p>${button('開始挑戰 →', 'start', 'class="primary wide"')}<p class="subtle">不用登入 · 不收集個資 · 單指就能玩</p></section>`;
  } else if (game.phase === 'result') {
    const m = medal(game.score);
    app.innerHTML = `<section class="result"><div class="eyebrow">四個攤位，挑戰完成！</div><h1>陽光夜市</h1><div class="badge ${m.tier}"><span>${m.symbol}</span><strong>${m.name}</strong></div>
      <div class="final-score">${game.score}<small>／100</small></div><h2>${game.score >= 60 ? '通過' : '未通過 · 參與獎章'}</h2>${button('重新挑戰', 'restart', 'class="primary wide"')}</section>`;
  } else {
    const s = stages[game.stage];
    app.innerHTML = `<header><span class="brand">🏮 陽光夜市</span>${button(muted ? '🔇 靜音' : '🔊 音效', 'mute', 'class="sound" aria-label="切換靜音"')}</header>
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
  if (action === 'start' || action === 'restart') game.start();
  else if (action === 'begin') game.begin();
  else if (action === 'next') game.next();
  else if (action === 'mute') muted = !muted;
  else if (action === 'left' || action === 'right') game.move(action === 'left' ? -1 : 1);
  else if (action === 'red' || action === 'blue') game.select(action);
  else if (action === 'dip') {
    game.tick();
    if (game.phase === 'play' && game.stage === 2 && game.selected) {
      game.observations[game.selected] = litmus(game.current.answer, game.selected);
      game.feedback = game.observations[game.selected] === game.selected ? '沒有變色也是觀察結果，可以換另一種試紙！' : '觀察到了！試紙變色了。';
    }
  } else sound(game.answer(action));
  render();
});

document.addEventListener('visibilitychange', render);
setInterval(render, 100); // Poll animation completion; identical states do not touch the DOM.
render();
