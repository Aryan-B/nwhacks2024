import { useEffect, useState, useRef, useCallback } from "react";
import "@passageidentity/passage-elements/passage-auth";
import "@mappedin/mappedin-js/lib/mappedin.css";
import React from "react";
import "../styles/landing.css";
import { useMemo } from "react";
import useMapView from "./hooks/useMapView";
import useVenueMaker from "./hooks/useVenueMaker";
import axios from "axios";

export default function Landing() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [result, setResult] = useState({
    isLoading: true,
    isAuthorized: false,
    username: "",
  });

  const API_URL = "http://localhost:8080";

  const handleClick = () => {
    console.log("clicked");
    setShowSidebar(!showSidebar);
  };

  const handleLogout = () => {
    axios.get(`${API_URL}/logout`).then((response) => {
      console.log(response);
      const { authStatus, identifier } = response.data;
      if (authStatus === "success") {
        setResult({
          isLoading: false,
          isAuthorized: authStatus,
          username: identifier,
        });
      } else {
        setResult({
          isLoading: false,
          isAuthorized: false,
          username: "",
        });
      }
    });
  };

  const credentials = useMemo(
    () => ({
      mapId: "65ac2d5aca641a9a1399dc0e",
      key: "65ac39ef04c23e7916b1d0b6",
      secret:
        "f596a8444c81b41d3b385ea92871675ccef0ee25383c2a301de7a7ec47e003d0",
    }),
    []
  );
  const venue = useVenueMaker(credentials);
  const mapOptions = useMemo(
    () => ({
      backgroundColor: "#CFCFCF", // Background colour behind the map
    }),
    []
  );
  const { elementRef, mapView } = useMapView(venue, mapOptions);

  useEffect(() => {
    if (!mapView || !venue) {
      return;
    }
    mapView.FloatingLabels.labelAllLocations();
  }, [mapView, venue]);

  useEffect(() => {
    const authToken = localStorage.getItem("psg_auth_token");
    console.log(authToken);
    if (!authToken) {
      console.log("verifying since there is no auth token");
      axios.get(`${API_URL}/verify`,{
        withCredentials: true,
    }).then((response) => {
        console.log(response);
        const { authStatus, identifier } = response.data;
        if (authStatus === "success") {
          console.log("success");
          setResult({
            isLoading: false,
            isAuthorized: authStatus,
            username: identifier,
          });
        } else {
          setResult({
            isLoading: false,
            isAuthorized: false,
            username: "",
          });
        }
      });
      return;
    }
    axios
      .post(`${API_URL}/login`, null, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        const { authStatus, identifier } = response.data;
        console.log(authStatus, identifier);
        if (authStatus === "success") {
          setResult({
            isLoading: false,
            isAuthorized: authStatus,
            username: identifier,
          });
        } else {
          setResult({
            isLoading: false,
            isAuthorized: false,
            username: "",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        setResult({
          isLoading: false,
          isAuthorized: false,
          username: "",
        });
      });
    localStorage.removeItem("psg_auth_token");
     
  }, []);

  return (
    <div id="app">
      <div className="App">
        <div className="top-right-container">
          <button onClick={handleClick} className="passkey-button" />

          {result.isAuthorized ? (
            <div>
              <div>Logged in as {result.username}</div>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div
              id="ui"
              className={`passage-form ${showSidebar ? "show" : "hide"}`}
            >
              <passage-auth
                app-id={process.env.REACT_APP_PASSAGE_APP_ID}
              ></passage-auth>
            </div>
          )}
        </div>

        <div id="ui">
          {venue?.venue.name ?? "Loading..."}
          {venue && (
            <select
              onChange={(e) => {
                if (!mapView || !venue) {
                  return;
                }
                const floor = venue.maps.find(
                  (map) => map.id === e.target.value
                );
                if (floor) {
                  mapView.setMap(floor);
                }
              }}
            >
              {venue?.maps.map((level, index) => {
                return (
                  <option value={level.id} key={index}>
                    {level.name}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        <div id="map-container" ref={elementRef}></div>
      </div>
    </div>
  );
}
