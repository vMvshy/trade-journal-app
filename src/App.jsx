// Importamos React Router para manejar las páginas.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importamos Speed Insights de Vercel.
import { SpeedInsights } from "@vercel/speed-insights/react";

// Importamos el provider de autenticación.
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

// Importamos las páginas.
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import NewTrade from "./pages/NewTrade";
import Notes from "./pages/Notes";
import Profile from "./pages/Profile";
import TradeDetail from "./pages/TradeDetail";
import EditTrade from "./pages/EditTrade";
import EditNote from "./pages/EditNote";

// Importamos los estilos principales.
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Página pública principal */}
          <Route path="/" element={<Landing />} />

          {/* También dejamos /home como respaldo para abrir la landing */}
          <Route path="/home" element={<Landing />} />

          {/* Páginas públicas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Páginas privadas de la app */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <Journal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/new-trade"
            element={
              <ProtectedRoute>
                <NewTrade />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trade/:id"
            element={
              <ProtectedRoute>
                <TradeDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/trade/:id/edit"
            element={
              <ProtectedRoute>
                <EditTrade />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notes/:id/edit"
            element={
              <ProtectedRoute>
                <EditNote />
              </ProtectedRoute>
            }
          />

          {/* Si alguien entra a una ruta que no existe, vuelve a la landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Vercel Speed Insights */}
        <SpeedInsights />
      </AuthProvider>
    </BrowserRouter>
  );
}