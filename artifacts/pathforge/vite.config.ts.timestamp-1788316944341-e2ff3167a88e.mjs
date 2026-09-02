// ../pathforge/vite.config.ts
import path from "path";
import react from "file:///app/applet/node_modules/.bun/@vitejs+plugin-react@5.2.0+40ab4a1caf289ea0/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///app/applet/node_modules/.bun/@tailwindcss+vite@4.3.3+40ab4a1caf289ea0/node_modules/@tailwindcss/vite/dist/index.mjs";
import { defineConfig } from "file:///app/applet/node_modules/.bun/vite@7.3.6+b9f09b3ea69bbfb2/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "/app/applet/artifacts/pathforge";
var port = Number(process.env.PORT) || 3e3;
var basePath = process.env.BASE_PATH || "/";
var vite_config_default = defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("file:///app/applet/node_modules/.bun/@replit+vite-plugin-cartographer@0.5.21/node_modules/@replit/vite-plugin-cartographer/dist/index.mjs").then(
        (m) => m.cartographer({
          root: path.resolve(__vite_injected_original_dirname, "..")
        })
      ).catch(() => null),
      await import("file:///app/applet/node_modules/.bun/@replit+vite-plugin-dev-banner@0.1.2/node_modules/@replit/vite-plugin-dev-banner/dist/index.mjs").then(
        (m) => m.devBanner()
      ).catch(() => null)
    ] : []).filter(Boolean)
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src"),
      "@assets": path.resolve(
        __vite_injected_original_dirname,
        "..",
        "..",
        "attached_assets"
      )
    },
    dedupe: ["react", "react-dom"]
  },
  root: path.resolve(__vite_injected_original_dirname),
  build: {
    outDir: path.resolve(__vite_injected_original_dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: false
    }
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcGF0aGZvcmdlL3ZpdGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2FwcC9hcHBsZXQvYXJ0aWZhY3RzL3BhdGhmb3JnZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2FwcC9hcHBsZXQvYXJ0aWZhY3RzL3BhdGhmb3JnZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vYXBwL2FwcGxldC9hcnRpZmFjdHMvcGF0aGZvcmdlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuXG5jb25zdCBwb3J0ID0gTnVtYmVyKHByb2Nlc3MuZW52LlBPUlQpIHx8IDMwMDA7XG5jb25zdCBiYXNlUGF0aCA9IHByb2Nlc3MuZW52LkJBU0VfUEFUSCB8fCBcIi9cIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYmFzZTogYmFzZVBhdGgsXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHRhaWx3aW5kY3NzKCksXG4gICAgLi4uKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiZcbiAgICBwcm9jZXNzLmVudi5SRVBMX0lEICE9PSB1bmRlZmluZWRcbiAgICAgID8gW1xuICAgICAgICAgIGF3YWl0IGltcG9ydCgnQHJlcGxpdC92aXRlLXBsdWdpbi1jYXJ0b2dyYXBoZXInKS50aGVuKChtKSA9PlxuICAgICAgICAgICAgbS5jYXJ0b2dyYXBoZXIoe1xuICAgICAgICAgICAgICByb290OiBwYXRoLnJlc29sdmUoaW1wb3J0Lm1ldGEuZGlybmFtZSwgJy4uJyksXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICApLmNhdGNoKCgpID0+IG51bGwpLFxuICAgICAgICAgIGF3YWl0IGltcG9ydCgnQHJlcGxpdC92aXRlLXBsdWdpbi1kZXYtYmFubmVyJykudGhlbigobSkgPT5cbiAgICAgICAgICAgIG0uZGV2QmFubmVyKCksXG4gICAgICAgICAgKS5jYXRjaCgoKSA9PiBudWxsKSxcbiAgICAgICAgXVxuICAgICAgOiBbXSkuZmlsdGVyKEJvb2xlYW4pIGFzIGFueVtdLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKGltcG9ydC5tZXRhLmRpcm5hbWUsICdzcmMnKSxcbiAgICAgICdAYXNzZXRzJzogcGF0aC5yZXNvbHZlKFxuICAgICAgICBpbXBvcnQubWV0YS5kaXJuYW1lLFxuICAgICAgICAnLi4nLFxuICAgICAgICAnLi4nLFxuICAgICAgICAnYXR0YWNoZWRfYXNzZXRzJyxcbiAgICAgICksXG4gICAgfSxcbiAgICBkZWR1cGU6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXG4gIH0sXG4gIHJvb3Q6IHBhdGgucmVzb2x2ZShpbXBvcnQubWV0YS5kaXJuYW1lKSxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6IHBhdGgucmVzb2x2ZShpbXBvcnQubWV0YS5kaXJuYW1lLCAnZGlzdC9wdWJsaWMnKSxcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydCxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICBhbGxvd2VkSG9zdHM6IHRydWUsXG4gICAgZnM6IHtcbiAgICAgIHN0cmljdDogZmFsc2UsXG4gICAgfSxcbiAgfSxcbiAgcHJldmlldzoge1xuICAgIHBvcnQsXG4gICAgaG9zdDogJzAuMC4wLjAnLFxuICAgIGFsbG93ZWRIb3N0czogdHJ1ZSxcbiAgfSxcbn0pO1xuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStRLE9BQU8sVUFBVTtBQUNoUyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFDeEIsU0FBUyxvQkFBb0I7QUFIN0IsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTSxPQUFPLE9BQU8sUUFBUSxJQUFJLElBQUksS0FBSztBQUN6QyxJQUFNLFdBQVcsUUFBUSxJQUFJLGFBQWE7QUFFMUMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osSUFBSSxRQUFRLElBQUksYUFBYSxnQkFDN0IsUUFBUSxJQUFJLFlBQVksU0FDcEI7QUFBQSxNQUNFLE1BQU0sT0FBTywySUFBa0MsRUFBRTtBQUFBLFFBQUssQ0FBQyxNQUNyRCxFQUFFLGFBQWE7QUFBQSxVQUNiLE1BQU0sS0FBSyxRQUFRLGtDQUFxQixJQUFJO0FBQUEsUUFDOUMsQ0FBQztBQUFBLE1BQ0gsRUFBRSxNQUFNLE1BQU0sSUFBSTtBQUFBLE1BQ2xCLE1BQU0sT0FBTyxzSUFBZ0MsRUFBRTtBQUFBLFFBQUssQ0FBQyxNQUNuRCxFQUFFLFVBQVU7QUFBQSxNQUNkLEVBQUUsTUFBTSxNQUFNLElBQUk7QUFBQSxJQUNwQixJQUNBLENBQUMsR0FBRyxPQUFPLE9BQU87QUFBQSxFQUN4QjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQXFCLEtBQUs7QUFBQSxNQUM1QyxXQUFXLEtBQUs7QUFBQSxRQUNkO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxFQUMvQjtBQUFBLEVBQ0EsTUFBTSxLQUFLLFFBQVEsZ0NBQW1CO0FBQUEsRUFDdEMsT0FBTztBQUFBLElBQ0wsUUFBUSxLQUFLLFFBQVEsa0NBQXFCLGFBQWE7QUFBQSxJQUN2RCxhQUFhO0FBQUEsRUFDZjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ047QUFBQSxJQUNBLFlBQVk7QUFBQSxJQUNaLE1BQU07QUFBQSxJQUNOLGNBQWM7QUFBQSxJQUNkLElBQUk7QUFBQSxNQUNGLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1A7QUFBQSxJQUNBLE1BQU07QUFBQSxJQUNOLGNBQWM7QUFBQSxFQUNoQjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
