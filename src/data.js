export const stages = [
 {name:'細菌不要來',subject:'生物',icon:'🥛',seconds:45,tutorial:5,tip:'低溫能減緩細菌繁殖，但不能保證殺死所有細菌。依保存標示分類！',questions:[
 ['需冷藏鮮奶','🥛','cold','依產品標示冷藏'],['生雞肉','🍗','cold','容易腐敗，應低溫保存'],['切好的水果','🍉','cold','切開後需要注意低溫與衛生'],['未開封乾麵條','🍜','shelf','乾燥、包裝完整，通常可常溫保存'],['未開封常溫保存罐頭','🥫','shelf','包裝完整，標示可常溫保存']].map(([name,icon,answer,hint])=>({name,icon,answer,hint,first:5,retry:3}))},
 {name:'槓桿大力士',subject:'物理',icon:'📦',seconds:70,tutorial:8,tip:'支點靠近重物，抗力臂縮短、施力臂增長，通常越省力！',questions:[
 {mass:12,force:6,length:6,first:5,retry:3}, {mass:18,force:6,length:6,first:10,retry:5}, {mass:20,force:5,length:6,first:10,retry:5}]},
 {name:'酸鹼神探',subject:'化學',icon:'🧪',seconds:55,tutorial:6,tip:'藍試紙遇酸變紅；紅試紙遇鹼變藍。單張沒變色，還需要另一張幫忙！',questions:[
 {name:'檸檬汁',answer:'acid',hint:'藍色石蕊試紙遇酸會變紅。',first:5,retry:3}, {name:'小蘇打水溶液',answer:'base',hint:'小蘇打水溶液是弱鹼性，紅試紙會變藍。',first:10,retry:5}, {name:'純水',answer:'neutral',hint:'一般教學條件下視為中性，紅藍試紙都不變色。',first:10,retry:5}]},
 {name:'太陽系神射手',subject:'地球科學',icon:'🪐',seconds:55,tutorial:6,tip:'水星離太陽最近；木星最大；土星的環最顯著。其他巨行星也有環喔！',questions:[
 {name:'哪顆行星距離太陽最近？',answer:'水星',choices:['水星','金星','地球','火星'],hint:'水星是太陽的近鄰。',first:5,retry:3}, {name:'太陽系最大的行星是哪顆？',answer:'木星',choices:['海王星','地球','木星','火星'],hint:'木星是太陽系最大的行星。',first:10,retry:5}, {name:'哪顆行星有最顯著的行星環？',answer:'土星',choices:['金星','土星','天王星','水星'],hint:'土星的環最容易辨識，其他巨行星也有環。',first:10,retry:5}]}
];
export const practice = {mass:12,force:6,length:6};
export function torque(q,pivot) { return {effort:q.force*(q.length-pivot),resistance:q.mass*pivot,effortArm:q.length-pivot,resistanceArm:pivot}; }
export function lifts(q,pivot) {const t=torque(q,pivot);return t.effort>t.resistance;}
export function litmus(property,paper) {return property==='acid'?'red':property==='base'?'blue':paper;}
export function medal(score) {return score>=95?{name:'陽光科學王者',symbol:'👑',tier:'king'}:score>=80?{name:'陽光科學高手',symbol:'🌟',tier:'expert'}:score>=60?{name:'陽光科學達人',symbol:'☀️',tier:'master'}:{name:'陽光科學學徒',symbol:'🌱',tier:'learner'};}
