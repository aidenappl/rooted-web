// hooks/useDebouncedFetch.ts
import { Organisation } from "@/types";
import axios from "axios";
import { useCallback, useRef, useState } from "react";

const useDebouncedFetch = (
  viewState: { latitude: number; longitude: number; zoom: number } | null,
  setViewState: (v: any) => void
) => {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastFetchKey = useRef<string>("");

  const getRadiusByZoom = (zoom: number): number => {
    const zoomRadiusMap: Record<number, number> = {
      14: 1500,
      13: 3000,
      12: 5000,
      11: 10000,
      10: 15000,
      9: 25000,
      8: 50000,
      7: 100000,
      6: 150000,
    };
    return zoomRadiusMap[Math.floor(zoom)] ?? 10000;
  };

  const getOrgsByRadius = async (
    lat: number,
    lng: number,
    radius: number
  ): Promise<Organisation[]> => {
    const res = await axios.get("http://10.15.10.208:8000/organisations", {
      params: {
        requires: "coordinates",
        lat,
        lng,
        limit: 500,
        radius,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data ?? [];
  };

  const fetchOrgs = useCallback(
    async (lat: number, lng: number, zoom: number) => {
      const radius = getRadiusByZoom(zoom);
      const key = `${lat.toFixed(4)}-${lng.toFixed(4)}-${radius}`;

      if (lastFetchKey.current === key) return;
      lastFetchKey.current = key;

      try {
        const orgs = await getOrgsByRadius(lat, lng, radius);
        setOrganisations(orgs);
      } catch (e) {
        console.error("Error fetching orgs:", e);
      }
    },
    []
  );

  const handleMoveEnd = useCallback(
    (e: any) => {
      const { latitude, longitude, zoom } = e.viewState;
      setViewState({ latitude, longitude, zoom, bearing: 0, pitch: 0 });

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        fetchOrgs(latitude, longitude, zoom);
      }, 300);
    },
    [fetchOrgs, setViewState]
  );

  return { organisations, selectedOrg, setSelectedOrg, handleMoveEnd };
};

export default useDebouncedFetch;
