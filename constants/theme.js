const COLORS = {
  primary: "#312651",
  secondary: "#444262",
  tertiary: "#FF7754",

  gray: "#83829A",
  gray2: "#C1C0C8",

  dark: "#1c1d21",

  light:"#CDCDCD",

  white: "#F3F4F8",
  lightWhite: "#FAFAFC",
  black: "#FF000000",
  
  white: "#FFFFFFFF",
  red: "#A0281F",

  wizBlue: "#2023FFFF",
  wizBlueLight: "#BDC9FFFF",
  wizLBlue: "#02AEEEFF",
  wizLBlueLight: "#B1D7F2FF",
  wizPurp: "#652F91FF",
  wizPurpLight: "#C2B1F2FF",

  green: "#1DC700",
  gray1: "#BB444448"
};

const FONT = {
  regular: "DMRegular",
  medium: "DMMedium",
  bold: "DMBold",
};

const SIZES = {
  xSmall: 10,
  small: 12,
  medium: 16,
  large: 20,
  xLarge: 24,
  xxLarge: 32,
};

const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
  },
};
export const darkTheme = {
  backgroundColor: '#1c1d21',
  textColor: '#FFFFFF',
  containerStyle: {
    backgroundColor: '#2e2e2e',
    textColor: '#FFFFFF'
  },
  subContainerStyle: {
    backgroundColor: '#4d4c4c',
    textColor: '#FFFFFF'
  },
};

export { COLORS, FONT, SIZES, SHADOWS };
