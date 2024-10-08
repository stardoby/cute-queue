/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'queuegreen': '#40916C',
        'paleyellow': '#FFECCA',
        'darkyellow': '#B47500',
        'closed': '#DB1D1D',
        'warningYellow': "#FFCA6759",
        'warningText': "#B47500",
        'closedBG':"#FF676759",
        'closedText':"#B73333",
        'transGreen': '#40916C9E',
        'labelGreen': '#D9E9E2',
        
      }
    }
  },
  plugins: [
    require("@headlessui/tailwindcss")
  ],
};
