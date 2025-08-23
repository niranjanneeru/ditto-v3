/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        replay: ["Replay Pro", "sans-serif"],
        "ibm-plex-serif": ["IBM Plex Serif", "serif"],
        roberto: ["Roberto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
