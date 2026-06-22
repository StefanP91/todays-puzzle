import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AdminApp from "./admin/AdminApp";
import "./index.css";

const path = window.location.pathname.replace(/\/$/, "") || "/";
const isAdmin = path === "/admin";

createRoot(document.getElementById("root")!).render(
  <StrictMode>{isAdmin ? <AdminApp /> : <App />}</StrictMode>
);
