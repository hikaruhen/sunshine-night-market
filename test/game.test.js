import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/engine.js';
import { stages, practice, torque, lifts, leverOutcome, leverPasses, litmus, medal } from '../src/data.js';
import { foodArt } from '../src/food-art.js';

function setup() {
  let time = 0;
  const g = new Game(() => time);
  return { g, advance(ms) { time += ms; g.tick(); } };
}
function ready(s) {
  s.g.begin();
  if (s.g.practicing) {
    s.g.move(-1);
    assert.equal(s.g.answer(), true);
    assert.equal(s.g.outcome, 'balance');
    s.advance(1200);
    s.g.next();
  }
}
function solve(s, retry = false) {
  const g = s.g;
  if (retry) {
    if (g.stage === 1) { g.pivot = g.current.length - 1; g.answer(); }
    else g.answer('wrong');
    assert.equal(g.records[g.stage][g.question].points, 0);
  }
  if (g.stage === 1) { g.pivot = 1; g.answer(); }
  else g.answer(g.current.answer);
}

function permutations(values) {
  return values.length ? values.flatMap(v => permutations(values.filter(x => x !== v)).map(rest => [v, ...rest])) : [[]];
}
for (const order of permutations([0, 1, 2, 3])) test(`free choice ${order.join(',')} completes all stalls once for 100 points`, () => {
  const s = setup(); s.g.start();
  assert.equal(s.g.phase, 'market');
  assert.equal(s.g.choose(-1), false);
  assert.equal(s.g.choose(4), false);
  for (const stage of order) {
    assert.equal(s.g.choose(stage), true);
    assert.equal(s.g.choose(stage), false);
    ready(s);
    for (const q of stages[stage].questions) { solve(s); s.advance(1200); s.g.next(); }
    assert.equal(s.g.completed[stage], true);
    assert.equal(s.g.choose(stage), false);
  }
  assert.equal(s.g.phase, 'result'); assert.equal(s.g.score, 100);
  s.g.start(); assert.equal(s.g.phase, 'market'); assert.equal(s.g.score, 0);
  assert.deepEqual(s.g.completed, [false, false, false, false]);
});

test('returning to menu preserves earned points and resumes at first unanswered question', () => {
  const s = setup(); s.g.start(); s.g.choose(0); s.g.begin(); solve(s);
  assert.equal(s.g.market(), false);
  s.advance(1200); assert.equal(s.g.market(), true); assert.equal(s.g.score, 5);
  s.g.choose(2); s.g.begin(); s.g.select('blue'); s.g.dip();
  assert.equal(s.g.market(), false);
  s.advance(2400); assert.equal(s.g.market(), true);
  s.g.choose(0); assert.equal(s.g.question, 1); s.g.begin(); solve(s); assert.equal(s.g.score, 10);
});

for (const retry of [false, true]) test(`four stages ${retry ? 'retry' : 'first'} scoring, duplicate locks and reset`, () => {
  const s = setup(); s.g.start(); s.g.choose(0);
  for (let stage = 0; stage < 4; stage++) {
    if (stage) assert.equal(s.g.choose(stage), true);
    ready(s);
    for (let i = 0; i < stages[stage].questions.length; i++) {
      solve(s, retry);
      const score = s.g.score;
      for (let n = 0; n < 10; n++) assert.equal(s.g.answer(s.g.current.answer), false);
      assert.equal(s.g.score, score);
      s.advance(1200);
      s.g.next();
    }
    assert.equal(s.g.records[stage].reduce((n, r) => n + r.points, 0), retry ? (stage === 0 ? 15 : 13) : 25);
  }
  assert.equal(s.g.phase, 'result');
  assert.equal(s.g.score, retry ? 54 : 100);
  s.g.start(); s.g.choose(0);
  assert.equal(s.g.stage, 0); assert.equal(s.g.phase, 'tutorial'); assert.equal(s.g.score, 0);
  assert.equal(s.g.outcome, null); assert.equal(s.g.selected, null);
  assert.deepEqual(s.g.observations, {});
  assert.ok(s.g.records.flat().every(r => r.status === 'unanswered' && r.attempts === 0 && r.points === 0));
});

test('24 hours idle in every tutorial and active stage never times out or changes score', () => {
  const s = setup(); s.g.start(); s.g.choose(0);
  for (let stage = 0; stage < 4; stage++) {
    if (stage) assert.equal(s.g.choose(stage), true);
    s.advance(86400000);
    assert.equal(s.g.phase, 'tutorial'); assert.equal(s.g.stage, stage);
    ready(s);
    s.advance(86400000);
    assert.equal(s.g.phase, 'play'); assert.equal(s.g.question, 0); assert.equal(s.g.stage, stage);
    for (let i = 0; i < stages[stage].questions.length; i++) { solve(s); s.advance(1200); s.g.next(); }
  }
  assert.equal(s.g.score, 100);
});

