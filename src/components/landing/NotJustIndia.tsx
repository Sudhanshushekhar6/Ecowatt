"use client";
import WorldMap from "@/components/ui/world-map";

export function NotJustIndia() {
  return (
    <div className="hidden md:block px-20 bg-background pt-20 w-full">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl font-bold tracking-tighter text-foreground sm:text-3xl md:text-4xl text-center">
          Built for everyone, not just{" "}
          <span className="text-green-500">India</span>
        </h2>
        <p className="text-sm md:text-lg text-neutral-500 max-w-2xl mx-auto py-4">
          Given the rise in Solar energy, all across the globe,
          <span className="text-foreground"> Ecowatt's</span> smart energy
          solutions can easily be adopted by{" "}
          <span className="underline underline-offset-2 decoration-dotted decoration-green-500">
            anyone, anywhere
          </span>{" "}
          in the world.
        </p>
      </div>
      <WorldMap
        lineColor="#22c55e"
        dots={[
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: {
              lat: 64.2008,
              lng: -149.4937,
            }, // Alaska (Fairbanks)
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: 51.5074, lng: -0.1278 }, // London
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
          },
        ]}
      />
    </div>
  );
}
