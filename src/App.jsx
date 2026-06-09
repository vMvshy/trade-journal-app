// Importamos React Router para manejar las páginas.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importamos el provider de autenticación.
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

// Importamos las páginas.
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
// Importamos los estilos principales.
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}