import ds3 from "@consensys/ds3-config/nativewind";
import themeConfig from "./theme.config";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    './node_modules/@consensys/ds3/src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@consensys/ds3-web3/src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [ds3(themeConfig)],
  theme: {
    extend: {
      fontFamily: {
        cursive: [
          'Brush Script MT',
          'Brush Script Std',
          'Lucida Calligraphy',
          'Lucida Handwriting',
          'Apple Chancery',
          'cursive'
        ],
      },
    }
  }
}