test('old 45/70/55/55 boundaries cannot advance unanswered questions', () => {
  const s = setup(); s.g.start(); s.g.choose(0); s.g.begin();
  for (const ms of [45000, 70000, 55000, 55000, 1000000]) s.advance(ms);
  assert.equal(s.g.stage, 0); assert.equal(s.g.question, 0); assert.equal(s.g.score, 0);
  assert.equal(s.g.answer('room-ok'), true); assert.equal(s.g.score, 5);
  s.advance(750); assert.equal(s.g.question, 0); s.g.next(); assert.equal(s.g.question, 1);
});

test('no answering before explicit tutorial start; queued animation click cannot answer next question', () => {
  const s = setup(); s.g.start(); s.g.choose(0);
  assert.equal(s.g.answer('room-ok'), false);
  s.g.begin(); solve(s);
  // Clock advances without a render tick. Old feedback click must still be rejected.
  let time = 0; const g = new Game(() => time); g.start(); g.choose(0); g.begin(); g.answer('room-ok'); time = 750;
  assert.equal(g.answer('required'), false); assert.equal(g.question, 0); assert.equal(g.score, 5);
  g.next(); assert.equal(g.question, 1);
});

for (const [i, q] of [practice, ...stages[1].questions].entries()) test(`lever ${i}: all positions, integer balance and lift solutions`, () => {
  let balances = 0, liftPositions = 0, failures = 0;
  for (let p = 1; p < q.length; p++) {
    const t = torque(q, p);
    assert.equal(t.effortArm + t.resistanceArm, q.length);
    assert.equal(t.effort, q.force * (q.length - p)); assert.equal(t.resistance, q.mass * p);
    assert.equal(leverPasses(q, p), t.effort >= t.resistance);
    assert.equal(lifts(q, p), t.effort > t.resistance);
    balances += Number(leverOutcome(q, p) === 'balance');
    liftPositions += Number(lifts(q, p)); failures += Number(!leverPasses(q, p));
  }
  assert.ok(balances > 0 && liftPositions > 0 && failures > 0);
});

test('practice feedback retains pivot, equality passes without lifting and gives zero points', () => {
  const s = setup(); s.g.start(); s.g.choose(0); s.g.enter(1); s.g.begin();
  assert.equal(s.g.answer(), false); assert.equal(s.g.outcome, 'insufficient');
  s.g.move(-1); assert.equal(s.g.pivot, 2); assert.equal(s.g.answer(), true);
  assert.equal(s.g.phase, 'practice-feedback'); assert.equal(s.g.pivot, 2);
  assert.equal(s.g.outcome, 'balance'); assert.match(s.g.feedback, /力矩平衡/);
  assert.doesNotMatch(s.g.feedback, /貨箱抬起/); assert.equal(s.g.score, 0);
  s.g.move(-1); assert.equal(s.g.pivot, 2); assert.equal(s.g.answer(), false);
  s.advance(1200); assert.equal(s.g.practicing, true); s.g.next(); assert.equal(s.g.practicing, false); assert.equal(s.g.question, 0); assert.equal(s.g.pivot, 3);
});

test('formal equality succeeds with correct score; insufficient attempts give repeatable reactions and retry score', () => {
  const s = setup(); s.g.start(); s.g.choose(0); s.g.enter(1); ready(s);
  assert.equal(s.g.answer(), false); const reaction = s.g.reaction;
  assert.equal(s.g.answer(), false); assert.equal(s.g.reaction, reaction + 1); assert.equal(s.g.score, 0);
  s.g.move(-1); assert.equal(s.g.answer(), true);
  assert.equal(s.g.outcome, 'balance'); assert.equal(s.g.score, 3);
  assert.match(s.g.feedback, /力矩平衡/); assert.doesNotMatch(s.g.feedback, /貨箱抬起/);
});

test('pivot clamps using each question length and larger effort visibly lifts', () => {
  const s = setup(); s.g.start(); s.g.choose(0); s.g.enter(1); ready(s);
  for (let i = 0; i < 20; i++) s.g.move(-1);
  assert.equal(s.g.pivot, 1); s.g.answer(); assert.equal(s.g.outcome, 'lift'); assert.match(s.g.feedback, /貨箱抬起/);
  s.advance(1200); s.g.next(); assert.equal(s.g.current.length, 8);
  for (let i = 0; i < 20; i++) s.g.move(1);
  assert.equal(s.g.pivot, 7);
});

