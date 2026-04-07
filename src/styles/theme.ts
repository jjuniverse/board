import { createTheme } from '@mui/material/styles';

const slate = {
  50: '#F6F8FB',
  100: '#EEF2F6',
  200: '#E1E6EC',
  300: '#C9D1DA', // 콘크리트 라인
  400: '#A6B3C0',
  500: '#8695A6',
  600: '#5E6E82',
  700: '#3E4B5C', // 본문 보조
  800: '#263243',
  900: '#111A27', // 히어로 오버레이 근접
};

// CTA용 네이비 (버튼/포커스)
const navy = {
  main: '#1F2A44',
  light: '#2B3A5E',
  dark: '#151C2F',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: navy.main, light: navy.light, dark: navy.dark, contrastText: '#FFFFFF' },
    secondary: { main: slate[700], light: slate[500], dark: slate[900], contrastText: '#FFFFFF' },

    background: { default: slate[50], paper: '#FFFFFF' },
    text: { primary: '#0E1420', secondary: slate[700] },
    divider: slate[200],

    info: { main: '#3B82F6' },
    success: { main: '#22C55E' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: slate[800] },
        arrow: { color: slate[800] },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          textTransform: 'none',
          whiteSpace: 'nowrap',
          minHeight: 40,
          ...(ownerState.size !== 'small' && {
            paddingLeft: 24,
            paddingRight: 24,
          }),
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focusVisible, &:focus': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${(theme.palette.primary.main, 0.35)}`,
          },
        }),
      },
    },
  },
});

export default theme;
