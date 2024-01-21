import { useEffect, useState, useRef, useCallback } from "react";
import "@passageidentity/passage-elements/passage-auth";
import "@mappedin/mappedin-js/lib/mappedin.css";
import { useMemo } from "react";
import React from "react";
import "@mappedin/mappedin-js/lib/mappedin.css";
import useMapClick from "./hooks/useMapClick";
import useMapView from "./hooks/useMapView";
import useVenueMaker from "./hooks/useVenueMaker";

export default function Landing() {
  
  return (
    <div id="app">
      <div className="App">
        Landing Page
        <div>
          <passage-auth
            app-id={process.env.REACT_APP_PASSAGE_APP_ID}
          ></passage-auth>
        </div>
      </div>
      </div>
  );
}
