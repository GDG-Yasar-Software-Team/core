/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				display: ["Inter", "Noto Sans", "sans-serif"],
				body: ["Roboto", "Noto Sans", "sans-serif"],
				sans: ["Roboto", "Noto Sans", "sans-serif"],
			},
			colors: {
				google: {
					blue: "#4285F4",
					red: "#EA4335",
					yellow: "#FBBC04",
					green: "#34A853",
				},
			},
		},
	},
	plugins: [],
};
