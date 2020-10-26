/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiYWxhbmZueiIsImEiOiJja2dqbXpqbXUwMWtoMnVtcGpvc2Q3a2JrIn0.NvRjm7E6zAg5TUajZvSIRQ';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/alanfnz/ckgkm3cz620jd1anmx4h7cjon',
    scrollZoom: false,
  });
  
  const bounds = new mapboxgl.LngLatBounds();
  
  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker',
    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    }).setLngLat(loc.coordinates).addTo(map);
  
    // Add popup
    new mapboxgl.Popup({ offset: 30 }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
  
    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });
  
  // Make the map fit the bounds
  map.fitBounds(bounds, {
    padding : {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    }
  });
}


