import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("leaflet") || id.includes("react-leaflet")) return "map-vendor";
          if (id.includes("@tanstack/react-query")) return "query-vendor";
          if (id.includes("socket.io-client") || id.includes("engine.io-client") || id.includes("@socket.io")) {
            return "socket-vendor";
          }
          if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) return "react-vendor";
          return undefined;
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:3001",
      "/socket.io": {
        target: "http://127.0.0.1:3001",
        ws: true
      }
    }
  }
});
