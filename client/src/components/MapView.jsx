import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// The Mapbox token is the same one used by the Express backend
const TOKEN = import.meta.env.VITE_MAP_TOKEN || 'pk.eyJ1Ijoic2luZ2hqYXlyYWowNSIsImEiOiJjbWgwamd3ejMwaWNpOHhzOHd4ejVsbXh0In0._jfKQ5dKnUIo9ZTIBLMzZA';

export default function MapView({ geometry, title }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!geometry?.coordinates || mapRef.current) return;

    mapboxgl.accessToken = TOKEN;
    const [lng, lat] = geometry.coordinates;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [lng, lat],
      zoom: 10,
    });

    // Custom marker
    const el = document.createElement('div');
    el.style.cssText = `
      width: 40px; height: 40px; border-radius: 50% 50% 50% 0;
      background: #FF385C; transform: rotate(-45deg);
      border: 3px solid white; box-shadow: 0 4px 14px rgba(255,56,92,0.4);
    `;
    new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(`<strong>${title}</strong>`))
      .addTo(mapRef.current);

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [geometry, title]);

  return <div ref={containerRef} className="map-container" />;
}
