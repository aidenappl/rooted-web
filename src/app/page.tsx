"use client";

import { useEffect, useMemo, useState } from "react";
import Map, {
  FullscreenControl,
  GeolocateControl,
  Marker,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/mapbox";

import "mapbox-gl/dist/mapbox-gl.css";

import CITIES from "../../testdata.json";
import Pin from "@/components/Pin";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [startingLocation, setStartingLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  const initialize = () => {
    setLoading(false);
  };

  useEffect(() => {
    // Cleanup function to reset loading state when component unmounts
    return () => {
      setLoading(true);
      setStartingLocation({ latitude: 0, longitude: 0 });
    };
  }, []);

  useEffect(() => {
    // This effect runs when the component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setStartingLocation({ latitude, longitude });
          initialize();
        },
        (error) => {
          console.error("Error getting current position:", error);
          setStartingLocation({
            latitude: 37.78,
            longitude: -122.45,
          });
          initialize();
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  }, []);

  const pins = useMemo(
    () =>
      CITIES.map((city, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={city.longitude}
          latitude={city.latitude}
          anchor="bottom"
          onClick={(e) => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
          }}
        >
          <Pin />
        </Marker>
      )),
    []
  );

  return (
    <div className="min-h-[calc(100vh-100px)]">
      <div className="w-[500px] h-[500px]">
        {!loading && (
          <Map
            initialViewState={{
              longitude: startingLocation.longitude,
              latitude: startingLocation.latitude,
              zoom: 12,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          >
            <GeolocateControl position="top-left" />
            <FullscreenControl position="top-left" />
            <NavigationControl position="top-left" />
            <ScaleControl />

            {pins}
          </Map>
        )}
      </div>
    </div>
  );
}
