import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

// Mount the React app
const rootElement = document.getElementById("cms-root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
