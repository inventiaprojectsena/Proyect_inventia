import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth }           from "./context/AuthContext";
import { HistorialProvider }               from "./context/HistorialContext";
import Header        from "./components/Header";
import Sidebar       from "./components/Sidebar";
import Inicio        from "./components/Inicio";
import Dashboard     from "./components/Dashboard";
import Historial     from "./components/Historial";
import Login         from "./components/Login";
import RutaProtegida from "./components/RutaProtegida";
import "bootstrap/dist/css/bootstrap.min.css";

function Layout({ children }) {
  return (
    <>
      <Header />
      <div style={{ display: "flex", paddingTop: "56px" }}>
        <Sidebar />
        <main style={{ marginLeft: "220px", flex: 1, minHeight: "calc(100vh - 56px)" }}>
          {children}
        </main>
      </div>
    </>
  );
}

function RutaPublica({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

function App() {
  return (
    <AuthProvider>
      <HistorialProvider>
        <Router>
          <Routes>

            <Route
              path="/login"
              element={<RutaPublica><Login /></RutaPublica>}
            />

            <Route
              path="/"
              element={<RutaProtegida><Layout><Inicio /></Layout></RutaProtegida>}
            />

            <Route
              path="/dashboard"
              element={<RutaProtegida><Layout><Dashboard /></Layout></RutaProtegida>}
            />

            <Route
              path="/historial"
              element={<RutaProtegida><Layout><Historial /></Layout></RutaProtegida>}
            />

            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Router>
      </HistorialProvider>
    </AuthProvider>
  );
}

export default App;