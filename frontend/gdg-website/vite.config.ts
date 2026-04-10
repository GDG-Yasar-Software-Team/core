import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@/components": path.resolve(__dirname, "./src/components"),
			"@/pages": path.resolve(__dirname, "./src/pages"),
			"@/types": path.resolve(__dirname, "./src/types"),
			"@/styles": path.resolve(__dirname, "./src/styles"),
		},
	},
	optimizeDeps: {
		include: ["motion/react", "gsap", "three"],
	},
	server: {
		port: 3001,
	},
});
