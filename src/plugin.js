import renamedReplacementsModules from "./renamedReplacements.js";

const ignoredPaths = ["/node_modules/", "/.svelte-kit/"];

/**
 * Converts a raw string of imported icons to a list of module names,
 * and a list of TypeScript types
 * @param rawModules {string} The raw string of imported icons
 * @return {[string[], string[]]} A list containing a list of imported icons,
 * and a list of TypeScript types
 */
export function rawModulesToLists(rawModules) {
	const raw = rawModules
		.split(",")
		.map(m => m.trim())
		.filter(m => !!m);
	return [
		raw.filter(m => !m.startsWith("type ")),
		raw.filter(m => m.startsWith("type ")).map(m => m.slice(5))
	];
}

/**
 * Converts a PascalCase icon component name to a dashed string
 * (e.g. `IconComp` to `icon-comp`)
 * @param component {string} The PascalCase icon component name
 * @return {string} The dashed icon component name, or the renamed one if it exists
 */
export function iconCompToDashed(component) {
	const computedDashed = component
		.split(" ")[0] // take only the first part if there's an alias
		// transform "IconComp" to "icon-comp"
		.replace(/[A-Z\d]/g, (match, offset) => (offset > 0 ? "-" : "") + match.toLowerCase())
		// fix for NxN icons
		.replace(/(\d)x-(\d)/, (_, a, b) => `${a}x${b}`)
		// exception for ClockNN
		.replace(/clock-(\d)-(\d)/, (_, a, b) => `clock-${a}${b}`)
		// remove the Lucide prefix
		.replace(/^lucide-/, "")
		// remove the "Icon" suffix
		.replace(/-icon$/, "");
	return renamedReplacementsModules[computedDashed] ?? computedDashed;
}

/**
 * Returns the import path for a specific Lucide framework
 * @param framework {string} The Lucide framework
 * @param options {Options} The plugin options
 * @return {string} The import path for the Lucide framework
 */
export function frameworkImportPath(framework, options) {
	switch (framework) {
		case "react":
		case "vue":
		case "vue-next":
		case "preact":
			return `/dist/${options.importMode}/icons/`;
		default:
			return "/icons/";
	}
}

export const importsMatcher = /^(\s*)import\s+\{([^}]*)}\s+from\s+(["'])lucide-(.*?)["'](.*)$/gm;

/**
 * @typedef {Object} Options
 * @property {"cjs" | "esm"} [importMode="esm"] The import type for React
 */

/**
 * The default plugin options
 * @type {Options}
 */
const defaultOptions = {
	importMode: "esm"
};

/**
 * The Vite plugin that preprocesses imports to optimize Lucide icons
 * @param options {Options} The plugin options
 * @return {import("vite").Plugin}
 */
export function plugin(options = defaultOptions) {
	const mergedOptions = { ...defaultOptions, ...options };
	return {
		name: "vite-plugin-lucide-preprocess",
		enforce: "pre",
		transform: (code, path) => {
			if (ignoredPaths.some(p => path.includes(p))) return;
			return {
				code: code.replace(
					importsMatcher,
					/**
					 * @param _ The whole matched string
					 * @param initialSpacing {string} The spacing before the matched import statement
					 * @param modulesStr {string} The imported icons as a raw string
					 * @param quote {string} The quote used in the import statement (either ' or ")
					 * @param framework {string} The framework the icons are imported for
					 * @param lineEnding {string} The end of the line of the matched import statement (often a semicolon)
					 * @return The optimized import statement(s)
					 */
					(_, initialSpacing, modulesStr, quote, framework, lineEnding) => {
						const [modules, types] = rawModulesToLists(modulesStr);
						const moduleImports = modules
							.map(
								m =>
									`${initialSpacing}import ${m} from ${quote}lucide-${framework}${frameworkImportPath(
										framework,
										mergedOptions
									)}${iconCompToDashed(m)}${quote}${lineEnding.trimEnd()}`
							)
							.join(initialSpacing.includes("\n") ? "" : "\n");
						const typesImport = `${initialSpacing}import type { ${types.join(", ")} } from ${quote}lucide-${framework}${quote}${lineEnding.trimEnd()}`;
						return [
							types.length ? typesImport : undefined,
							modules.length ? moduleImports : undefined
						]
							.filter(Boolean)
							.join(initialSpacing.includes("\n") ? "" : "\n");
					}
				)
			};
		}
	};
}
