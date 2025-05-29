import cui from "@consensys/ui-config/nativewind";
import themeConfig from "./theme.config";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    './node_modules/@consensys/ui/**/*.{js,jsx,ts,tsx}',
    './node_modules/@consensys/ui-web3/**/*.{js,jsx,ts,tsx}'
  ],
  presets: [cui(themeConfig)],
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