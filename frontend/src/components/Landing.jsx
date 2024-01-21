import { useEffect, useState, useRef, useCallback } from "react";
import "@passageidentity/passage-elements/passage-auth";
import "@mappedin/mappedin-js/lib/mappedin.css";
import React from "react";
import "../styles/landing.css";
import { useMemo } from "react";
import useMapView from "./hooks/useMapView";
import useVenueMaker from "./hooks/useVenueMaker";
import axios from "axios";
import useMapClick from "./hooks/useMapClick";
import "../styles/layout.css";
import { Dropdown, Button } from "react-bootstrap";
import useMapChanged from "./hooks/useMapChanged";
import Menu from "./menu";

export default function Landing() {
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

  const [selectedFloor, setSelectedFloor] = useState("Select Floor");
  const [isOverviewMode, setIsOverviewMode] = useState(true);
  const [selectedMap, setSelectedMap] = useState();
  const [startLoc, setStartLoc] = useState("091");
  const [endLoc, setEndLoc] = useState("104");
  const [lastClicked, setLastClicked] = useState(true);

  const mapOptions = useMemo(
    () => ({
      backgroundColor: "#dda1e6",
      xRayPath: true,
      multiBufferRendering: true,
    }),
    []
  );

  const { elementRef, mapView } = useMapView(venue, mapOptions);

  const handleNavigateClick = () => {
    setIsOverviewMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    if (!mapView || !venue) {
      return;
    }

    if (isOverviewMode) {
      // reset from nav
      mapView.Journey.clear();

      // apply overview
      mapView.addInteractivePolygonsForAllLocations();

      venue.locations.forEach((location) => {
        const green = ["008", "029"];
        const yellow = ["014", "001"];
        const red = ["011", "Cube"];
        const gray = ["067", "093"];

        for (const r of green) {
          if (location.id.includes(r)) {
            location.polygons.forEach((polygon) => {
              mapView.setPolygonColor(polygon, "#46e83a");
            });
          }
        }
        for (const r of yellow) {
          if (location.id.includes(r)) {
            location.polygons.forEach((polygon) => {
              mapView.setPolygonColor(polygon, "#faec52");
            });
          }
        }
        for (const r of red) {
          if (location.id.includes(r)) {
            location.polygons.forEach((polygon) => {
              mapView.setPolygonColor(polygon, "#f7332d");
            });
          }
        }
        for (const r of gray) {
          if (location.id.includes(r)) {
            location.polygons.forEach((polygon) => {
              mapView.setPolygonColor(polygon, "#a19f9f");
            });
          }
        }
      });

      mapView.FloatingLabels.labelAllLocations({
        interactive: true, // Make labels interactive
      });
    }
  }, [mapView, venue, isOverviewMode]);

  /* Monitor floor level changes and update the UI */
  useMapChanged(mapView, (map) => {
    setSelectedMap(map);
  });

  useEffect(() => {
    if (!mapView || !venue) {
      return;
    }

    if (!isOverviewMode) {
      // reset from overview
      venue.locations.forEach((location) => {
        location.polygons.forEach((polygon) => {
          mapView.clearAllPolygonColors();
        });
      });

      // apply nav
      const startLocation = venue.locations.find((location) =>
        location.id.includes(startLoc)
      );
      // Navigate to some location on another floor
      const endLocation = venue.locations.find((location) =>
        location.id.includes(endLoc)
      );
      if (startLocation && endLocation) {
        // Generate a route between these two locations
        const directions = startLocation.directionsTo(endLocation);
        if (directions && directions.path.length > 0) {
          // The Journey class draws the path & can be configured with a few options
          mapView.Journey.draw(directions, {
            polygonHighlightColor: "#140575", // Start and end polygons colour
            departureMarkerTemplate: (props) => {
              // The departure marker is the person at the start location
              return `<div style="display: flex; flex-direction: column; justify-items: center; align-items: center;">
          <div class="departure-marker">${
            props.location ? props.location.name : "Departure"
          }</div>
          ${props.icon}
          </div>`;
            },
            destinationMarkerTemplate: (props) => {
              // The destination marker is the pin at the end location
              return `<div style="display: flex; flex-direction: column; justify-items: center; align-items: center;">
          <div class="destination-marker">${
            props.location ? props.location.name : "Destination"
          }</div>
          ${props.icon}
          </div>`;
            },
            connectionTemplate: (props) => {
              // The connection marker is the button to switch floors on the map
              return `<div class="connection-marker">Take ${props.type} ${props.icon}</div>`;
            },
            pathOptions: {
              nearRadius: 0.25, // The path size in metres at the nearest zoom
              farRadius: 1, // The path size in metres at the furthest zoom
              color: "#40A9FF", // Path colour
              displayArrowsOnPath: false, // Arrow animation on path
              showPulse: true, // Pulse animation on path
              pulseIterations: Infinity, // How many times to play the pulse animation
            },
          });

          // Set the map (floor level) to start at the beginning of the path
          mapView.setMap(directions.path[0].map);
        }
      }
      // Update the selected map state
      setSelectedMap(mapView.currentMap);
    }
  }, [mapView, venue, isOverviewMode, startLoc, endLoc]);

  useMapClick(mapView, (props) => {
    if (!isOverviewMode) {
      if (!mapView || !venue) {
        return;
      }

      for (const polygon of props.polygons) {
        const location = mapView.getPrimaryLocationForPolygon(polygon);
        if (lastClicked) {
          setStartLoc(location.name);
        } else {
          setEndLoc(location.name);
        }
        setLastClicked((prevMode) => !prevMode);
        return;
      }
    }
  });

  useEffect(() => {
    if (mapView && selectedFloor) {
      const floor = venue?.maps.find((map) => map.id === selectedFloor);
      if (floor) {
        mapView.setMap(floor);
        setSelectedFloor(floor.name);
      }
    }
  }, [mapView, selectedFloor, venue, startLoc, endLoc]);

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
    setShowSidebar(false);
    axios
      .get(`${API_URL}/logout`, {
        withCredentials: true,
      })
      .then((response) => {
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

  useEffect(() => {
    const authToken = localStorage.getItem("psg_auth_token");
    console.log(authToken);
    if (!authToken) {
      console.log("verifying since there is no auth token");
      axios
        .get(`${API_URL}/verify`, {
          withCredentials: true,
        })
        .then((response) => {
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
            <div className={`passage-form ${showSidebar ? "show" : "hide"}`}>
              <div className="profile-info-container">
                <div>
                  Logged in as <br />
                  {result.username}
                </div>
                <button onClick={handleLogout}>Logout</button>
              </div>
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
          <Menu />
          <div className="location-name">
            {venue?.venue.name ?? "Loading..."}
          </div>
        </div>
        <div className="floor-container">
        <Dropdown onSelect={(eventKey) => setSelectedFloor(eventKey)}>
              <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                {selectedFloor}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {venue &&
                  venue.maps.map((level, index) => (
                    <Dropdown.Item key={index} eventKey={level.id}>
                      {level.name}
                    </Dropdown.Item>
                  ))}
              </Dropdown.Menu>
            </Dropdown>
            <div className="navigate-button">
              <Button variant="secondary" onClick={handleNavigateClick}>
                {isOverviewMode ? "Navigate" : "Overview"}
              </Button>
            </div>
        </div>

        <div id="map-container" ref={elementRef}></div>
      </div>
    </div>
  );
}
