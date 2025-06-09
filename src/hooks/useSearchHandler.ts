import { api, nextAPI } from "@/tools/axios.tools";

export const useSearchHandler = ({
  searchLocation = "",
  setSearchCategories = (cats: any) => {},
  setOrganisations = (orgs: any) => {},
  setSelectedOrg = (org: any) => {},
  setViewState = (state: any) => {},
  flyToLocation = (lat: number, lng: number) => {},
}) => {
  const handleSearch = async () => {
    let intentRes = await nextAPI.get("/api/intent", {
      params: { message: searchLocation },
    });

    if (!intentRes.data.success) {
      alert("Error determining intent. Please try again.");
      return;
    }

    const intent = intentRes.data.data.intent;

    if (intent === "deep search") {
      const locRes = await nextAPI.get("/api/coordinates", {
        params: { location: searchLocation },
      });

      if (!locRes.data.success) {
        alert("Location not found. Please try again.");
        return;
      }

      const [lat, lng] = locRes.data.data.coordinates;
      flyToLocation(lat, lng);
      setViewState({
        latitude: lat,
        longitude: lng,
        zoom: 15,
        bearing: 0,
        pitch: 0,
        padding: {},
      });

      const connectRes = await nextAPI.get("/api/connect", {
        params: { message: searchLocation },
      });

      if (connectRes.data.success) {
        const cats = connectRes.data.data.categories;
        setSearchCategories(cats);
        const orgsRes = await api.get("/organisations", {
          params: {
            lat,
            lng,
            requires: "coordinates",
            radius: 10000,
            categories: cats.join(","),
          },
        });

        if (orgsRes.data.success) {
          setSelectedOrg(null);
          setOrganisations(orgsRes.data.data);
        } else {
          alert("Error fetching organisations.");
        }
      } else {
        alert("Connect failed.");
      }
    }

    if (intent === "search") {
      const res = await nextAPI.get("/api/connect", {
        params: { message: searchLocation },
      });
      if (res.data.success) {
        setSearchCategories(res.data.data.categories);
      }
    }

    if (intent === "location") {
      const res = await nextAPI.get("/api/coordinates", {
        params: { location: searchLocation },
      });
      if (res.data.success) {
        const [lat, lng] = res.data.data.coordinates;
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
        alert("Location not found.");
      }
    }
  };

  return handleSearch;
};
