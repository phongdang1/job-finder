import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // optimizeDeps: {
  //   exclude: ["chunk-D6VE73IO.js?v=d25dce0c"],
  // },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/auth/google": {
        target: "https://be-jobfinder-final.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
