

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext";
import { RatesProvider } from "./context/RatesContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RatesProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </RatesProvider>
  </StrictMode>
);
