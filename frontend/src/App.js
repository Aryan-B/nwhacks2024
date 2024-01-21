import React from "react";

import Form from "./components/form";
import List from "./components/list";
import Item from "./components/item";
import Navigation from "./components/nav";
import Stat from "./components/stat";

import "./App.css";

import Login from "./components/Login";
import Layout from "./components/Layout";
import Missing from "./components/Missing";
import Unauthorized from "./components/Unauthorized";
import { Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./components/protectedRoutes";
import Landing from "./components/Landing";
import Navigate from "./components/Navigate";

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
        <Route path="navigate" element={<Navigate />}>
          <Route path="*" element={<Missing />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="unauthorized" element={<Unauthorized />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
