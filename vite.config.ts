import { defineConfig, UserConfigExport } from 'vite'
import ds3Plugin from '@ds3/config/vite';
import ds3Config from "./ds3.config";
import svgr from "vite-plugin-svgr";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

export default defineConfig((({ command }) => {
  return {
    plugins: [
      ...(ds3Plugin(command, ds3Config)),
      svgr(),
    ],
    build: { // https://stackoverflow.com/questions/77421447/how-to-solve-require-is-not-defined-in-vite
      commonjsOptions: { transformMixedEsModules: true }
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis'
        },
        // Enable esbuild polyfill plugins
        plugins: [
          NodeGlobalsPolyfillPlugin({
            buffer: true
          })
        ]
      }
    }
  }
}) as UserConfigExport);
