// The four saves belong to Olivia. All prices and travel times are demo fixtures.
const common = { ownerId: 'olivia', placeId: 'nonna', savedArea: 'Sydney', savedAt: '2026-11-12T19:30:00+11:00' };
export const saves = Object.fromEntries([
  { id:'message', app:'Messages', kind:'note', title:'Jordan', text:'Get the margherita. Thin crust, worth the queue.', photo:'pizza.jpg', screen:'messages.png' },
  { id:'pin', app:'Maps', kind:'map', title:'Nonna’s Slice', text:'Crown St, Surry Hills', walk:3, closes:'22:00', price:24, photo:'map.png', screen:'maps.png' },
  { id:'review', app:'Safari', kind:'content', title:'Best Slice in Surry Hills', text:'Thin, blistered crust and a margherita that sells out early. Expect a short queue after work.', photo:'dining.jpg', screen:'article.png' },
  { id:'post', app:'Photos', kind:'image', title:'Margherita at Nonna’s', text:'Jordan’s saved shot', photo:'pizza.jpg', screen:'photos.png' },
].map(s => [s.id,{...common,...s}]));
export const chunks = Object.fromEntries(Object.values(saves).map(s => [s.id,{saveId:s.id,variant:s.kind,route:['map','note'].includes(s.kind)?'app':'source'}]));
export const context = {place:'Surry Hills', time:'15:20', app:'Maps', intent:'Eat'};
const recipes = [
  {id:'pick',title:'Jordan’s Pizza Pick', lead:'Jordan’s',tail:'Pizza Pick', keys:['message','pin','post','review'], hero:'post', prompt:'Jordan’s pick', match:/친구|추천|메뉴|마르게리타|jordan|recommend|order|margherita/i},
  {id:'walk',title:'A Short Walk Away',lead:'A Short',tail:'Walk Away',keys:['pin','message','post'],hero:'pin',prompt:'From here',match:/거리|길|지도|위치|가까|가는|얼마나|walk|direction|near|where|map/i},
  {id:'visit',title:'Inside Nonna’s Slice',lead:'Inside',tail:'Nonna’s Slice',keys:['review','post','pin'],hero:'review',prompt:'From your saves',match:/리뷰|분위기|사진|후기|내부|review|photo|inside|look/i},
];
export function propose(query='') {
  const matches = recipes.filter(r=>r.match.test(query));
  if(query && !matches.length) return [];
  return [...matches,...recipes.filter(r=>!matches.includes(r))].map(r=>({...r, items:r.keys.map(k=>saves[chunks[k].saveId])}));
}
