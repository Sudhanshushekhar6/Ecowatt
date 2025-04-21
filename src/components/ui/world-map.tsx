
"use client";

import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import { useEffect, useMemo, useState } from "react";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

export default function WorldMap({ dots = [], lineColor = "#0ea5e9" }: MapProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const center = useMemo(() => currentLocation || { lat: 20, lng: 0 }, [currentLocation]);
  const zoom = currentLocation ? 3 : 2;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => console.warn("Location access denied.")
      );
    }
  }, []);

  const mapStyles = {
    height: "500px",
    width: "100%",
    borderRadius: "12px",
  };

  const polylineOptions = {
    strokeColor: lineColor,
    strokeOpacity: 0,
    icons: [
      {
        icon: {
          path: "M 0,-1 0,1",
          strokeOpacity: 1,
          scale: 4,
        },
        offset: "0",
        repeat: "20px",
      },
    ],
  };

  const mapTheme = [
    {
      elementType: "geometry",
      stylers: [{ color: "#1d2c4d" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#8ec3b9" }],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#1a3646" }],
    },
    {
      featureType: "administrative.country",
      elementType: "geometry.stroke",
      stylers: [{ color: "#4b6878" }],
    },
    {
      featureType: "landscape.natural",
      elementType: "geometry",
      stylers: [{ color: "#023e58" }],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#283d6a" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#304a7d" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#406d80" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0e1626" }],
    },
  ];

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={mapStyles}
        center={center}
        zoom={zoom}
        options={{
          disableDefaultUI: true,
          styles: mapTheme,
        }}
      >
        {/* User's Current Location */}
        {currentLocation && (
          <Marker
            position={currentLocation}
            icon={{
              path: window.google?.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#3b82f6",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            }}
          />
        )}

        {/* Dots and Lines */}
        {dots.map((dot, i) => (
          <div key={`dot-group-${i}`}>
            {/* Start Marker */}
            <Marker
              position={dot.start}
              label={{
                text: dot.start.label || "Start",
                color: "#ffffff",
                fontWeight: "bold",
              }}
              onClick={() => setActiveMarker(`start-${i}`)}
            />
            {/* End Marker */}
            <Marker
              position={dot.end}
              label={{
                text: dot.end.label || "End",
                color: "#ffffff",
                fontWeight: "bold",
              }}
              onClick={() => setActiveMarker(`end-${i}`)}
            />

            {/* InfoWindows */}
            {activeMarker === `start-${i}` && (
              <InfoWindow position={dot.start} onCloseClick={() => setActiveMarker(null)}>
                <div>{dot.start.label || "Start Point"}</div>
              </InfoWindow>
            )}
            {activeMarker === `end-${i}` && (
              <InfoWindow position={dot.end} onCloseClick={() => setActiveMarker(null)}>
                <div>{dot.end.label || "End Point"}</div>
              </InfoWindow>
            )}

            {/* Dotted Polyline */}
            <Polyline path={[dot.start, dot.end]} options={polylineOptions} />
          </div>
        ))}
      </GoogleMap>
    </LoadScript>
  );
}