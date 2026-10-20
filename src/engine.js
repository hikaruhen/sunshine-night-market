import {stages,practice,lifts} from './data.js';
export class Game {
 constructor(now=()=>Date.now()){this.now=now;this.reset();}
 reset(){this.stage=-1;this.score=0;this.phase='home';this.records=stages.map(s=>s.questions.map(()=>({status:'unanswered',attempts:0,points:0})));this.deadline=0;this.unlock=0;this.pivot=3;this.practicing=false;this.selected=null;this.observations={};this.feedback='';}
 start(){this.reset();this.enter(0,this.now());}
 enter(stage,time){this.stage=stage;this.selected=null;this.observations={};this.feedback='';this.pivot=3;this.question=0;if(stage===4){this.phase='result';return;}this.phase='tutorial';this.practicing=stage===1;this.deadline=time+stages[stage].seconds*1000;this.unlock=time+stages[stage].tutorial*1000;}
 tick(){const now=this.now();while(this.stage>=0&&this.stage<4&&now>=this.deadline){for(const r of this.records[this.stage])if(r.status!=='completed')r.status='timeout';this.enter(this.stage+1,this.deadline);}if(this.phase==='tutorial'&&now>=this.unlock)this.phase='play';if(this.phase==='feedback'&&now>=this.unlock){this.question++;this.selected=null;this.observations={};this.feedback='';this.pivot=3;if(this.question>=stages[this.stage].questions.length)this.enter(this.stage+1,now);else this.phase='play';}return this.phase;}
 get remaining(){return this.stage<0||this.stage>=4?0:Math.max(0,Math.ceil((this.deadline-this.now())/1000));}
 get current(){return this.practicing?practice:stages[this.stage]?.questions[this.question];}
 move(delta){this.tick();if(this.phase==='play'&&this.stage===1)this.pivot=Math.max(1,Math.min(this.current.length-1,this.pivot+delta));}
 select(paper){this.tick();if(this.phase==='play'&&this.stage===2&&['red','blue'].includes(paper))this.selected=paper;}
 answer(value){const stage=this.stage,question=this.question;this.tick();if(this.phase!=='play'||stage!==this.stage||question!==this.question)return false;const q=this.current;const correct=this.stage===1?lifts(q,this.pivot):value===q.answer;if(this.practicing){if(correct){this.practicing=false;this.pivot=3;this.feedback='練習成功！現在開始正式挑戰。';}else this.feedback='把支點往左移，讓施力力矩大於抗力力矩！';return correct;}
 const r=this.records[this.stage][this.question];if(r.status==='completed')return false;r.attempts++;if(!correct){r.status='wrong';this.feedback=this.stage===1?'力矩還不夠：相等是平衡，必須大於才能撬起。把支點往左移！':q.hint;return false;}r.points=r.attempts===1?q.first:q.retry;r.status='completed';this.score+=r.points;this.phase='feedback';this.feedback=`答對了！＋${r.points} 分`;this.unlock=this.now()+750;return true;}
}