for (const [property, paper, expected] of [['acid', 'red', 'red'], ['acid', 'blue', 'red'], ['base', 'red', 'blue'], ['base', 'blue', 'blue'], ['neutral', 'red', 'red'], ['neutral', 'blue', 'blue']]) test(`litmus ${property}/${paper}`, () => assert.equal(litmus(property, paper), expected));
for (const [score, tier] of [[0, 'learner'], [59, 'learner'], [60, 'master'], [79, 'master'], [80, 'expert'], [94, 'expert'], [95, 'king'], [100, 'king']]) test(`medal boundary ${score}`, () => {
  assert.equal(medal(score).tier, tier); assert.equal(score >= 60, tier !== 'learner');
});
test('new food bank contrasts sealed/opened and dry/soaked with five distinct labeled SVGs', () => {
  assert.deepEqual(stages[0].questions.map(q => q.answer), ['room-ok', 'required', 'room-ok', 'required', 'required']);
  const drawings = stages[0].questions.map(q => foodArt(q));
  assert.equal(new Set(drawings).size, 5);
  for (const [i, q] of stages[0].questions.entries()) {
    assert.ok(q.condition.length > 15); assert.match(drawings[i], /<svg/); assert.match(drawings[i], /<title>/);
    assert.ok(drawings[i].includes(q.name)); assert.doesNotMatch(drawings[i], /undefined|https?:/);
  }
});
test('planet bank unique choices and each stage maximum is 25', () => {
  assert.deepEqual(stages[3].questions.map(q => q.answer), ['水星', '木星', '土星']);
  for (const q of stages[3].questions) { assert.equal(new Set(q.choices).size, 4); assert.ok(q.choices.includes(q.answer)); }
  for (const s of stages) assert.equal(s.questions.reduce((sum, q) => sum + q.first, 0), 25);
});

test('accepted feedback waits indefinitely for next and early/double next cannot skip questions', () => {
  const s = setup(); s.g.start(); s.g.choose(0); s.g.begin(); s.g.answer('room-ok');
  assert.equal(s.g.next(), false); assert.equal(s.g.question, 0);
  s.advance(86400000); assert.equal(s.g.phase, 'feedback'); assert.equal(s.g.question, 0);
  assert.equal(s.g.next(), true); assert.equal(s.g.question, 1);
  assert.equal(s.g.next(), false); assert.equal(s.g.question, 1);
});

for (const stage of [0, 1, 2, 3]) test(`stage ${stage + 1} repeated wrong answers stay actionable and clear after retry/next`, () => {
  const s = setup(); s.g.start(); s.g.choose(0); s.g.enter(stage); ready(s);
  const wrong = ['required', 'lift', 'base', '金星'][stage];
  if (stage === 1) s.g.pivot = s.g.current.length - 1;
  const reaction = s.g.reaction;
  for (let i = 1; i <= 2; i++) {
    assert.equal(s.g.answer(wrong), false);
    assert.equal(s.g.answerState, 'wrong'); assert.equal(s.g.lastAnswer, wrong);
    assert.equal(s.g.reaction, reaction + i); assert.equal(s.g.records[stage][0].attempts, i);
    assert.equal(s.g.phase, 'play'); assert.equal(s.g.score, 0); assert.equal(s.g.question, 0);
    assert.equal(s.g.canContinue, false);
  }
  if (stage === 1) { s.g.move(-20); assert.equal(s.g.answerState, null); }
  const correct = stage === 1 ? 'lift' : s.g.current.answer;
  assert.equal(s.g.answer(correct), true);
  assert.equal(s.g.answerState, 'correct'); assert.equal(s.g.lastAnswer, correct);
  assert.equal(s.g.score, 3);
  s.advance(1200); assert.equal(s.g.next(), true);
  assert.equal(s.g.answerState, null); assert.equal(s.g.lastAnswer, null);
  s.g.start(); s.g.choose(0); assert.equal(s.g.answerState, null); assert.equal(s.g.lastAnswer, null);
});

test('practice failures have distinct attempt counts, remain unscored and reset before formal challenge', () => {
  const s = setup(); s.g.start(); s.g.choose(0); s.g.enter(1); s.g.begin();
  s.g.answer('lift'); s.g.answer('lift');
  assert.equal(s.g.practiceAttempts, 2); assert.equal(s.g.answerState, 'wrong');
  assert.equal(s.g.score, 0); assert.equal(s.g.phase, 'play');
  s.g.move(-1); assert.equal(s.g.answerState, null);
  s.g.answer('lift'); assert.equal(s.g.answerState, 'correct');
  s.advance(1200); s.g.next();
  assert.equal(s.g.answerState, null); assert.equal(s.g.lastAnswer, null);
  assert.equal(s.g.records[1][0].attempts, 0);
});
