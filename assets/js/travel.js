(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const list = $('place-list');
  const result = $('travel-results');
  const message = $('map-message');
  const filters = [...document.querySelectorAll('[data-travel-filter]')];
  let places = [], visible = [], filter = 'all', map, markers;
  const markerById = new Map();
  const label = (status) => ({visited: 'Visited', planned: 'Planned trip', wishlist: 'Wishlist'})[status];
  const text = (tag, content, className) => {
    const el = document.createElement(tag);
    el.textContent = content;
    if (className) el.className = className;
    return el;
  };
  const validPlace = (p) => p && typeof p.id === 'string' && /^[a-z0-9-]+$/.test(p.id)
    && typeof p.name === 'string' && p.name.trim() && typeof p.country === 'string' && p.country.trim()
    && ['visited', 'planned', 'wishlist'].includes(p.status)
    && Number.isFinite(p.lat) && Math.abs(p.lat) <= 85
    && Number.isFinite(p.lng) && Math.abs(p.lng) <= 180
    && (p.when === undefined || typeof p.when === 'string')
    && (p.note === undefined || typeof p.note === 'string');
  const framePlaces = () => {
    if (!map) return;
    if (!visible.length) map.fitBounds([[-55, -180], [80, 180]], {padding: [16, 16], animate: false});
    else map.fitBounds(visible.map((p) => [p.lat, p.lng]), {padding: [45, 45], maxZoom: 5, animate: false});
  };
  const showPlace = (p) => {
    if (!map) return;
    map.setView([p.lat, p.lng], 6, {animate: false});
    markerById.get(p.id)?.openPopup();
    $('travel-map').scrollIntoView({block: 'center', behavior: 'auto'});
    const close = $('travel-map').querySelector('.leaflet-popup-close-button');
    close?.focus({preventScroll: true});
  };
  function render() {
    const query = $('place-search').value.trim().toLocaleLowerCase();
    visible = places.filter((p) => (filter === 'all' || p.status === filter)
      && `${p.name} ${p.country} ${p.note || ''} ${p.when || ''}`.toLocaleLowerCase().includes(query));
    filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.travelFilter === filter)));
    list.replaceChildren();
    markers?.clearLayers();
    markerById.clear();
    for (const p of visible) {
      if (map) {
        const popup = document.createElement('div');
        popup.append(text('span', label(p.status), `place-status ${p.status}`), text('h3', p.name), text('p', p.country));
        if (p.when) popup.append(text('p', p.when, 'place-when'));
        if (p.note) popup.append(text('p', p.note));
        const marker = L.marker([p.lat, p.lng], {
          icon: L.divIcon({className: `travel-marker ${p.status}`, html: '<span aria-hidden="true"></span>', iconSize: [32, 32], iconAnchor: [16, 16]}),
          title: `${p.name}, ${p.country} — ${label(p.status)}`,
          keyboard: true,
          alt: `${p.name}, ${label(p.status)}`,
          riseOnHover: true
        }).addTo(markers).bindPopup(popup, {maxWidth: 280});
        markerById.set(p.id, marker);
      }
      const item = document.createElement('li');
      item.className = 'place-card';
      item.append(text('span', label(p.status), `place-status ${p.status}`));
      const heading = text('h3', '');
      if (map) {
        const button = text('button', p.name, 'place-button');
        button.type = 'button';
        button.setAttribute('aria-label', `Show ${p.name}, ${p.country} on map`);
        button.addEventListener('click', () => showPlace(p));
        heading.append(button);
      } else heading.textContent = p.name;
      item.append(heading, text('p', p.country, 'place-country'));
      if (p.when) item.append(text('p', p.when, 'place-when'));
      if (p.note) item.append(text('p', p.note, 'place-note'));
      list.append(item);
    }
    result.textContent = `${visible.length} ${visible.length === 1 ? 'place' : 'places'} shown`;
    $('travel-empty').hidden = visible.length > 0;
    $('travel-empty').textContent = places.length ? 'No places match this view. Try another filter or search.' : 'The travel log is just getting started. More places to come.';
    framePlaces();
  }
  async function init() {
    try {
      const response = await fetch('/assets/data/travel.json');
      if (!response.ok) throw new Error('Travel data unavailable');
      const data = await response.json();
      if (data.version !== 1 || !Array.isArray(data.places) || !data.places.every(validPlace)
          || new Set(data.places.map((p) => p.id)).size !== data.places.length) throw new Error('Invalid travel data');
      places = data.places;
      const visited = places.filter((p) => p.status === 'visited');
      $('visited-count').textContent = visited.length;
      $('country-count').textContent = new Set(visited.map((p) => p.country)).size;
      $('planned-count').textContent = places.filter((p) => p.status === 'planned').length;
      $('wishlist-count').textContent = places.filter((p) => p.status === 'wishlist').length;
      $('travel-stats').hidden = false;
      if (typeof L !== 'undefined') {
        try {
          map = L.map('travel-map', {scrollWheelZoom: false, minZoom: 0, zoomSnap: 0.25, maxZoom: 12, maxBounds: [[-85, -180], [85, 180]], maxBoundsViscosity: 1}).setView([22, 0], 2);
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19, noWrap: true,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).on('load', () => {
            const tiles = [...$('travel-map').querySelectorAll('.leaflet-tile')];
            if (tiles.length && tiles.every((tile) => tile.complete && tile.naturalWidth > 0)) message.hidden = true;
          }).on('tileerror', () => {
            message.textContent = 'Some map tiles could not load. You can still explore the place list below.';
            message.hidden = false;
          }).addTo(map);
          map.attributionControl.addAttribution('Locations: <a href="https://www.naturalearthdata.com/">Natural Earth</a>');
          markers = L.layerGroup().addTo(map);
          let mapWidth = 0;
          const resize = new ResizeObserver(([entry]) => {
            if (entry.contentRect.width === mapWidth) return;
            mapWidth = entry.contentRect.width;
            requestAnimationFrame(() => {
              map.invalidateSize({pan: false});
              framePlaces();
            });
          });
          resize.observe($('travel-map'));
          $('map-reset').hidden = false;
          $('map-reset').addEventListener('click', framePlaces);
        } catch (_) { map = null; }
      }
      if (!map) {
        $('travel-map').hidden = true;
        message.textContent = 'The map is unavailable right now. All places are listed below.';
        message.hidden = false;
      }
      filters.forEach((button) => {
        button.disabled = false;
        button.addEventListener('click', () => { filter = button.dataset.travelFilter; render(); });
      });
      $('place-search').disabled = false;
      $('place-search').addEventListener('input', render);
      render();
    } catch (_) {
      $('travel-map').hidden = true;
      message.textContent = 'The travel log could not load. Please refresh the page to try again.';
      message.hidden = false;
      result.textContent = 'Places unavailable';
    }
  }
  init();
})();
