const ignoredPaths = ["/node_modules/", "/.svelte-kit/"];

/**
 * The Vite plugin that preprocesses imports to optimize Lucide icons
 * @return {import("vite").Plugin}
 */
export default function() {
	return {
		name: "vite-plugin-lucide-preprocess",
		enforce: "pre",
		transform: (code, path) => {
			if (ignoredPaths.some(p => path.includes(p))) {
				return;
			}
			return {
				code: code.replace(
					/^(\s*)import\s+\{([^}]*)}\s+from\s+(["'])lucide-(.*?)["'](.*)$/gm,
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
						const modules = modulesStr
							.split(",")
							.map(m => m.trim())
							.filter(m => !!m && !m.startsWith("type"));
						return modules
							.map(m => {
								const dashedModule = m.replace(
									/[A-Z]/g,
									(match, offset) => (offset > 0 ? "-" : "") + match.toLowerCase()
								);
								return `${initialSpacing}import ${m} from ${quote}lucide-${framework}/icons/${dashedModule}${quote}${lineEnding.trimEnd()}`;
							})
							.join("\n");
					}
				)
			};
		}
	};
}
