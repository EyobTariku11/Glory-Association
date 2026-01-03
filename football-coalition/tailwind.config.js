module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        marvin: ['"Marvin Visions Variable"', 'sans-serif'],
      },
      colors: {
        gold: "#FFD700",
        dark: "#000000",
        goldish: '#ebc76e',
      },
      animation: {
        "fade-in": "fade-in 1s ease-out",
        "fade-up": "fade-up 1s ease-out",
        'slide-in-top': 'slide-in-top 0.5s ease-in-out forwards',
        'bounce-in-fwd': 'bounce-in-fwd 0.5s ease-in-out forwards',
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        'slide-in-top': {
          '0%': { transform: 'translateY(-100rem)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
