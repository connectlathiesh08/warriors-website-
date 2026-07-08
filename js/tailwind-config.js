/* Tailwind Play CDN configuration — mirrors the React app's tailwind.config.js
   (theme.extend) so every raw Tailwind utility class resolves identically.
   Loaded immediately AFTER <script src="https://cdn.tailwindcss.com">.
   NOTE: the Play CDN is used for pixel-faithful development/preview. For
   production a compiled static CSS can be generated from the same config. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#16429B',
          bluehover: '#1d4fb0',
          bluedark: '#0B2B6B',
          bluedarker: '#0A1F4D',
          gold: '#F5A623',
          goldhover: '#e69612',
        },
        bday: '#2E9E5B',
        bdaysoft: '#E6F5EC',
        anniv: '#F08020',
        annivsoft: '#FCEBDD',
        annivdot: '#E5483A',
        evt: '#16429B',
        evtsoft: '#E7EDFA',
        ink: '#1A2B4A',
        muted: '#7A869A',
        divider: '#E8EDF5',
        pagebg: '#EEF3FB',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      boxShadow: {
        card: '0 10px 30px rgba(13, 38, 92, 0.06)',
        soft: '0 6px 18px rgba(13, 38, 92, 0.05)',
        pill: '0 4px 14px rgba(13, 38, 92, 0.08)',
      },
    },
  },
}
