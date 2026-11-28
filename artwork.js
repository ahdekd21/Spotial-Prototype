// The layers are indexed in paint order in the two supplied 440 × 956 exports.
// Keep the original vector outlines, masks and filters together with their defs.
import {context} from './pizza.js';

const templates = new Map();
const layouts = {
  feed: { card: 8, handles: [10], chips: [11, 25], title: 37, stack: [1, 2, 3] },
  summary: { card: 31, handles: [5, 6], chips: [7, 21], title: 25, stack: [2] },
};
function asset(original, keep, crop, omitTitle, layout, liveKey) {
  const svg = original.cloneNode(true);
  const group = svg.firstElementChild;
  if (omitTitle) [...group.children[layout.card].children].slice(3).forEach(child=>child.remove());
  [...group.children].forEach((child, index) => { if (!keep(index)) child.remove(); });
  svg.setAttribute('viewBox', crop.join(' '));
  svg.setAttribute('width', crop[2]);
  svg.setAttribute('height', crop[3]);
  if (liveKey) templates.set(liveKey, svg);
  return URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], {type:'image/svg+xml'}));
}
// Each exported filter uses local fragment IDs. Shadow roots keep those IDs
// local and let SVG foreignObject backdrop filters composite in the browser.
export function mountVectors() {
  if (!templates.size) return;
  for (const [key,svg] of templates) {
    const base=key.endsWith('base');
    const parent=document.querySelector(base?'#layer':'.card[data-recipe="pick"]');
    if (!parent || parent.querySelector('.'+key)) continue;
    const host=document.createElement('div');
    host.className='live-vector '+key;
    host.setAttribute('aria-hidden','true');
    const root=host.attachShadow({mode:'open'});
    const copy=document.importNode(svg,true);
    copy.style.cssText='display:block;width:100%;height:100%';
    root.append(copy);
    parent.prepend(host);
  }
}
function mapsLabels(svg, depth, layout) {
  const copy=svg.cloneNode(true), g=copy.firstElementChild;
  const start=layout.chips[0];
  for (const [node,x,y,value,color,size] of [
    [g.children[start+3],159,122,context.place,'black',16],
    [g.children[start+5],254,122,context.time,'white',17],
    [g.children[start+8].lastElementChild,83,176,context.app,'white',17],
  ]) {
    const label=copy.ownerDocument.createElementNS(svg.namespaceURI,'text');
    Object.entries({x,y,fill:color,'font-family':'Arial,sans-serif','font-weight':'600','font-size':size,'text-anchor':'middle'}).forEach(([k,v])=>label.setAttribute(k,v));
    label.textContent=value;node.replaceWith(label);
  }
  return copy;
}
export async function prepareArtwork() {
  const style = document.getElementById('device').style;
  await Promise.all(Object.entries(layouts).map(async ([depth, layout]) => {
    const response = await fetch('./assets/'+depth+'-reference.svg');
    if (!response.ok) throw new Error('Missing '+depth+' artwork');
    const svg = new DOMParser().parseFromString(await response.text(),'image/svg+xml').documentElement;
    const card = i => i === layout.card || layout.handles.includes(i);
    const chips = i => i >= layout.chips[0] && i <= layout.chips[1];
    const screen = [0,0,440,956];
    const face = [0,190,440,650];
    const layers = {
      base: asset(svg,i=>!card(i)&&!chips(i),screen,false,layout,depth+'-base'),
      chips: asset(svg,chips,screen,false,layout),
      maps: asset(mapsLabels(svg,depth,layout),chips,screen,false,layout),
      face: asset(svg,card,face,false,layout,depth+'-face'),
      alternate: asset(svg,card,face,true,layout),
    };
    for (const [name,url] of Object.entries(layers)) style.setProperty('--'+depth+'-'+name,'url("'+url+'")');
  }));
  mountVectors();
  document.getElementById('device').classList.add('illustrated');
}
