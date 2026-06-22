import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { applyAdminNoIndex } from "./lib/pageMeta";

const AdminApp = lazy(() => import("./admin/AdminApp"));

const path = window.location.pathname.replace(/\/$/, "") || "/";
const isAdmin = path === "/admin";

if (isAdmin) {
  applyAdminNoIndex();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense
        fallback={
          <div className="app-page min-h-screen flex items-center justify-center">
            <div
              className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin"
              aria-label="Loading"
            />
          </div>
        }
      >
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
