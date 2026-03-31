import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@/features": path.resolve(__dirname, "./src/features"),
			"@/components": path.resolve(__dirname, "./src/components"),
			"@/lib": path.resolve(__dirname, "./src/lib"),
			"@/hooks": path.resolve(__dirname, "./src/hooks"),
			"@/types": path.resolve(__dirname, "./src/types"),
			"@/styles": path.resolve(__dirname, "./src/styles"),
		},
	},
	server: {
		port: 3001,
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/setup.ts",
	},
});
