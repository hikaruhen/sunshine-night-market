import { stages, practice, leverOutcome } from './data.js';

// The clock controls short presentation animations, never a play deadline.
export class Game {
  constructor(now = () => Date.now()) { this.now = now; this.reset(); }

  reset() {
    this.stage = -1;
    this.score = 0;
    this.phase = 'home';
    this.records = stages.map(s => s.questions.map(() => ({ status: 'unanswered', attempts: 0, points: 0 })));
    this.unlock = 0;
    this.question = 0;
    this.pivot = 3;
    this.practicing = false;
    this.selected = null;
    this.observations = {};
    this.feedback = '';
    this.outcome = null;
    this.reaction = 0;
    this.answerState = null;
    this.lastAnswer = null;
    this.practiceAttempts = 0;
    this.tutorialStarted = 0;
  }

  start() { this.reset(); this.enter(0); }

  enter(stage) {
    this.stage = stage;
    this.selected = null;
    this.observations = {};
    this.feedback = '';
    this.outcome = null;
    this.answerState = null;
    this.lastAnswer = null;
    this.practiceAttempts = 0;
    this.question = 0;
    this.practicing = stage === 1;
    this.unlock = 0;
    if (stage === stages.length) { this.phase = 'result'; return; }
    this.phase = 'tutorial';
    this.tutorialStarted = this.now();
    this.resetPivot();
  }

  begin() { if (this.phase === 'tutorial') this.phase = 'play'; }
  resetPivot() { this.pivot = Math.floor((this.current?.length ?? 6) / 2); }

  tick() {
    // Idle time and animation completion never advance a question automatically.
    return this.phase;
  }

  get canContinue() {
    return ['feedback', 'practice-feedback'].includes(this.phase) && this.now() >= this.unlock;
  }

  next() {
    if (!this.canContinue) return false;
    this.answerState = null;
    this.lastAnswer = null;
    if (this.phase === 'practice-feedback') {
      this.practicing = false;
      this.phase = 'play';
      this.outcome = null;
      this.resetPivot();
      this.feedback = '練習完成！現在是正式第 1 題。';
    } else if (this.phase === 'feedback') {
      this.question++;
      this.selected = null;
      this.observations = {};
      this.feedback = '';
      this.outcome = null;
      if (this.question === stages[this.stage].questions.length) this.enter(this.stage + 1);
      else { this.phase = 'play'; this.resetPivot(); }
    }
    return true;
  }

  get current() { return this.practicing ? practice : stages[this.stage]?.questions[this.question]; }

  move(delta) {
    this.tick();
    if (this.phase !== 'play' || this.stage !== 1) return;
    this.pivot = Math.max(1, Math.min(this.current.length - 1, this.pivot + delta));
    this.outcome = null;
    this.answerState = null;
    this.lastAnswer = null;
    this.feedback = `支點距貨箱 ${this.pivot} m。按「用力！」測試。`;
  }

  select(paper) {
    this.tick();
    if (this.phase === 'play' && this.stage === 2 && ['red', 'blue'].includes(paper)) this.selected = paper;
  }

  answer(value) {
    const stage = this.stage, question = this.question, phase = this.phase;
    this.tick();
    // Queued clicks from an animation cannot answer the following question.
    if (phase !== 'play' || this.phase !== 'play' || stage !== this.stage || question !== this.question) return false;
    const q = this.current;
    this.outcome = this.stage === 1 ? leverOutcome(q, this.pivot) : null;
    const correct = this.stage === 1 ? this.outcome !== 'insufficient' : value === q.answer;
    this.reaction++;
    this.answerState = correct ? 'correct' : 'wrong';
    this.lastAnswer = value ?? (this.stage === 1 ? 'lift' : null);
    const leverMessage = this.outcome === 'balance' ? '力矩平衡，挑戰通過！' : '施力力矩較大，貨箱抬起，挑戰通過！';
    if (this.practicing) {
      this.practiceAttempts++;
      if (correct) {
        this.phase = 'practice-feedback';
        this.unlock = this.now() + 1200;
        this.feedback = `${leverMessage}練習不計分。`;
      } else this.feedback = '施力力矩較小，還不能平衡或抬起。把支點往貨箱移動！';
      return correct;
    }
    const record = this.records[this.stage][this.question];
    if (record.status === 'completed') return false;
    record.attempts++;
    if (!correct) {
      record.status = 'wrong';
      this.feedback = this.stage === 1 ? '施力力矩較小，還不能平衡或抬起。把支點往貨箱移動！' : q.hint;
      return false;
    }
    record.points = record.attempts === 1 ? q.first : q.retry;
    record.status = 'completed';
    this.score += record.points;
    this.phase = 'feedback';
    this.unlock = this.now() + (this.stage === 1 ? 1200 : 750);
    this.feedback = `${this.stage === 1 ? leverMessage : '答對了！'}＋${record.points} 分`;
    return true;
  }
}
