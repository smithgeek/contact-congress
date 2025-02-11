import { defineConfig } from "@kubb/core";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginTanstackQuery } from "@kubb/swagger-tanstack-query";
import { pluginTs } from "@kubb/swagger-ts";

export default defineConfig({
	root: ".",
	input: {
		path: "http://localhost:62081/swagger/v1/swagger.json",
	},
	output: {
		path: "./src/gen",
		clean: true,
	},
	plugins: [
		pluginOas({
			output: false,
			validate: true,
		}),
		pluginTs({
			output: {
				path: "models",
			},
		}),
		pluginTanstackQuery({
			mutate: {
				methods: ["post", "put", "patch", "delete"],
				variablesType: "mutate",
			},
		}),
	],
});
