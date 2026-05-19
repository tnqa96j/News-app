import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  /* 跨域設置 */
  server: {
    // vite proxy只有本機開發server有用，部署上線之後就消失
    proxy: {
      "/api": {
        target: "http://localhost:7100",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups", // 允許 popup 通訊
    },
  },
});
