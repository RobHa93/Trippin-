import React, { useEffect, useRef } from 'react';

/**
 * Component to display Google Map with markers and route
 * Note: Requires Google Maps JavaScript API to be loaded
 */
export default function MapView({ day, center, focusedStopIndex }) {
    // Zoom auf fokussierten Stop, oder zurücksetzen wenn null
    useEffect(() => {
      if (!mapInstanceRef.current || !window.google) return;

      if (focusedStopIndex === null && day && day.stops && day.stops.length > 0) {
        // Reset to show all stops
        const bounds = new window.google.maps.LatLngBounds();
        day.stops.forEach(stop => bounds.extend({ lat: stop.lat, lng: stop.lng }));
        mapInstanceRef.current.fitBounds(bounds);
        return;
      }

      if (
        typeof focusedStopIndex === 'number' &&
        day &&
        day.stops &&
        day.stops[focusedStopIndex]
      ) {
        const stop = day.stops[focusedStopIndex];
        const latLng = new window.google.maps.LatLng(stop.lat, stop.lng);
        mapInstanceRef.current.panTo(latLng);
        mapInstanceRef.current.setZoom(15);
        if (markersRef.current[focusedStopIndex]) {
          markersRef.current[focusedStopIndex].setAnimation(window.google.maps.Animation.BOUNCE);
          setTimeout(() => {
            if (markersRef.current[focusedStopIndex]) {
              markersRef.current[focusedStopIndex].setAnimation(null);
            }
          }, 1200);
        }
      }
    }, [focusedStopIndex, day]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  useEffect(() => {
    // Initialize map when component mounts
    if (!mapInstanceRef.current && window.google && mapRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: center || { lat: 47.376887, lng: 8.541694 },
        zoom: 12,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false
      });
    }
  }, [center]);

  useEffect(() => {
    // Update map when day changes
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers and polyline
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (!day || !day.stops || day.stops.length === 0) return;

    // Create markers for stops
    const bounds = new window.google.maps.LatLngBounds();

    day.stops.forEach((stop, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map: mapInstanceRef.current,
        label: {
          text: `${index + 1}`,
          color: 'white',
          fontWeight: 'bold'
        },
        title: stop.name
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: stop.lat, lng: stop.lng });
    });

    // Draw route polyline if available
    if (day.route && day.route.polyline) {
      const decodedPath = window.google.maps.geometry.encoding.decodePath(
        day.route.polyline
      );

      polylineRef.current = new window.google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: mapInstanceRef.current
      });
    }

    // Fit map to bounds
    mapInstanceRef.current.fitBounds(bounds);

  }, [day]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {!window.google && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Karte wird geladen...</p>
            <p className="text-sm text-gray-500">
              Google Maps API erforderlich
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
