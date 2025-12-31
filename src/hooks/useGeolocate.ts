// hooks/useGeolocate.ts
import { useEffect, useMemo, useState } from "react";
import { ViewState } from "react-map-gl/mapbox";

interface DefaultLocation {
  latitude: number;
  longitude: number;
  zoom: number;
}

const useGeolocate = (
  defaultLocationProp: DefaultLocation = {
    latitude: 37.78,
    longitude: -122.45,
    zoom: 12,
  },
) => {
  // Memoize with the full prop to satisfy exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultLocation = useMemo(
    () => defaultLocationProp,
    [
      defaultLocationProp.latitude,
      defaultLocationProp.longitude,
      defaultLocationProp.zoom,
    ],
  );
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
      },
    );
  }, [defaultLocation]);

  return { viewState, setViewState };
};

export default useGeolocate;
