import { defineConfig } from 'vite'
import ds3 from '@consensys/ds3-config/vite';
import themeConfig from "./theme.config";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    ds3(themeConfig),
    svgr(),
  ],
  build: {
    // https://stackoverflow.com/questions/77421447/how-to-solve-require-is-not-defined-in-vite
    commonjsOptions: { transformMixedEsModules: true },
  },
})
