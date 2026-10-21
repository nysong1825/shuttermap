const SCREENS = ['map', 'convert'];

export function showScreen(name) {
  for (const s of SCREENS) {
    document.getElementById(`screen-${s}`).hidden = s !== name;
  }
  for (const btn of document.querySelectorAll('.tabbar button')) {
    if (btn.dataset.screen === name) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  }
}

for (const btn of document.querySelectorAll('.tabbar button')) {
  btn.addEventListener('click', () => showScreen(btn.dataset.screen));
}

const map = L.map('map').setView([37.5445, 127.0], 12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap',
}).addTo(map);
