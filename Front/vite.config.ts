import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Generate bundle analysis (HTML) when BUILD_ANALYZE=1 is set
    process.env.BUILD_ANALYZE === '1' && visualizer({ filename: 'dist/stats.html', open: false }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor.react';
            if (id.includes('lucide-react')) return 'vendor.icons';
            if (id.includes('recharts')) return 'vendor.recharts';
            if (id.includes('date-fns')) return 'vendor.datefns';
            return 'vendor';
          }
        }
      }
    }
  }
}));
