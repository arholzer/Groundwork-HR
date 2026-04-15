import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Consultation from "./Consultation.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Consultation />
  </StrictMode>
);
