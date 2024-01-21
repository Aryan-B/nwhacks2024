import { useEffect, useState, useRef, useCallback } from "react";
import "@passageidentity/passage-elements/passage-auth";
import "@mappedin/mappedin-js/lib/mappedin.css";
import { useMemo } from "react";
import React from "react";
import "@mappedin/mappedin-js/lib/mappedin.css";
import useMapClick from "./hooks/useMapClick";
import useMapView from "./hooks/useMapView";
import useVenueMaker from "./hooks/useVenueMaker";
import "../styles/layout.css";
import { Dropdown, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
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

  const mapOptions = useMemo(
    () => ({
      backgroundColor: "#dda1e6", // Background colour behind the map
    }),
    []
  );

  const { elementRef, mapView } = useMapView(venue, mapOptions);

  const handleNavigateClick = () => {
    navigate('/navigate');
  };

  useEffect(() => {
    if (!mapView || !venue) {
      return;
    }

    mapView.addInteractivePolygonsForAllLocations();

    venue.locations.forEach((location) => {
      // An obstruction is something like a desk
      if (location.id.includes("obstruction")) {
        location.polygons.forEach((polygon) => {
          mapView.setPolygonHoverColor(polygon, "#00ff00");
        });
      } else {
        // if booked, hover red
        // else, hover green?
        location.polygons.forEach((polygon) => {
          mapView.setPolygonHoverColor(polygon, "#fff8a8");
        });
      }
    });


    mapView.FloatingLabels.labelAllLocations({
      interactive: true // Make labels interactive
    });

  }, [mapView, venue]);

  useEffect(() => {
    if (mapView && selectedFloor) {
      const floor = venue?.maps.find((map) => map.id === selectedFloor);
      if (floor) {
        mapView.setMap(floor);
        setSelectedFloor(floor.name);
      }
    }
  }, [mapView, selectedFloor, venue]);

  useMapClick(mapView, (props) => {
    if (!mapView || !venue) {
      return;
    }

    // Interact with clicked markers
    for (const marker of props.markers) {
      console.log(`[useMapClick] Clicked marker ID "${marker.id}"`);
      mapView.Markers.remove(marker.id);
      return;
    }

    // Interact with clicked Floating Labels
    for (const label of props.floatingLabels) {
      console.log(`[useMapClick] Clicked label "${label.text}"`);

      if (label.node) {
        mapView.FloatingLabels.remove(label.node);
      }
      return;
    }

    // Interact with clicked polygons
    for (const polygon of props.polygons) {
      console.log(`[useMapClick] Clicked polygon ID "${polygon.id}"`);

      // Get location details for the clicked polygon
      const location = mapView.getPrimaryLocationForPolygon(polygon);

      // Convert the click information to a coordinate on the map
      const clickedCoordinate = mapView.currentMap.createCoordinate(
        props.position.latitude,
        props.position.longitude
      );

      // And add a new Marker where we clicked
      mapView.Markers.add(
        clickedCoordinate,
        // Provide a HTML template string for the Marker appearance
        `<div class="marker">${location.name}</div>`,
        {
          interactive: true, // Make markers clickable
          // rank: COLLISION_RANKING_TIERS.ALWAYS_VISIBLE, // Marker collision priority
          // anchor: MARKER_ANCHOR.TOP, // Position of the Marker
        }
      );
      return;
    }
  });


  return (
    <div id="app" className="AppTest">
      <div id="ui">
        <div className="location-name">
          {venue?.venue.name ?? "Loading..."}
          <Dropdown onSelect={(eventKey) => setSelectedFloor(eventKey)}>
            <Dropdown.Toggle variant="info" id="dropdown-basic">
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
            <Button variant="info" onClick={handleNavigateClick}>
              Navigate
            </Button>
          </div>
        </div>
      </div>

      <div id="map-container" ref={elementRef}></div>
    </div>
  );
}