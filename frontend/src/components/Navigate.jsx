import "@mappedin/mappedin-js/lib/mappedin.css";
import { useEffect, useMemo, useState } from "react";
import useMapChanged from "./hooks/useMapChanged";
import useMapView from "./hooks/useMapView";
import useVenueMaker from "./hooks/useVenueMaker";
import { Dropdown, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

/* This demo shows you how to draw a path between two locations. */
export default function NavigationExample() {
    const navigate = useNavigate();

    const handleOverviewClick = () => {
        navigate('/home');
    };

    const credentials = useMemo(
        () => ({
            mapId: "65ac2d5aca641a9a1399dc0e",
            key: "65ac39ef04c23e7916b1d0b6",
            secret:
                "f596a8444c81b41d3b385ea92871675ccef0ee25383c2a301de7a7ec47e003d0"
        }),
        []
    );
    const venue = useVenueMaker(credentials);

    const mapOptions = useMemo(
        () => ({
            backgroundColor: "#dda1e6",
            xRayPath: true, // X Ray enables seeing the path through walls
            multiBufferRendering: true, // Multi buffer rendering is necessary for features like x ray
        }),
        []
    );
    const { elementRef, mapView } = useMapView(venue, mapOptions);

    const [selectedFloor, setSelectedFloor] = useState("Select Floor"); 

    useEffect(() => {
        if (mapView && selectedFloor) {
          const floor = venue?.maps.find((map) => map.id === selectedFloor);
          if (floor) {
            mapView.setMap(floor);
            setSelectedFloor(floor.name);
          }
        }
      }, [mapView, selectedFloor, venue]);

    /* Start navigation when the map loads */
    useEffect(() => {
        if (!mapView || !venue) {
            console.log("return")
            return;
        }

        /*
         * All maps made in Maker will contain a location called "footprintcomponent"
         * which represents the exterior "footprint"
         * You can use this location to get the nearest entrance or exit
         */

        const startLocation = venue.locations.find((location) =>
            location.id.includes("091")
        );

        // Navigate to some location on another floor
        const endLocation = venue.locations.find((location) =>
            location.id.includes("104")
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
              <div class="departure-marker">${props.location ? props.location.name : "Departure"
                            }</div>
              ${props.icon}
              </div>`;
                    },
                    destinationMarkerTemplate: (props) => {
                        // The destination marker is the pin at the end location
                        return `<div style="display: flex; flex-direction: column; justify-items: center; align-items: center;">
              <div class="destination-marker">${props.location ? props.location.name : "Destination"
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
                        pulseIterations: Infinity // How many times to play the pulse animation
                    }
                });

                // Set the map (floor level) to start at the beginning of the path
                mapView.setMap(directions.path[0].map);
            }
        }
        // Update the selected map state
        setSelectedMap(mapView.currentMap);
    }, [mapView, venue]);

    // Track the selected map with state, for the UI
    const [selectedMap, setSelectedMap] = useState();

    /* Monitor floor level changes and update the UI */
    useMapChanged(mapView, (map) => {
        setSelectedMap(map);
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
                        <Button variant="info" onClick={handleOverviewClick}>
                            Overview
                        </Button>
                    </div>
                </div>
            </div>

            <div id="map-container" ref={elementRef}></div>
        </div>
    );
}
