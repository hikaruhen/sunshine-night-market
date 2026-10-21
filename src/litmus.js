import { litmus } from './data.js';

export const LITMUS_TIMING = Object.freeze({ contact: 800, develop: 1100, raise: 1700, complete: 2300 });
export const LITMUS_GEOMETRY = Object.freeze({ paperY: 22, bodyHeight: 54, tipHeight: 18, liquidY: 166, distance: 90 });
export const paperName = color => color === 'red' ? '紅色' : '藍色';

// One immutable sample per dip; no delayed callbacks can write into a later question.
export class LitmusExperiment {
  constructor(now = () => Date.now()) { this.now = now; this.reset(); }
  reset() { this.paper = null; this.sample = null; }
  get busy() { return this.snapshot().busy; }
  select(paper) {
    if (this.busy || !['red', 'blue'].includes(paper)) return false;
    this.paper = paper;
    this.sample = null;
    return true;
  }
  start(property) {
    if (this.busy || !this.paper || !['acid', 'base', 'neutral'].includes(property)) return false;
    this.sample = { paper: this.paper, property, result: litmus(property, this.paper), started: this.now(), committed: false };
    return true;
  }
  snapshot() {
    if (!this.sample) return { phase: this.paper ? 'ready' : 'empty', paper: this.paper, tip: this.paper, busy: false, contacted: false };
    const elapsed = Math.max(0, this.now() - this.sample.started);
    const phase = elapsed < LITMUS_TIMING.contact ? 'lowering' : elapsed < LITMUS_TIMING.develop ? 'contact' : elapsed < LITMUS_TIMING.raise ? 'developing' : elapsed < LITMUS_TIMING.complete ? 'raising' : 'result';
    const visibleResult = elapsed >= LITMUS_TIMING.develop;
    return { phase, paper: this.sample.paper, tip: visibleResult ? this.sample.result : this.sample.paper,
      result: this.sample.result, busy: phase !== 'result', contacted: elapsed >= LITMUS_TIMING.contact,
      changed: visibleResult && this.sample.paper !== this.sample.result };
  }
}

export function litmusMessage(snapshot) {
  const name = snapshot.paper ? paperName(snapshot.paper) : '';
  if (snapshot.phase === 'empty') return '先選紅色或藍色試紙，再點液體檢測。';
  if (snapshot.phase === 'ready') return `乾淨的${name}紙條，尚未浸入液體。`;
  if (snapshot.phase === 'lowering') return `${name}紙條向下移動中，接觸前維持原色。`;
  if (snapshot.phase === 'contact') return '紙條末端已接觸液體，開始觀察浸入區。';
  if (snapshot.phase === 'developing') return `已接觸液體，正在觀察末端：${snapshot.changed ? `變成${paperName(snapshot.tip)}` : `維持${name}，未變色`}。`;
  if (snapshot.phase === 'raising') return '正在取出紙條，請觀察末端的顏色。';
  return snapshot.changed ? `浸入區變成${paperName(snapshot.tip)}；上半部保留原色作對照。` : `維持${name}，未變色。沒有變色也是有效結果。`;
}

export function litmusScene(snapshot, liquidName) {
  const original = snapshot.paper ?? 'empty', tip = snapshot.tip ?? 'empty';
  const color = paper => paper === 'red' ? '#d24b5e' : paper === 'blue' ? '#426bc5' : '#e5e7e8';
  const g = LITMUS_GEOMETRY;
  return `<div class="litmus-experiment phase-${snapshot.phase}" data-phase="${snapshot.phase}" data-paper="${original}" data-tip="${tip}" data-contacted="${snapshot.contacted}" style="--dip-distance:${g.distance}px;--original-color:${color(original)};--result-color:${color(tip)}">
    <svg viewBox="0 0 280 245" class="litmus-svg" role="img" aria-label="${snapshot.paper ? paperName(snapshot.paper) : '尚未選擇'}石蕊試紙：${litmusMessage(snapshot)}">
      <text x="49" y="16" text-anchor="middle" class="diagram-label">原色對照</text>
      <rect x="40" y="${g.paperY}" width="18" height="72" rx="2" class="strip-reference paper-${original}"/>
      <text x="49" y="116" text-anchor="middle" class="diagram-label">${snapshot.paper ? paperName(snapshot.paper) : '未選擇'}</text>
      <text x="186" y="16" text-anchor="middle" class="diagram-label">本次紙條</text>
      <path d="M120 132v88q0 10 12 10h100q12 0 12-10v-88" class="vessel"/>
      <path d="M125 ${g.liquidY}h114v54q0 5-8 5h-98q-8 0-8-5z" class="sample-liquid"/>
      <line x1="125" y1="${g.liquidY}" x2="239" y2="${g.liquidY}" class="liquid-surface"/>
      <g class="moving-strip">
        <rect x="177" y="${g.paperY}" width="18" height="${g.bodyHeight + g.tipHeight}" rx="2" class="strip-body paper-${original}"/>
        <rect x="177" y="${g.paperY + g.bodyHeight}" width="18" height="${g.tipHeight}" class="strip-tip paper-${tip}"/>
        <path d="M177 ${g.paperY + g.bodyHeight}h18" class="strip-divider"/>
      </g>
      <text x="182" y="216" text-anchor="middle" class="diagram-label liquid-name">${liquidName}</text>
    </svg>
  </div>`;
}
