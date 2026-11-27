// View models for the feed until the shared scenario data is merged.
const pizza = {
  id: 'jordan-pizza', palette: 'pizza', title: 'Jordan’s Pizza Pick', lines: ['Jordan’s', 'Pizza Pick'],
  source: 'Messages', intent: 'Eat', labels: ['Storefront', 'Margherita', 'Menu board', 'Map'],
  map: 'Map · Crown St', lead: 'Two blocks away.', distance: '3 min', fact: 'Open till 22:00.',
  keyword: 'Margherita', caption: 'is Jordan’s pick.', place: 'Nonna’s Slice', address: 'Crown St, Surry Hills',
  metric: 'Open till', value: '22:00', noteLabel: 'Your note · Jordan’s pick',
  note: '“Margherita. Stop by when nearby.”', media: 'Jordan’s photo', cta: 'Open in Maps',
};
const harbour = {
  id: 'harbour-eats', palette: 'harbour', title: 'Harbour-side Eats', lines: ['Harbour-side', 'Eats'],
  source: 'YouTube', intent: 'Eat', labels: ['Video', 'Waterfront', 'Fish & chips', 'Map'],
  map: 'Map · Circular Quay', lead: 'By the water.', distance: '12 min', fact: 'Open till 23:00.',
  keyword: 'Pier Kitchen', caption: 'from your saved video.', place: 'Pier Kitchen', address: 'Circular Quay',
  metric: 'Open till', value: '23:00', noteLabel: 'Your note', note: '“Eat by the water like they did.”',
  media: 'Scene · 03:12', cta: 'Search on YouTube',
};
const sunset = {
  id: 'harbour-sunset', palette: 'sunset', title: 'Harbour Sunset View', lines: ['The view you', 'wanted to capture'],
  source: 'Instagram', intent: 'Visit', labels: ['Saved shot', 'Golden hour', 'Opera House', 'Map'],
  map: 'Map · Harbour', lead: 'Your saved spot is close.', distance: '4 min', fact: 'Sunset 19:42.',
  keyword: 'Framing ideas', caption: 'from 3 saved shots.', place: 'Milsons Point', address: 'Kirribilli',
  metric: 'Sunset', value: '19:42', noteLabel: 'Your note', note: '“Want to be here around sunset.”',
  media: 'Framing idea', cta: 'Open Camera',
};
export const previews = {
  A: { app: 'Reminders', place: 'Crown St', time: '19:40', intent: 'Eat', cards: [{ ...pizza, lead: 'You’re here now.', distance: 'Here' }, harbour, sunset] },
  B: { app: 'Maps', place: 'Surry Hills', time: '15:20', intent: 'Eat', cards: [pizza, harbour, sunset] },
  C: { app: 'Camera', place: 'Sydney Harbour', time: '17:32', intent: 'Visit', cards: [sunset, harbour, pizza] },
};
