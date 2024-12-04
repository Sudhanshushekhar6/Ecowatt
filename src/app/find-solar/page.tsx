"use client";

import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useMemo } from "react";

function Map() {
  const center = useMemo(() => ({ lat: 44, lng: -80 }), []);

  return (
    <GoogleMap
      zoom={10}
      center={center}
      mapContainerClassName="h-[400px] w-[800px]"
    >
      <Marker position={center} />
    </GoogleMap>
  );
}

export default function FindSolar() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  if (!isLoaded) return <div>Loading...</div>;
  return (
    <div className="flex flex-col items-center justify-center h-[90vh]">
      <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
        Find Solar
      </h1>
      <p className="mb-6">Find the best solar panels for your needs</p>
      <Map />
    </div>
  );
}
