import React, { useState, useRef, useEffect } from 'react';
import { APIProvider, Map, useMapsLibrary, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';

// 1. Keep your Autocomplete box exactly as it was
function PlaceAutocompleteBox({ onPlaceSelect }) {
  const [autocomplete, setAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const placesLibrary = useMapsLibrary('places');

  useEffect(() => {
    if (!placesLibrary || !inputRef.current) return;
    const options = { fields: ['geometry', 'name', 'formatted_address'] };
    const autocompleteInstance = new placesLibrary.Autocomplete(inputRef.current, options);
    setAutocomplete(autocompleteInstance);
  }, [placesLibrary]);

  useEffect(() => {
    if (!autocomplete) return;
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        onPlaceSelect({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      }
    });
  }, [autocomplete, onPlaceSelect]);

  return (
    <input 
      ref={inputRef} 
      type="text" 
      placeholder="Search for a location..." 
      style={inputStyle}
    />
  );
}

// 2. NEW INNER COMPONENT: This handles the map and safely uses useMap()
function InnerMap({ selectedPosition, onPlaceSelect }) {
  const mapInstance = useMap(); // Safe to call here because it's a child of <APIProvider>

  const handlePlaceSelect = (position) => {
    onPlaceSelect(position); // Update coordinates in parent state

    if (mapInstance) {
      mapInstance.panTo(position);
      mapInstance.setZoom(15);
    }
  };
  
  const handleMarkerDragEnd = (event) => {
    if (!event.latLng) return;
    
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    onPlaceSelect(newPosition);

    if (mapInstance) {
      mapInstance.panTo(newPosition);
    }
  };


  return (
    <>
      <PlaceAutocompleteBox onPlaceSelect={handlePlaceSelect} />
      <Map
        defaultCenter={selectedPosition}
        defaultZoom={13}
        mapId="DEMO_MAP_ID"
        gestureHandling="greedy"
      >
        <AdvancedMarker 
        	position={selectedPosition}
        	draggable={true}
          	onDragEnd={handleMarkerDragEnd} 
        />
      </Map>
    </>
  );
}

// 3. MAIN COMPONENT: This sets up the API provider context
export default function GoogleMap({defaultPosition, onPositionChange }) {
  const [selectedPosition, setSelectedPosition] = useState(defaultPosition);

  const handleCoordinateUpdate = (position) => {
    setSelectedPosition(position);
    if (onPositionChange) {
      onPositionChange(position); // Feeds data to external app components
    }
  };

  return (
    <div className="google-map" style={{ width: '100%', height: '500px', position: 'relative' }}>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        {/* Render InnerMap down here so useMap() works successfully */}
        <InnerMap 
          selectedPosition={selectedPosition} 
          onPlaceSelect={handleCoordinateUpdate} 
        />
      </APIProvider>
    </div>
  );
}

const inputStyle = {
  position: 'absolute',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10,
  width: '300px',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  fontSize: '16px',
  outline: 'none'
};


