// Local vector drawings distinguish food and packaging state without emoji.
const mushroom = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-6 0h12l5 25h-22z" fill="#e5d4b5"/><path d="M-27 4c0-36 54-36 54 0z" fill="#825237"/><path d="M-14-9l9-7m11 1 9 7" stroke="#e1b785" stroke-width="4" stroke-linecap="round"/></g>`;
const label = text => `<text x="120" y="163" text-anchor="middle" font-size="15" font-family="sans-serif" font-weight="700" fill="#3b4145">${text}</text>`;
function milk(open) {
  return `<path d="M77 50l20-23h56l17 23v89H77z" fill="#fffdf1" stroke="#637f89" stroke-width="3"/><path d="M77 50h93v37H77z" fill="#9acbd2"/><path d="M97 27v23h73" fill="none" stroke="#637f89" stroke-width="3"/><text x="123" y="74" text-anchor="middle" font-size="16" fill="#253b53">保久乳</text><text x="123" y="111" text-anchor="middle" font-size="14" fill="#4b635b">${open ? '開封後' : '未開封'}</text><text x="123" y="129" text-anchor="middle" font-size="14" fill="#4b635b">${open ? '需冷藏' : '可常溫'}</text>${open ? '<ellipse cx="149" cy="39" rx="10" ry="5" fill="#3b6074"/><g transform="translate(183 28) rotate(20)"><rect x="-11" y="-4" width="22" height="9" rx="3" fill="#df9a63"/></g><path d="M174 34l8-4" stroke="#7d6b53" stroke-width="2"/>' : '<rect x="139" y="30" width="20" height="9" rx="3" fill="#df9a63" stroke="#9b7048"/>'}${label(open ? '瓶蓋打開・已開封' : '瓶蓋封好・包裝完整')}`;
}
const drawings = {
  'milk-sealed': milk(false),
  'milk-open': milk(true),
  'mushroom-dry': `<rect x="59" y="21" width="122" height="119" rx="12" fill="#eee1ba" stroke="#8d815b" stroke-width="3"/><path d="M61 35h118m-118 7h118" stroke="#8d815b" stroke-width="3"/><rect x="72" y="54" width="96" height="64" rx="8" fill="#fff8e5"/>${mushroom(101, 82, .68)}${mushroom(140, 87, .65)}<text x="120" y="133" text-anchor="middle" font-size="14" fill="#4c4739">乾香菇・密封</text>${label('乾燥・未開封袋裝')}`,
  'mushroom-soaked': `<path d="M47 72h146l-13 68H60z" fill="#d9e9de" stroke="#678a7c" stroke-width="3"/>${mushroom(92, 87, .85)}${mushroom(146, 82, .9)}<path d="M57 112h128" stroke="#a0c2b7" stroke-width="4"/><path d="M68 34q-10 14 0 18q10-4 0-18M171 35q-10 14 0 18q10-4 0-18" fill="#77b5cc"/>${label('泡發、瀝乾・備料盒')}`,
  'watermelon-cut': `<ellipse cx="120" cy="132" rx="94" ry="16" fill="#e5d6b3"/><g stroke-linejoin="round"><path d="M45 111L113 36l50 87q-65 28-118-12z" fill="#83ac70" stroke="#537e52" stroke-width="5"/><path d="M53 106l59-61 42 72q-55 21-101-11z" fill="#e97972" stroke="#f6e2ab" stroke-width="4"/><path d="M119 112l40-58 42 65q-40 16-82-7z" fill="#eb8b7e" stroke="#6d9b5b" stroke-width="5"/></g><g fill="#553b37"><ellipse cx="106" cy="76" rx="2" ry="4"/><ellipse cx="89" cy="101" rx="2" ry="4"/><ellipse cx="129" cy="104" rx="2" ry="4"/><ellipse cx="160" cy="91" rx="2" ry="4"/></g><path d="M40 50l143-12 28 91-163 14z" fill="#fff" fill-opacity=".15" stroke="#abc3ca" stroke-width="2"/><path d="M49 67l132-15M68 136l132-20" stroke="#fff" stroke-width="3" opacity=".8"/>${label('切片・覆蓋保鮮膜')}`
};
export function foodArt(q) {
  return `<svg class="food-art" viewBox="0 0 240 180" role="img" aria-label="${q.name}：${q.condition}"><title>${q.name}</title>${drawings[q.art]}</svg>`;
}
