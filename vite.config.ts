import { defineConfig, UserConfigExport } from 'vite'
import ds3Plugin from '@ds3/core/vite';
import ds3Config from "./ds3.config";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ command }) => {
  return {
    resolve: {
      alias: {
        // Polyfill Buffer
        buffer: 'buffer/',
      },
    },
    define: {
      // Required for Buffer polyfill
      'global': {},
      'process.env': {},
    },
    plugins: [
      ds3Plugin(command, ds3Config),
      svgr(),
    ],
    build: { // https://stackoverflow.com/questions/77421447/how-to-solve-require-is-not-defined-in-vite
      commonjsOptions: { transformMixedEsModules: true },
      rollupOptions: {
        plugins: [],
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
  }
}) as UserConfigExport;
