import React from "react";

import "./App.css";
import Missing from "./components/Missing";
import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import Layout from "./components/Layout";
import ProtectedRoutes from "./components/protectedRoutes";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing/>}>
          <Route path="*" element={<Missing />} />
        </Route>
        <Route path="home" element={<Layout />}>
          <Route path="*" element={<Missing />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
