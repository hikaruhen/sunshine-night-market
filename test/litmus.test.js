import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LitmusExperiment, LITMUS_GEOMETRY, litmusMessage } from '../src/litmus.js';
import { Game } from '../src/engine.js';

const cases = [
  ['acid', 'red', 'red', 0], ['acid', 'blue', 'red', 0],
  ['base', 'red', 'blue', 1], ['base', 'blue', 'blue', 1],
  ['neutral', 'red', 'red', 2], ['neutral', 'blue', 'blue', 2],
];

for (const [property, paper, result] of cases) test(`visible litmus order ${property}/${paper}: original, contact, result`, () => {
  let now = 0;
  const experiment = new LitmusExperiment(() => now);
  experiment.select(paper);
  assert.equal(experiment.snapshot().phase, 'ready');
  assert.equal(experiment.snapshot().tip, paper);
  experiment.start(property);
  for (const [time, phase] of [[0, 'lowering'], [799, 'lowering'], [800, 'contact'], [1099, 'contact'], [1100, 'developing'], [1699, 'developing'], [1700, 'raising'], [2299, 'raising'], [2300, 'result']]) {
    now = time;
    const snapshot = experiment.snapshot();
    assert.equal(snapshot.phase, phase);
    assert.equal(snapshot.contacted, time >= 800);
    assert.equal(snapshot.tip, time < 1100 ? paper : result);
    assert.equal(snapshot.paper, paper);
    assert.equal(snapshot.busy, time < 2300);
  }
  if (result === paper) assert.match(litmusMessage(experiment.snapshot()), /維持.*色，未變色/);
  else assert.match(litmusMessage(experiment.snapshot()), /浸入區變成/);
});

for (const [property, paper, result, question] of cases) test(`atomic sample lock ${property}/${paper}, observations never score`, () => {
  let now = 0;
  const game = new Game(() => now);
  game.start(); game.enter(2); game.begin(); game.question = question;
  assert.equal(game.select(paper), true);
  assert.equal(game.dip(), true);
  assert.equal(game.select(paper === 'red' ? 'blue' : 'red'), false);
  assert.equal(game.selected, paper);
  assert.equal(game.dip(), false);
  assert.equal(game.answer(game.current.answer), false);
  assert.equal(game.next(), false);
  assert.equal(game.score, 0);
  assert.equal(game.records[2][question].attempts, 0);
  now = 1099; game.tick(); assert.deepEqual(game.observations, {});
  assert.equal(game.experiment.snapshot().tip, paper);
  now = 1100; game.tick(); assert.equal(game.experiment.snapshot().tip, result);
  assert.equal(game.answer(game.current.answer), false);
  now = 2300; game.tick();
  assert.equal(game.observations[paper], result);
  assert.equal(game.score, 0);
  const points = game.current.first;
  assert.equal(game.answer(game.current.answer), true);
  assert.equal(game.score, points);
  now += 750; game.next();
  assert.equal(game.experiment.sample, null);
  assert.equal(game.selected, null);
  assert.deepEqual(game.observations, {});
});

test('wet tip starts exactly at the liquid surface; original comparison stays outside', () => {
  const g = LITMUS_GEOMETRY;
  assert.equal(g.paperY + g.bodyHeight + g.distance, g.liquidY);
  assert.ok(g.paperY + g.bodyHeight + g.tipHeight < g.liquidY);
});

test('each repeated test starts clean, including after a changed sample', () => {
  let now = 0;
  const game = new Game(() => now);
  game.start(); game.enter(2); game.begin(); game.select('blue'); game.dip();
  now = 2300; game.tick(); assert.equal(game.experiment.snapshot().tip, 'red');
  assert.equal(game.dip(), true); assert.equal(game.experiment.snapshot().tip, 'blue');
  now += 2300; game.tick();
  game.select('red'); assert.equal(game.experiment.snapshot().phase, 'ready');
  assert.equal(game.experiment.snapshot().tip, 'red');
  assert.match(game.feedback, /乾淨的紅色.*尚未浸入/);
  game.dip(); now += 2300; game.tick();
  assert.deepEqual(game.observations, { blue: 'red', red: 'red' });
  assert.equal(game.score, 0); assert.equal(game.records[2][0].attempts, 0);
});

test('stage transition and restart discard a pending sample with no late write', () => {
  let now = 0;
  const game = new Game(() => now);
  game.start(); game.enter(2); game.begin(); game.select('blue'); game.dip();
  const oldExperiment = game.experiment;
  now = 1000; game.enter(3); now = 100000; game.tick();
  assert.deepEqual(game.observations, {}); assert.equal(game.experiment.sample, null);
  game.enter(2); game.begin(); game.select('red'); game.dip();
  game.start(); now += 100000; game.tick();
  assert.equal(game.stage, 0); assert.equal(game.score, 0); assert.equal(game.selected, null);
  assert.deepEqual(game.observations, {}); assert.equal(game.experiment.sample, null);
  assert.notEqual(game.experiment, oldExperiment);
});

test('unselected or invalid samples cannot start; changed and unchanged results remain explicit', () => {
  const experiment = new LitmusExperiment(() => 0);
  assert.equal(experiment.start('acid'), false);
  assert.equal(experiment.select('purple'), false);
  experiment.select('red'); assert.equal(experiment.start('unknown'), false);
  assert.match(litmusMessage(experiment.snapshot()), /乾淨的紅色.*尚未浸入/);
});
