(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const list = $('place-list');
  const result = $('travel-results');
  const message = $('map-message');
  let places = [], visible = [], map, markers;
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
  const placeButton = (p) => {
    if (!map) return text('span', p.name);
    const button = text('button', p.name, 'place-button');
    button.type = 'button';
    button.setAttribute('aria-label', `Show ${p.name}, ${p.country} on map`);
    button.addEventListener('click', () => showPlace(p));
    return button;
  };
  function render() {
    visible = places;
    list.replaceChildren();
    $('upcoming-list').replaceChildren();
    markers?.clearLayers();
    markerById.clear();
    for (const p of places) {
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
    }
    const visited = places.filter((p) => p.status === 'visited');
    const countries = [...new Set(visited.map((p) => p.country))];
    for (const country of countries) {
      const group = document.createElement('section');
      group.className = 'place-group';
      group.append(text('h3', country));
      const entries = document.createElement('ul');
      entries.className = 'place-names';
      for (const p of visited.filter((p) => p.country === country)) {
        const item = document.createElement('li');
        item.append(placeButton(p));
        if (p.note || p.when) item.append(text('span', ` (${[p.note, p.when].filter(Boolean).join(', ')})`, 'place-detail'));
        entries.append(item);
      }
      group.append(entries);
      list.append(group);
    }
    const upcoming = places.filter((p) => p.status !== 'visited');
    $('upcoming-section').hidden = upcoming.length === 0;
    for (const p of upcoming) {
      const item = document.createElement('li');
      const destination = text('div', '', 'upcoming-place');
      destination.append(placeButton(p), text('span', `, ${p.country}`, 'place-detail'));
      const details = [p.when, p.note || label(p.status)].filter(Boolean).join(' · ');
      item.append(destination, text('p', details, 'place-detail'));
      $('upcoming-list').append(item);
    }
    result.textContent = `${visited.length} visited places and ${upcoming.length} future destinations.`;
    $('travel-empty').hidden = places.length > 0;
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
          $('map-reset').addEventListener('click', () => { map.closePopup(); framePlaces(); });
        } catch (_) { map = null; }
      }
      if (!map) {
        $('travel-map').hidden = true;
        message.textContent = 'The map is unavailable right now. All places are listed below.';
        message.hidden = false;
      }
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
