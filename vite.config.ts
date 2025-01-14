import { defineConfig, PluginOption } from 'vite'
import ds3Plugin from '@ds3/config/vite';
import ds3Config from "./ds3.config";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ command }) => {
  return {
    plugins: [
      ...(ds3Plugin(command, ds3Config) as PluginOption[]),
      svgr() as PluginOption,
    ],
    build: { // https://stackoverflow.com/questions/77421447/how-to-solve-require-is-not-defined-in-vite
      commonjsOptions: { transformMixedEsModules: true }
    }
  }
});
