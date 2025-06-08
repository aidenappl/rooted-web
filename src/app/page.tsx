"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  FullscreenControl,
  GeolocateControl,
  ScaleControl,
  ViewState,
  Popup,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";

import Pin from "@/components/Pin";
import Link from "next/link";

interface Organisation {
  id: number;
  name: string;
  ein: string;
  dln: string;
  xml_batch_id: string;
  website: string;
  description: string;
  location: Location;
  metadata: Metadata;
}

interface Location {
  location_id: number;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
  lat: number;
  lng: number;
}

interface Metadata {
  id: number;
  gross_receipts: number;
  total_revenue: number;
  total_expenses: number;
  excess_or_deficit: number;
}

type GeneralResponse<T> = {
  status: string;
  message: string;
  data?: T;
};

export default function Home() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null);
  const [viewState, setViewState] = useState<ViewState | null>(null);

  const lastFetchKey = useRef<string>("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchOrgsByCenter = useCallback(
    async (lat: number, lng: number, zoom: number) => {
      const radius = getRadiusByZoom(zoom);
      const key = `${lat.toFixed(4)}-${lng.toFixed(4)}-${radius}`;

      if (lastFetchKey.current === key) return;
      lastFetchKey.current = key;

      try {
        const orgs = await getOrgsByRadius(lat, lng, radius);
        setOrganisations(orgs);
      } catch (err) {
        console.error("Failed to fetch organisations:", err);
      }
    },
    []
  );

  const debouncedFetch = useCallback(
    (lat: number, lng: number, zoom: number) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        fetchOrgsByCenter(lat, lng, zoom);
      }, 300);
    },
    [fetchOrgsByCenter]
  );

  const handleMoveEnd = useCallback(
    (e: any) => {
      const { latitude, longitude, zoom, bearing, pitch } = e.viewState;
      setViewState({
        latitude,
        longitude,
        zoom,
        bearing: bearing,
        pitch: pitch,
        padding: {},
      });
      debouncedFetch(latitude, longitude, zoom);
    },
    [debouncedFetch]
  );

  // Get user's current location on first mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setViewState({
        latitude: 37.78,
        longitude: -122.45,
        zoom: 12,
        bearing: 0,
        pitch: 0,
        padding: {},
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const initialZoom = 13;
        setViewState({
          latitude,
          longitude,
          zoom: initialZoom,
          bearing: 0,
          pitch: 0,
          padding: {},
        });
        fetchOrgsByCenter(latitude, longitude, initialZoom);
      },
      (err) => {
        console.error("Geolocation error:", err);
        // fallback to SF
        const fallback = {
          latitude: 37.78,
          longitude: -122.45,
          zoom: 12,
          bearing: 0,
          pitch: 0,
          padding: {},
        };
        setViewState(fallback);
        fetchOrgsByCenter(fallback.latitude, fallback.longitude, fallback.zoom);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, [fetchOrgsByCenter]);

  const pins = useMemo(
    () =>
      organisations.map((org) => (
        <Marker
          key={org.id}
          longitude={org.location.lng}
          latitude={org.location.lat}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            console.log("Marker clicked:", org);
            setSelectedOrg(org);
          }}
        >
          {org.website && org.description && isValidUrl(org.website) ? (
            <Pin color="#598ced" />
          ) : org.website && isValidUrl(org.website) ? (
            <Pin color="#d00" />
          ) : (
            <Pin color="#00d00" />
          )}
        </Marker>
      )),
    [organisations]
  );

  return (
    <div className="min-h-[calc(100vh-100px)]">
      <div className="w-full h-[600px]">
        {viewState && (
          <Map
            initialViewState={viewState}
            onMoveEnd={handleMoveEnd}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            style={{ width: "100%", height: "100%" }}
          >
            <GeolocateControl position="top-left" />
            <FullscreenControl position="top-left" />
            <NavigationControl position="top-left" />
            <ScaleControl />
            {pins}
            {selectedOrg && (
              <Popup
                longitude={selectedOrg.location.lng}
                latitude={selectedOrg.location.lat}
                anchor="top"
                closeOnClick={true}
                onClose={() => setSelectedOrg(null)}
              >
                <div className="text-sm flex flex-col gap-1">
                  <strong>{selectedOrg.name}</strong>
                  <i>
                    {selectedOrg.location.address_line1},{" "}
                    {selectedOrg.location.city}, {selectedOrg.location.zip_code}{" "}
                    {selectedOrg.location.state}
                  </i>
                  <p className="line-clamp-4">{selectedOrg.description}</p>
                  {selectedOrg.website && isValidUrl(selectedOrg.website) ? (
                    <Link
                      href={normalizeUrl(selectedOrg.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Visit Website
                    </Link>
                  ) : null}
                </div>
              </Popup>
            )}
          </Map>
        )}
      </div>
    </div>
  );
}

// Approximate zoom → radius lookup
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
  const response = await axios.get<GeneralResponse<Organisation[]>>(
    "http://10.15.10.208:8000/organisations",
    {
      params: {
        requires: "coordinates",
        lat,
        lng,
        radius,
        limit: 500,
      },
      validateStatus: () => true,
    }
  );

  if (response.status !== 200) {
    throw new Error("Failed to fetch organisations");
  }

  return response.data.data ?? [];
};

function normalizeUrl(url: string): string {
  if (!url) return "#";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}

export function isValidUrl(input: string): boolean {
  try {
    const url = new URL(normalizeUrl(input));
    if (!url.protocol) return false;
    if (input.toLowerCase() == "n/a") return false;
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}
