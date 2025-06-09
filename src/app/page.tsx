"use client";

import MapView from "@/components/MapView";
import SearchBar from "@/components/SearchBar";
import ResultsPanel from "@/components/ResultsPanel";
import CategoryFilters from "@/components/CategoryFilters";

import useDebouncedFetch from "@/hooks/useDebouncedFetch";
import useGeolocate from "@/hooks/useGeolocate";
import { useSearchHandler } from "@/hooks/useSearchHandler";

import { useRef, useState } from "react";
import { MapRef } from "react-map-gl/mapbox";
import Legend from "@/components/Lengend";

import "mapbox-gl/dist/mapbox-gl.css";

export default function Home() {
  const { viewState, setViewState } = useGeolocate();
  const mapRef = useRef<MapRef>(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [searching, setSearching] = useState(false);

  const {
    organisations,
    handleMoveEnd,
    selectedOrg,
    setSelectedOrg,
    setOrganisations,
    setSearchCategories,
    searchCategories,
  } = useDebouncedFetch(viewState, setViewState);

  const flyToLocation = (lat: number, lng: number, zoom = 13) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom,
      duration: 2000,
      essential: true,
    });
  };

  const handleSearch = useSearchHandler({
    searchLocation,
    setSearchCategories,
    setOrganisations,
    setSelectedOrg,
    setViewState,
    flyToLocation,
  });

  return (
    <div className="min-h-[calc(100vh-100px)] p-4">
      <div className="w-full h-[600px] flex gap-2">
        {viewState && (
          <MapView
            viewState={viewState}
            ref={mapRef}
            onMoveEnd={handleMoveEnd}
            organisations={organisations}
            selectedOrg={selectedOrg}
            setSelectedOrg={setSelectedOrg}
          />
        )}
        <ResultsPanel organisations={organisations} />
      </div>

      <SearchBar
        value={searchLocation}
        onChange={setSearchLocation}
        onSearch={async () => {
          setSearching(true);
          await handleSearch();
          setSearching(false);
        }}
        loading={searching}
      />

      <CategoryFilters
        categories={searchCategories}
        onClear={() => {
          setSearchCategories([]);
          setOrganisations([]);
          setSelectedOrg(null);
        }}
      />

      <Legend />
    </div>
  );
}
