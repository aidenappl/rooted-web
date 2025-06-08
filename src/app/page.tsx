"use client";

import MapView from "@/components/MapView";
import Pin from "@/components/Pin";
import useDebouncedFetch from "@/hooks/useDebouncedFetch";
import useGeolocate from "@/hooks/useGeolocate";
import axios from "axios";

import "mapbox-gl/dist/mapbox-gl.css";
import { useRef, useState } from "react";
import { MapRef } from "react-map-gl/mapbox";
import { BeatLoader } from "react-spinners";

export default function Home() {
  const { viewState, setViewState } = useGeolocate();
  const mapRef = useRef<MapRef>(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCategories, setSearchCategories] = useState<string[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const { organisations, handleMoveEnd, selectedOrg, setSelectedOrg } =
    useDebouncedFetch(viewState, setViewState);

  const flyToLocation = (lat: number, lng: number, zoom = 13) => {
    mapRef.current?.flyTo({
      center: [lng, lat], // [lng, lat] order
      zoom,
      duration: 2000, // animation duration in ms
      essential: true, // respect prefers-reduced-motion
    });
  };

  return (
    <div className="min-h-[calc(100vh-100px)]">
      <div className="w-full h-[600px]">
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
        <div className="w-[400px] mt-5 flex gap-2">
          <input
            className="border border-gray-300 rounded p-2 w-full"
            type="text"
            onChange={(e) => {
              setSearchLocation(e.target.value);
            }}
            value={searchLocation}
            placeholder="What are you looking for?"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition-colors flex items-center justify-center"
            onClick={async () => {
              setSearching(true);
              let intent = await axios.get("/api/intent", {
                params: {
                  message: searchLocation,
                },
              });
              console.log("Intent response:", intent.data);

              if (!intent.data.success) {
                alert("Error determining intent. Please try again.");
                return;
              }
              if (intent.data.data.intent === "search") {
                let response = await axios.get("/api/connect", {
                  params: {
                    message: searchLocation,
                  },
                });
                let data = response.data;

                if (data.success) {
                  console.log("Connect result:", data);
                  setSearchCategories(data.data.categories);
                } else {
                  alert("Location not found. Please try again.");
                }
              } else if (intent.data.data.intent === "location") {
                let response = await axios.get("/api/coordinates", {
                  params: {
                    location: searchLocation,
                  },
                });
                let data = response.data;

                if (data.success) {
                  let [lat, lng] = data.data.coordinates;
                  console.log("Search result:", lat, lng);
                  flyToLocation(lat, lng);
                  setViewState({
                    latitude: lat,
                    longitude: lng,
                    zoom: 14,
                    bearing: 0,
                    pitch: 0,
                    padding: {},
                  });
                } else {
                  alert("Location not found. Please try again.");
                }
              }
              setSearching(false);
            }}
          >
            {searching ? (
              <BeatLoader color="#ffffff" size={6} speedMultiplier={1} />
            ) : (
              "Search"
            )}
          </button>
        </div>
        <div>
          {searchCategories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchCategories.map((category, index) => (
                <a
                  key={index}
                  className="text-sm text-white bg-slate-900 rounded-sm px-2 py-1"
                >
                  {category}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 mt-6">
          <h5 className="font-semibold text-lg">Organisation Information</h5>
          <div className="flex items-center">
            <Pin color="#35c789" />
            <span className="ml-2 text-sm text-gray-700">
              Organisation with user contributed information
            </span>
          </div>
          <div className="flex items-center">
            <Pin color="#2c7eff" />
            <span className="ml-2 text-sm text-gray-700">
              Organisation with near complete information
            </span>
          </div>
          <div className="flex items-center">
            <Pin color="#3f3d4b" />
            <span className="ml-2 text-sm text-gray-700">
              Organisation missing information
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
