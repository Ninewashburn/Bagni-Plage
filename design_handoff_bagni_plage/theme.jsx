// theme.jsx — Bagni Plage retro Italian Riviera design tokens
// Referenced by all component files. Palette swappable via Tweaks.

const BAGNI_PALETTES = {
  terracotta: {
    name: 'Terracotta',
    cream: '#F4E9D8',
    creamDark: '#EBDDC5',
    paper: '#FBF5E9',
    ink: '#2B1D13',
    inkSoft: '#5A4432',
    sea: '#3E7D8C',
    seaDeep: '#2A5968',
    primary: '#C8553D',   // terracotta
    primaryDark: '#A23E2B',
    accent: '#E9A24B',    // ochre
    sand: '#D9C39A',
    mint: '#7AA68A',
    stripe: '#C8553D',
  },
  saltwater: {
    name: 'Saltwater',
    cream: '#F2EDE3',
    creamDark: '#E5DDCE',
    paper: '#FAF6EC',
    ink: '#0F2A33',
    inkSoft: '#3B5560',
    sea: '#1F6B7A',
    seaDeep: '#0E4553',
    primary: '#0E8A9E',
    primaryDark: '#0A6E7F',
    accent: '#E8B04B',
    sand: '#D2BF94',
    mint: '#6BAA8A',
    stripe: '#0E8A9E',
  },
  limone: {
    name: 'Limone',
    cream: '#F7F0DB',
    creamDark: '#EDE2C1',
    paper: '#FCF7E4',
    ink: '#28321A',
    inkSoft: '#4C5A34',
    sea: '#3B7A7A',
    seaDeep: '#285656',
    primary: '#E8A93C',
    primaryDark: '#C68A22',
    accent: '#D7492F',
    sand: '#DDC694',
    mint: '#84A76A',
    stripe: '#3E6E45',
  },
};

const FONTS = {
  display: '"DM Serif Display", "Playfair Display", Georgia, serif',
  serif: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
  sans: '"Work Sans", -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

// Hook — returns current palette + setter (lives in React tree via context)
const ThemeCtx = React.createContext({
  palette: BAGNI_PALETTES.terracotta,
  paletteKey: 'terracotta',
  setPaletteKey: () => {},
  dark: false,
  setDark: () => {},
});

function useTheme() { return React.useContext(ThemeCtx); }

function ThemeProvider({ children, initial = 'terracotta', initialDark = false, onChange }) {
  const [paletteKey, setPaletteKey] = React.useState(initial);
  const [dark, setDark] = React.useState(initialDark);
  const palette = BAGNI_PALETTES[paletteKey];
  React.useEffect(() => {
    if (onChange) onChange({ paletteKey, dark });
  }, [paletteKey, dark]);
  return (
    <ThemeCtx.Provider value={{ palette, paletteKey, setPaletteKey, dark, setDark }}>
      {children}
    </ThemeCtx.Provider>
  );
}

// Dark mode derives colors from palette
function useColors() {
  const { palette, dark } = useTheme();
  if (!dark) {
    return {
      bg: palette.cream,
      bgElev: palette.paper,
      bgCard: '#FFFCF4',
      ink: palette.ink,
      inkSoft: palette.inkSoft,
      inkFaint: palette.inkSoft + '88',
      border: palette.ink + '18',
      borderStrong: palette.ink + '30',
      primary: palette.primary,
      primaryDark: palette.primaryDark,
      accent: palette.accent,
      sea: palette.sea,
      seaDeep: palette.seaDeep,
      sand: palette.sand,
      mint: palette.mint,
      stripe: palette.stripe,
    };
  }
  return {
    bg: '#17120D',
    bgElev: '#211910',
    bgCard: '#261D13',
    ink: '#F4E9D8',
    inkSoft: '#D9C8AE',
    inkFaint: '#8F7B5F',
    border: '#F4E9D822',
    borderStrong: '#F4E9D844',
    primary: palette.primary,
    primaryDark: palette.primaryDark,
    accent: palette.accent,
    sea: palette.sea,
    seaDeep: palette.seaDeep,
    sand: palette.sand,
    mint: palette.mint,
    stripe: palette.stripe,
  };
}

// Stripes — cabana-style, repeating linear gradient
function cabanaStripes(c1, c2, width = 18, angle = 90) {
  return `repeating-linear-gradient(${angle}deg, ${c1} 0 ${width}px, ${c2} ${width}px ${width * 2}px)`;
}

Object.assign(window, {
  BAGNI_PALETTES, FONTS, ThemeCtx, ThemeProvider, useTheme, useColors, cabanaStripes,
});
