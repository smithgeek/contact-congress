import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import viteReact from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		checker({
			// e.g. use TypeScript check
			typescript: true,
		}),
		TanStackRouterVite({ autoCodeSplitting: true }),
		viteReact(),
		createHtmlPlugin({}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
