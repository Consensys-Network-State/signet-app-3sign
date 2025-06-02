import { defineConfig } from 'vite'
import cui from '@consensys/ui-config/vite';
import themeConfig from "./theme.config";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  resolve: {
    alias: {
      // Polyfill Buffer
      buffer: 'buffer/',
    },
  },
  define: {
    // Required for Buffer polyfill
    global: {},
    'process.env': {},
  },
  plugins: [
    cui(themeConfig),
    svgr(),
  ],
  build: { // https://stackoverflow.com/questions/77421447/how-to-solve-require-is-not-defined-in-vite
    commonjsOptions: { transformMixedEsModules: true },
    rollupOptions: {
      output: {
        manualChunks: {
          // Create a separate chunk for buffer
          buffer: ['buffer'],
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
    // Include buffer in optimization
    include: ['buffer'],
  }
})
