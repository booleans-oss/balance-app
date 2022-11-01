/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      body: ["Inter", "sans-serif"],
    },
    extend: {
      colors: {
        "bg-primary": "rgb(17, 17, 17)",
        "border-primary": "rgb(51, 51, 51)",
        "text-primary": "rgb(153, 153, 153)",
        "text-secondary": "rgb(136, 136, 136)",
      },
    },
  },
  plugins: [],
};
