import { useEffect, useState, useRef, useCallback } from "react";
import "@passageidentity/passage-elements/passage-auth";
import "@mappedin/mappedin-js/lib/mappedin.css";
import { useMemo } from "react";
import React from "react";
import "@mappedin/mappedin-js/lib/mappedin.css";
import useMapClick from "./hooks/useMapClick";
import useMapView from "./hooks/useMapView";
import useVenueMaker from "./hooks/useVenueMaker";

export default function Layout() {
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

  return (
    <div id="app">
      <div className="App">
        Layout Page
        
      </div>
      <div id="ui">
        {venue?.venue.name ?? "Loading..."}
        {venue && (
          <select
            onChange={(e) => {
              if (!mapView || !venue) {
                return;
              }
              const floor = venue.maps.find((map) => map.id === e.target.value);
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
  );
}
