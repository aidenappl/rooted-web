// components/MapView.tsx
import Map, {
  Marker,
  NavigationControl,
  FullscreenControl,
  GeolocateControl,
  ScaleControl,
  Popup,
} from "react-map-gl/mapbox";
import Pin from "./Pin";
import { Organisation } from "@/types";
import { isValidUrl, normalizeUrl } from "@/tools/url.tools";
import Link from "next/link";

interface Props {
  viewState: {
    latitude: number;
    longitude: number;
    zoom: number;
    bearing: number;
    pitch: number;
  };
  ref: React.RefObject<any>;
  organisations: Organisation[];
  selectedOrg: Organisation | null;
  setSelectedOrg: (org: Organisation | null) => void;
  onMoveEnd: (e: any) => void;
}

const MapView = ({
  viewState,
  organisations,
  ref,
  selectedOrg,
  setSelectedOrg,
  onMoveEnd,
}: Props) => {
  return (
    <Map
      initialViewState={viewState}
      onMoveEnd={onMoveEnd}
      ref={ref}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      style={{ width: "100%", height: "100%" }}
    >
      <GeolocateControl position="top-left" />
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" />
      <ScaleControl />

      {organisations.map((org) => (
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
          {org.website && isValidUrl(org.website) ? (
            <Pin color="#2c7eff" />
          ) : org.has_contributed_information ? (
            <Pin color="#4dc491" />
          ) : (
            <Pin color="#3f3d4b" />
          )}
        </Marker>
      ))}

      {selectedOrg && (
        <Popup
          longitude={selectedOrg.location.lng}
          latitude={selectedOrg.location.lat}
          anchor="top"
          closeOnClick={true}
          onClose={() => setSelectedOrg(null)}
        >
          <div className="text-sm max-w-[200px]">
            <strong>{selectedOrg.name}</strong>
            <p className="line-clamp-3">{selectedOrg.description}</p>
            {selectedOrg.website && isValidUrl(selectedOrg.website) ? (
              <Link
                href={normalizeUrl(selectedOrg.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                Visit Website
              </Link>
            ) : null}
          </div>
        </Popup>
      )}
    </Map>
  );
};
export default MapView;
