// Importamos React.
import React from "react";
import ReactDOM from "react-dom/client";

// Importamos la app principal.
import App from "./App.jsx";

// Renderizamos la app dentro del div root del HTML.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);