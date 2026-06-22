import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const FB_APP_ID = (process.env.VITE_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID || "").trim();

export default defineConfig({
  plugins: [
    react(),
    {
      name: "inject-fb-app-id",
      transformIndexHtml(html) {
        if (!FB_APP_ID || !/^\d+$/.test(FB_APP_ID)) return html;
        if (html.includes("fb:app_id")) return html;
        return html.replace(
          '<meta property="og:type"',
          `<meta property="fb:app_id" content="${FB_APP_ID}" />\n    <meta property="og:type"`,
        );
      },
    },
  ],
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) {
            return "react";
          }
          if (id.includes("/src/admin/")) {
            return "admin";
          }
        },
      },
    },
  },
});
