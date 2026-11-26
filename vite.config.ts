import { defineConfig } from "vite-plus";

export default defineConfig({
	staged: {
		"*": "vp check --fix"
	},
	lint: {
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: { "vite-plus/prefer-vite-plus-imports": "error" },
		options: { typeAware: true, typeCheck: true }
	},
	fmt: {
		useTabs: true,
		trailingComma: "none",
		printWidth: 100,
		arrowParens: "avoid",
		sortPackageJson: false,
		ignorePatterns: ["package-lock.json", "pnpm-lock.yaml", "yarn.lock"]
	}
});
