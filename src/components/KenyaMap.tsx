
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef } from 'react';

// This component uses Leaflet.js for a custom map
// Make sure to install leaflet: npm install leaflet
// And add leaflet CSS in your index.html or import 'leaflet/dist/leaflet.css';

const KenyaMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client
    if (!mapRef.current) return;
    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then(L => {
      // Remove any previous map instance
      if ((window as any)._surebodaMap) {
        (window as any)._surebodaMap.remove();
      }
      const map = L.map(mapRef.current!).setView([-1.286389, 36.817223], 10); // Nairobi center, zoom 10
      (window as any)._surebodaMap = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);
      // Draw a green circle over Nairobi
      L.circle([-1.286389, 36.817223], {
        color: 'green',
        fillColor: '#3f0',
        fillOpacity: 0.4,
        radius: 18000 // ~18km radius
      }).addTo(map).bindPopup('Nairobi Business Zone');
    });
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '60vh', minHeight: 420, borderRadius: 18, boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)' }}
    />
  );
};

export default KenyaMap;
