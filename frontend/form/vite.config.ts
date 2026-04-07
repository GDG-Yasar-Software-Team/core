import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Vite Configuration
 * Clean, minimal setup for the form application
 */
export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
		open: true,
	},
	build: {
		outDir: "dist",
		sourcemap: false,
		target: "esnext",
		minify: "esbuild",
	},
});
