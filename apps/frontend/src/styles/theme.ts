const primitive = {
  red19: '#5f0000',
  red33: '#9c290d',
  red40: '#bf1212',
  red45: '#d93912',
  red50: '#ff0000',
  blue50: '#4400ff',
  yellow22: '#723F00',
  yellow80: '#ffe398',
  yellow88: '#ffedbd',
  yellow89: '#EBE6DD',
  yellow96: '#FCF7EF',
  gray13: '#202020',
  gray35: '#595959',
  gray75: '#bfbfbf',
  gray85: '#D9D9D9',
  gray91: '#F3F3F3',
  gray100: '#ffffff',
  gray13Alpha20: '#2020201F',
}

export const colors = {
  brandPrimary: primitive.red45,
  brandSecondary: primitive.gray13,
  text: primitive.gray13,
  textSecondary: primitive.red45,
  textTertiary: primitive.gray35,
  textDisabled: primitive.gray35,
  textNegative: primitive.gray100,
  background: primitive.yellow96,
  surfaceWarm: primitive.yellow89,
  surfaceSubtle: primitive.gray91,
  surfaceSpecial: primitive.yellow88,
  surfaceWhite: primitive.gray100,
  border: primitive.gray75,
  shadow: primitive.gray13Alpha20,
  error: primitive.red40,
  line: {
    primary: primitive.red45,
    secondary: primitive.gray13,
    tertiary: primitive.gray85,
  },
  dropdownBorder: primitive.red45,
  dropdownBorderSecondary: primitive.gray75,
  priority: {
    critical: primitive.red50,
    high: primitive.red19,
    low: primitive.blue50,
  },
  button: {
    board: {
      color: primitive.gray13,
      border: primitive.yellow88,
      background: primitive.yellow88,
    },
  },
  checkbox: {
    activeIcon: primitive.gray100,
    activeBackground: primitive.red45,
    activeBorder: primitive.red45,
    inactiveBackground: primitive.gray100,
    inactiveBorder: primitive.gray75,
  },
  selectMenu: {
    border: primitive.gray75,
    surface: primitive.gray91,
    background: primitive.gray100,
  },
  project: {
    color: primitive.gray100,
    colorSecondary: primitive.gray100,
    background: primitive.red40,
    backgroundSecondary: primitive.red33,
    shadow: primitive.red33,
  },
  page: {
    color: primitive.gray13,
    colorSecondary: primitive.red45,
    background: primitive.yellow80,
    backgroundSecondary: primitive.yellow80,
    shadow: primitive.yellow22,
  },
  neutral: {
    color: primitive.gray13,
    colorSecondary: primitive.gray13,
    background: primitive.yellow96,
    backgroundSecondary: primitive.yellow96,
    shadow: primitive.gray13,
  },
  sidebar: {
    background: primitive.gray75,
    stackShadow: primitive.gray13,
  },
}

export const spacing = {
  pageX: 60,
  pageY: 40,
  xxl: 56,
  xl: 32,
  lg: 24,
  md: 16,
  sm: 8,
  xs: 4,
}

export const fontSize = {
  display: 48,
  xxl: 30,
  xl: 21,
  lg: 18,
  md: 12,
  sm: 10,
}

export const lineHeight = {
  display: 60,
  xxl: 60,
  xl: 23,
  lg: 22,
  md: 18,
  sm: 12,
}

export const fontFamily = {
  primary: 'Inter',
  primaryBold: 'Inter-Bold',
  secondary: 'PTSerif',
}

export const fonts = {
  [fontFamily.primary]: require('../../public/static/fonts/Inter_18pt-Regular.ttf'),
  [fontFamily.primaryBold]: require('../../public/static/fonts/Inter_18pt-Bold.ttf'),
  [fontFamily.secondary]: require('../../public/static/fonts/PTSerif-Regular.ttf'),
}

// Breakpoints
export const NARROW_BREAKPOINT = 600
export const SIDEBAR_BREAKPOINT = 750
