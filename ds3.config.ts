import { generateConfig } from '@ds3/config'

export default generateConfig({
  themes: {
    default: {
      colors: {
        neutral: 'gray',
        primary: 'violet',
        secondary: 'teal',
        error: 'red',
        warning: 'yellow',
        success: 'green',
        leif: 'tomato',
      },
    },
    oceanBreeze: {
      colors: {
        neutral: 'slate',
        primary: 'cyan',
        secondary: 'blue',
        error: 'red',
        warning: 'amber',
        success: 'grass',
        leif:'lime'
      },
    },
    sunsetGlow: {
      colors: {
        neutral: 'mauve',
        primary: 'pink',
        secondary: 'orange',
        error: 'crimson',
        warning: 'yellow',
        success: 'lime',
      },
    },
    forestHues: {
      colors: {
        neutral: 'sage',
        primary: 'green',
        secondary: 'brown',
        error: 'red',
        warning: 'orange',
        success: 'teal',
      },
    }
  },
});
