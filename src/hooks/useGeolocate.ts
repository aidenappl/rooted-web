// hooks/useGeolocate.ts
import { useEffect, useState } from "react";
import { ViewState } from "react-map-gl/mapbox";

const useGeolocate = (
  defaultLocation = { latitude: 37.78, longitude: -122.45, zoom: 12 }
) => {
  const [viewState, setViewState] = useState<ViewState | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setViewState({ ...defaultLocation, bearing: 0, pitch: 0, padding: {} });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setViewState({
          latitude,
          longitude,
          zoom: 13,
          bearing: 0,
          pitch: 0,
          padding: {},
        });
      },
      (error) => {
        console.warn("Geolocation failed:", error);
        setViewState({ ...defaultLocation, bearing: 0, pitch: 0, padding: {} });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

  return { viewState, setViewState };
};

export default useGeolocate;