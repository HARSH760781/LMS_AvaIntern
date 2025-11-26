import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["xlsx"],
  },
  build: {
    commonjsOptions: {
      include: [/xlsx/, /node_modules/],
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: [".ngrok-free.app"],
  },
});
