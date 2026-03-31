import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isGithubPages = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  base: isGithubPages ? "/quit-point-card/" : "/",
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0"
  }
});
