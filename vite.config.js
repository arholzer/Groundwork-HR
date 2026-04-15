import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        consultation: resolve(__dirname, "consultation.html"),
        admin: resolve(__dirname, "admin.html"),
      },
    },
  },
});
