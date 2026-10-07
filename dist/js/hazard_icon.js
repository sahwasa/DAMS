// hazard-icon.js
let hazardIconMap = null;

document.body.insertAdjacentHTML('afterbegin', `
<svg style="display:none">
  <symbol id="hazard-triangle" viewBox="0 0 26 24">
    <path d="M 13 1.5 
             Q 14.5 1.5 15.3 2.9 
             L 24.6 19.3 
             Q 25.5 20.7 24.1 22.0 
             Q 23.4 22.5 22.3 22.5 
             L 3.7 22.5 
             Q 2.1 22.5 1.4 21.1 
             Q 0.7 19.7 1.4 18.5 
             L 10.7 2.9 
             Q 11.5 1.5 13 1.5 Z" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2.6" 
          stroke-linejoin="round" 
          stroke-linecap="round"/>
  </symbol>
</svg>
`);


async function loadHazardIconMap() {
  if (hazardIconMap) return hazardIconMap;
  const res = await fetch('js/data/hazard_icon_mapping.json');
  const list = await res.json();
  hazardIconMap = Object.fromEntries(list.map(item => [item.event_cd, item]));
  return hazardIconMap;
}

async function fillHazardIcon(el) {
  const eventCd = el.dataset.eventCd;
  const map = await loadHazardIconMap();
  const info = map[eventCd] || {};
  const iconFile = info.iconFile || 'DEFAULT.png';
  const level = info.level || 'info';

  el.classList.add(`hazard-icon--${level}`);
  el.insertAdjacentHTML('beforeend',
    `<img class="hazard-icon__glyph" src="images/hazard_icon/${iconFile}" alt="${info.event || eventCd}">
    <svg class="hazard-icon__triangle" viewBox="0 0 22 20">
      <use href="#hazard-triangle"/>
    </svg>`
  );
}

document.querySelectorAll('.hazard-icon[data-event-cd]').forEach(fillHazardIcon);