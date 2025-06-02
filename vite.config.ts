import { defineConfig } from 'vite'
import cui from '@consensys/ui-config/vite';
import themeConfig from "./theme.config";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    cui(themeConfig),
    svgr(),
  ],
  build: {
    // https://stackoverflow.com/questions/77421447/how-to-solve-require-is-not-defined-in-vite
    commonjsOptions: { transformMixedEsModules: true },
  },
})
