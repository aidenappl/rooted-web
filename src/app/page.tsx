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
  const [searching, setSearching] = useState<boolean>(false);
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
      center: [lng, lat], // [lng, lat] order
      zoom,
      duration: 2000, // animation duration in ms
      essential: true, // respect prefers-reduced-motion
    });
  };

  return (
    <div className="min-h-[calc(100vh-100px)]">
      <div className="w-full h-[600px]">
        <div className="w-full h-full flex gap-2">
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
          <div className="w-[1/3] h-full overflow-y-auto">
            <h3 className="text-xl">Results</h3>
            <div className="flex flex-col gap-1 mt-2">
              {organisations.map((org) => (
                <div
                  className="bg-slate-800 text-white p-2  text-sm rounded-sm shadow-sm "
                  key={org.id}
                >
                  {org.name}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-[400px] mt-5 flex gap-2">
          <input
            className="border border-gray-300 rounded p-2 w-full"
            type="text"
            onChange={(e) => {
              setSearchLocation(e.target.value);
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                document.getElementById("search-button")?.click();
              }
            }}
            value={searchLocation}
            placeholder="What are you looking for?"
          />
          <button
            id="search-button"
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
              if (intent.data.data.intent === "deep search") {
                let locRes = await axios.get("/api/coordinates", {
                  params: {
                    location: searchLocation,
                  },
                });
                let locData = locRes.data;

                let [lat, lng]: number[] | null[] = [null, null];
                if (locData.success) {
                  [lat, lng] = locData.data.coordinates;
                  console.log("Deep search result:", lat, lng);
                  flyToLocation(lat!, lng!);
                  setViewState({
                    latitude: lat!,
                    longitude: lng!,
                    zoom: 15,
                    bearing: 0,
                    pitch: 0,
                    padding: {},
                  });
                } else {
                  alert("Location not found. Please try again.");
                }
                let response = await axios.get("/api/connect", {
                  params: {
                    message: searchLocation,
                  },
                });
                let data = response.data;

                if (data.success) {
                  console.log("Connect result:", data);
                  setSearchCategories(data.data.categories);
                  //  do API call to get organisations
                  if (lat && lng) {
                    let orgsResponse = await axios.get(
                      "http://10.15.10.208:8000/organisations",
                      {
                        params: {
                          lat,
                          lng,
                          requires: "coordinates",
                          radius: 10000,
                          categories: data.data.categories.join(","),
                        },
                        headers: {
                          "Content-Type": "application/json",
                        },
                        validateStatus: () => true,
                      }
                    );
                    if (orgsResponse.data.success) {
                      console.log("Organisations:", orgsResponse.data.data);
                      setSelectedOrg(null);
                      setOrganisations(orgsResponse.data.data);
                    } else {
                      alert("Error fetching organisations. Please try again.");
                    }
                  }
                } else {
                  alert("Location not found. Please try again.");
                }
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
                    zoom: 15,
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
            <>
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
              <div>
                <button
                  className="mt-2 text-sm text-black bg-slate-300 rounded-sm px-2 py-1"
                  onClick={() => {
                    setSearchCategories([]);
                    setOrganisations([]);
                    setSelectedOrg(null);
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </>
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
