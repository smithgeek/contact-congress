import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
	},
	{
		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
	},
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	pluginReact.configs.flat["jsx-runtime"],
	{
		rules: {
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					varsIgnorePattern: "^_",
				},
			],
			"react/jsx-no-target-blank": ["error"],
		},
	},
];
