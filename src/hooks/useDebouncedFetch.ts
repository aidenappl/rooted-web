// hooks/useDebouncedFetch.ts
import { api } from "@/tools/axios.tools";
import { Organisation } from "@/types";
import { useCallback, useRef, useState } from "react";
import type { ViewState } from "react-map-gl/mapbox";

const useDebouncedFetch = (
  viewState: ViewState | null,
  setViewState: (v: ViewState) => void,
) => {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null);
  const [searchCategories, setSearchCategories] = useState<string[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastFetchKey = useRef<string>("");

  const getRadiusByZoom = (zoom: number): number => {
    const zoomRadiusMap: Record<number, number> = {
      22: 1,
      21: 2,
      20: 5,
      19: 20,
      18: 150,
      17: 250,
      16: 500,
      15: 1000,
      14: 1500,
      13: 3000,
      12: 5000,
      11: 10000,
      10: 15000,
      9: 25000,
      8: 50000,
      7: 100000,
    };
    return zoomRadiusMap[Math.floor(zoom)] ?? 0;
  };

  const getOrgsByRadius = useCallback(
    async (
      lat: number,
      lng: number,
      radius: number,
    ): Promise<Organisation[]> => {
      const res = await api.get("/organisations", {
        params: {
          requires: "coordinates",
          lat,
          lng,
          limit: 500,
          radius,
          categories: searchCategories.join(","),
        },
      });
      if (!res.data.success) throw new Error(res.data.message);
      return res.data.data ?? [];
    },
    [searchCategories],
  );

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
    [getOrgsByRadius],
  );

  const handleMoveEnd = useCallback(
    (e: {
      viewState: { latitude: number; longitude: number; zoom: number };
    }) => {
      const { latitude, longitude, zoom } = e.viewState;
      setViewState({
        latitude,
        longitude,
        zoom,
        bearing: 0,
        pitch: 0,
        padding: {},
      });

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        fetchOrgs(latitude, longitude, zoom);
      }, 300);
    },
    [fetchOrgs, setViewState],
  );

  return {
    organisations,
    selectedOrg,
    setSelectedOrg,
    handleMoveEnd,
    setOrganisations,
    searchCategories,
    setSearchCategories,
    fetchOrgs,
  };
};

export default useDebouncedFetch;
