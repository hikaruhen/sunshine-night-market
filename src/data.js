export const stages = [
 {name:'細菌不要來',subject:'生物',icon:'🥛',tip:'開封、泡發後，是否必須冷藏可能不同。依保存條件判斷；低溫能減緩細菌繁殖，不保證滅菌！',questions:[
 {name:'未開封保久乳',art:'milk-sealed',condition:'包裝完整、未開封；產品標示「可常溫保存」。',answer:'room-ok',hint:'這盒保久乳不必冷藏也可依標示保存。選「可常溫保存」；這不代表放冰箱就是錯誤。'},
 {name:'已開封保久乳',art:'milk-open',condition:'剛打開瓶蓋、尚未喝完；標示「開封後需冷藏」。',answer:'required',hint:'開封後，原本可常溫保存的條件已改變；依這盒產品標示，必須冷藏。'},
 {name:'未開封乾香菇',art:'mushroom-dry',condition:'香菇乾燥、密封袋完整；標示「存放陰涼乾燥處」。',answer:'room-ok',hint:'這袋乾香菇依標示可存放陰涼乾燥處，沒有必須冷藏的條件；不是判斷能不能放冰箱。'},
 {name:'泡發後香菇',art:'mushroom-soaked',condition:'已泡水、瀝乾放入備料盒；暫不烹調，預計稍後使用。',answer:'required',hint:'泡發後含水量增加，這份暫不烹調的香菇需要冷藏，並儘快烹調。'},
 {name:'切開的西瓜',art:'watermelon-cut',condition:'已切成數片，切面覆蓋保鮮膜；暫不食用。',answer:'required',hint:'這份切片西瓜暫不食用，需要冷藏並儘快食用；覆膜不等於滅菌。'}
 ].map(q=>({...q,first:5,retry:3}))},
 {name:'槓桿大力士',subject:'物理',icon:'📦',tip:'移動支點，比較兩邊力矩。相等是平衡，也能通過挑戰；施力力矩較大才會抬起貨箱。',questions:[
 {mass:12,force:6,length:6,first:5,retry:3}, {mass:18,force:6,length:8,first:10,retry:5}, {mass:10,force:6,length:8,first:10,retry:5}]},
 {name:'酸鹼神探',subject:'化學',icon:'🧪',tip:'藍試紙遇酸變紅；紅試紙遇鹼變藍。單張沒變色，還需要另一張幫忙！',questions:[
 {name:'檸檬汁',answer:'acid',hint:'藍色石蕊試紙遇酸會變紅。',first:5,retry:3}, {name:'小蘇打水溶液',answer:'base',hint:'小蘇打水溶液是弱鹼性，紅試紙會變藍。',first:10,retry:5}, {name:'純水',answer:'neutral',hint:'一般教學條件下視為中性，紅藍試紙都不變色。',first:10,retry:5}]},
 {name:'太陽系神射手',subject:'地球科學',icon:'🪐',tip:'水星離太陽最近；木星最大；土星的環最顯著。其他巨行星也有環喔！',questions:[
 {name:'哪顆行星距離太陽最近？',answer:'水星',choices:['水星','金星','地球','火星'],hint:'水星是太陽的近鄰。',first:5,retry:3}, {name:'太陽系最大的行星是哪顆？',answer:'木星',choices:['海王星','地球','木星','火星'],hint:'木星是太陽系最大的行星。',first:10,retry:5}, {name:'哪顆行星有最顯著的行星環？',answer:'土星',choices:['金星','土星','天王星','水星'],hint:'土星的環最容易辨識，其他巨行星也有環。',first:10,retry:5}]}
];
export const practice = {mass:12,force:6,length:6};
export function torque(q,pivot) { return {effort:q.force*(q.length-pivot),resistance:q.mass*pivot,effortArm:q.length-pivot,resistanceArm:pivot}; }
export function lifts(q,pivot) {const t=torque(q,pivot);return t.effort>t.resistance;}
export function leverOutcome(q,pivot) {const t=torque(q,pivot);return t.effort===t.resistance?'balance':t.effort>t.resistance?'lift':'insufficient';}
export function leverPasses(q,pivot) {return leverOutcome(q,pivot)!=='insufficient';}
export function litmus(property,paper) {return property==='acid'?'red':property==='base'?'blue':paper;}
export function medal(score) {return score>=95?{name:'陽光科學王者',symbol:'👑',tier:'king'}:score>=80?{name:'陽光科學高手',symbol:'🌟',tier:'expert'}:score>=60?{name:'陽光科學達人',symbol:'☀️',tier:'master'}:{name:'陽光科學學徒',symbol:'🌱',tier:'learner'};}
