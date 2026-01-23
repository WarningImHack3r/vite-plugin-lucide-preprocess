import { describe, expect, test } from "vitest";
import {
	frameworkImportPath,
	iconCompToDashed,
	importsMatcher,
	plugin,
	rawModulesToLists
} from "./plugin.js";
import renamedReplacements from "./renamedReplacements.js";

describe("Regex matching", () => {
	test("single import statement", () => {
		const code = `import { Icon1 } from "lucide-react";`;
		const matches = [...code.matchAll(importsMatcher)];
		expect(matches).not.toBe(null);
		expect(matches).toHaveLength(1);
		expect(matches[0]).toHaveLength(7);
		expect(matches[0][2]).toBe(" Icon1 ");
	});

	test("type import is skipped", () => {
		const code = `import type { Icon } from "lucide-solid";`;
		const matches = [...code.matchAll(importsMatcher)];
		expect(matches).not.toBe(null);
		expect(matches).toHaveLength(0);
	});

	describe("Imports-level matching", () => {
		test("multiple import statements with single component", () => {
			const code = `
			import { Icon1 } from "lucide-react";
			import { Icon2 } from "lucide-react";
		`;
			const matches = [...code.matchAll(importsMatcher)];
			expect(matches).not.toBe(null);
			expect(matches).toHaveLength(2);
			expect(matches[0]).toHaveLength(7);
			expect(matches[0][2]).toBe(" Icon1 ");
			expect(matches[1]).toHaveLength(7);
			expect(matches[1][2]).toBe(" Icon2 ");
		});

		test("multiple import statements with multiple components", () => {
			const code = `
			import { Icon1 } from "lucide-react";
			import { Icon2, Icon3 } from "lucide-react";
		`;
			const matches = [...code.matchAll(importsMatcher)];
			expect(matches).not.toBe(null);
			expect(matches).toHaveLength(2);
			expect(matches[0]).toHaveLength(7);
			expect(matches[0][2]).toBe(" Icon1 ");
			expect(matches[1]).toHaveLength(7);
			expect(matches[1][2]).toBe(" Icon2, Icon3 ");
		});

		test("multiple import statements with only one matching", () => {
			const code = `
			import { Thing } from "another-package";
			import { Icon2 } from "lucide-svelte";
		`;
			const matches = [...code.matchAll(importsMatcher)];
			expect(matches).not.toBe(null);
			expect(matches).toHaveLength(1);
			expect(matches[0]).toHaveLength(7);
			expect(matches[0][2]).toBe(" Icon2 ");
		});

		test("multiple import statements with no matching", () => {
			const code = `
			import { Thing } from "another-package";
			import { Thing2 } from "another-package";
		`;
			const matches = [...code.matchAll(importsMatcher)];
			expect(matches).not.toBe(null);
			expect(matches).toHaveLength(0);
		});
	});

	describe("Component-level matching", () => {
		test("single multiline import statement", () => {
			const code = `
				import {
					Icon1
				} from "lucide-react";
			`;
			const matches = [...code.matchAll(importsMatcher)];
			expect(matches).not.toBe(null);
			expect(matches).toHaveLength(1);
			expect(matches[0]).toHaveLength(7);
			expect(matches[0][2].trim()).toBe("Icon1");
		});

		test("multiple multiline import statements with single component", () => {
			const code = `
				import {
					Icon1
				} from "lucide-react";
				import {
					Icon2
				} from "lucide-react";
			`;
			const matches = [...code.matchAll(importsMatcher)];
			expect(matches).not.toBe(null);
			expect(matches).toHaveLength(2);
			expect(matches[0]).toHaveLength(7);
			expect(matches[0][2].trim()).toBe("Icon1");
			expect(matches[1]).toHaveLength(7);
			expect(matches[1][2].trim()).toBe("Icon2");
		});

		test("single multiline import statement with multiple components", () => {
			const code = `
				import {
					Icon1,
					Icon2
				} from "lucide-react";
			`;
			const matches = [...code.matchAll(importsMatcher)];
			expect(matches).not.toBe(null);
			expect(matches).toHaveLength(1);
			expect(matches[0]).toHaveLength(7);
			expect(matches[0][2].trim()).toBe("Icon1,\n\t\t\t\t\tIcon2");
		});

		test("single multiline import statement with multiple components and trailing comma", () => {
			const code = `
				import {
					Icon1,
					Icon2,
				} from "lucide-react";
			`;
			const matches = [...code.matchAll(importsMatcher)];
			expect(matches).not.toBe(null);
			expect(matches).toHaveLength(1);
			expect(matches[0]).toHaveLength(7);
			expect(matches[0][2].trim()).toBe("Icon1,\n\t\t\t\t\tIcon2,");
		});

		test("single multiline import statement with multiple components, trailing comma and weighted spacing", () => {
			const code = `
				import {
				,
					Icon1 ,
					Icon2
					,Icon3 ,
					Icon4,
				} from "lucide-react";
			`;
			const matches = [...code.matchAll(importsMatcher)];
			expect(matches).not.toBe(null);
			expect(matches).toHaveLength(1);
			expect(matches[0]).toHaveLength(7);
			expect(matches[0][2].trim()).toBe(
				",\n\t\t\t\t\tIcon1 ,\n\t\t\t\t\tIcon2\n\t\t\t\t\t,Icon3 ,\n\t\t\t\t\tIcon4,"
			);
		});
	});
});

describe("Modules parsing", () => {
	describe("Inline imports", () => {
		test("single", () => {
			const modules = ` Icon1 `;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(1);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon1"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1"]);
		});

		test("multiple", () => {
			const modules = ` Icon1, Icon2, Icon3 `;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(3);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon1", "Icon2", "Icon3"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1", "Icon2", "Icon3"]);
		});

		test("single with trailing comma", () => {
			const modules = ` Icon1, `;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(1);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon1"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1"]);
		});

		test("multiple with trailing comma", () => {
			const modules = ` Icon1, Icon2, Icon3, `;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(3);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon1", "Icon2", "Icon3"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1", "Icon2", "Icon3"]);
		});

		test("single with alias", () => {
			const modules = ` Icon1 as Icon2 `;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(1);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon2"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1"]);
		});

		test("multiple with aliases", () => {
			const modules = `Icon1 as Icon2,Icon3, Icon4 as Icon5 `;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(3);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon2", "Icon3", "Icon5"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1", "Icon3", "Icon4"]);
		});

		test("single with leading comma", () => {
			const modules = ` ,Icon1 `;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(1);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon1"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1"]);
		});

		test("multiple with commas and weird spacing", () => {
			const modules = ` Icon1 , Icon2,Icon3, Icon4 ,`;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(4);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon1", "Icon2", "Icon3", "Icon4"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1", "Icon2", "Icon3", "Icon4"]);
		});
	});

	describe("Multiline imports", () => {
		test("single", () => {
			const modules = `
				Icon1
			`;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(1);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon1"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1"]);
		});

		test("multiple", () => {
			const modules = `
				Icon1,
				Icon2,
				Icon3
			`;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(3);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon1", "Icon2", "Icon3"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1", "Icon2", "Icon3"]);
		});

		test("single with alias", () => {
			const modules = `
				Icon1 as Icon2
			`;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(1);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon2"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1"]);
		});

		test("multiple with aliases", () => {
			const modules = `
				Icon1 as Icon2,
				Icon3,
				Icon4 as Icon5
			`;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(3);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon2", "Icon3", "Icon5"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1", "Icon3", "Icon4"]);
		});

		test("single with trailing comma", () => {
			const modules = `
				Icon1,
			`;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(1);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon1"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1"]);
		});

		test("multiple with trailing comma", () => {
			const modules = `
				Icon1,
				Icon2,
				Icon3,
			`;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(3);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon1", "Icon2", "Icon3"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1", "Icon2", "Icon3"]);
		});

		test("single with leading comma", () => {
			const modules = `
				,
				Icon1
			`;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(1);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon1"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon1"]);
		});

		test("multiple with commas and weird spacing", () => {
			const modules = `
				Icon3,
				,Icon1 ,
				Icon2 ,
				Icon4,
			`;
			const list = rawModulesToLists(modules);
			expect(list[0]).toHaveLength(4);
			expect(list[1]).toHaveLength(0);
			expect(list[0].map(m => m.name)).toStrictEqual(["Icon3", "Icon1", "Icon2", "Icon4"]);
			expect(list[0].map(m => m.importName)).toStrictEqual(["Icon3", "Icon1", "Icon2", "Icon4"]);
		});
	});
});

const modulesConversionRegex =
	/^export \{ default as (\S+) } from ["'][^\/]+\/(\S+)\.[A-Za-z\d]+/gm;
const aliasesConversionRegex =
	/\/\/ (\S+) aliases\n[\S\s\n]+? as \S+ } from ["'].+\/(\S+)\.[A-Za-z\d]+/g;

describe("Icon component name conversion", async () => {
	const imports = await import("/node_modules/@lucide/svelte/dist/icons/index.js?raw");
	const aliasesImports = await import("/node_modules/@lucide/svelte/dist/aliases/aliases.js?raw");

	const modules = [...imports.default.matchAll(modulesConversionRegex)];
	test("Read modules should not be empty", () => {
		expect(modules.length).toBeGreaterThan(0);
	});
	const aliases = [...aliasesImports.default.matchAll(aliasesConversionRegex)];
	test("Read aliases should not be empty", () => {
		expect(aliases.length).toBeGreaterThan(0);
	});
	for (const [_, component, dashedName] of modules) {
		test(`Regular imports: ${component} -> ${dashedName}`, () => {
			expect(iconCompToDashed(component)).eq(dashedName);
		});
	}
	for (const [_, component, dashedName] of aliases) {
		// Rename the condition in the renaming script if you change the name of that test(s)!
		test(`Alias imports: ${component} from ${dashedName}`, () => {
			expect(renamedReplacements[dashedName] ?? dashedName).eq(iconCompToDashed(component));
		});
	}

	test("'As' import", () => {
		const dashed = iconCompToDashed("Thing as Icon1");
		expect(dashed).not.toContain(" ");
		expect(dashed).toBe("thing");
	});

	test("Lucide* prefix", () => {
		const dashed = iconCompToDashed("LucideIcon1");
		expect(dashed).toBe("icon-1");
	});

	test("*Icon suffix", () => {
		const dashed = iconCompToDashed("Icon1Icon");
		expect(dashed).toBe("icon-1");
	});
});

describe("Framework matching", () => {
	test("non-lucide package", () => {
		const code = `import { Something } from "pack"`;
		const matches = [...code.matchAll(importsMatcher)];
		expect(matches).not.toBe(null);
		expect(matches).toHaveLength(0);
	});

	test("lucide package", () => {
		const code = `import { Icon1 } from "lucide-preact";`;
		const matches = [...code.matchAll(importsMatcher)];
		expect(matches).not.toBe(null);
		expect(matches).toHaveLength(1);
		expect(matches[0]).toHaveLength(7);
		expect(matches[0][5]).toBe("preact");
	});

	test("lucide lab", () => {
		const code = `import { burger } from "@lucide/lab"`;
		const matches = [...code.matchAll(importsMatcher)];
		expect(matches).not.toBe(null);
		expect(matches).toHaveLength(0);
	});

	test("new lucide packages", () => {
		const code = `import { Icon1 } from "@lucide/svelte"`;
		const matches = [...code.matchAll(importsMatcher)];
		expect(matches).not.toBe(null);
		expect(matches).toHaveLength(1);
		expect(matches[0]).toHaveLength(7);
		expect(matches[0][5]).toBe("svelte");
	});
});

describe("Framework import path", () => {
	test("default", () => {
		const path = frameworkImportPath("default", { importMode: "esm" });
		expect(path).toBe("/icons/");
	});

	test("react", () => {
		const path = frameworkImportPath("react", { importMode: "cjs" });
		expect(path).toBe("/dist/cjs/icons/");
	});
});

describe("End-to-end", () => {
	test("single import with single icon", () => {
		const code = `import { Icon1 } from "lucide-svelte";`;
		const transformed = /** @type {import("vite").TransformResult} */ (
			plugin().transform(code, "file.svelte")
		);
		expect(transformed).not.toBe(undefined);
		expect(transformed.code).toBe(`import Icon1 from "lucide-svelte/icons/icon-1";`);
	});

	test("single new import with single icon", () => {
		const code = `import { Icon1 } from "@lucide/svelte";`;
		const transformed = /** @type {import("vite").TransformResult} */ (
			plugin().transform(code, "file.svelte")
		);
		expect(transformed).not.toBe(undefined);
		expect(transformed.code).toBe(`import Icon1 from "@lucide/svelte/icons/icon-1";`);
	});

	test("single import with multiple types, aliases and icons", () => {
		const code = `
		import { type One, Icon1, type Icon2, Icon3 as Icon4, Icon5, A as B } from "lucide-svelte";
		`;
		const transformed = /** @type {import("vite").TransformResult} */ (
			plugin().transform(code, "file.svelte")
		);
		expect(transformed).not.toBe(undefined);
		expect(transformed.code).eq(`
		import type { One, Icon2 } from "lucide-svelte";
		import Icon1 from "lucide-svelte/icons/icon-1";
		import Icon4 from "lucide-svelte/icons/icon-3";
		import Icon5 from "lucide-svelte/icons/icon-5";
		import B from "lucide-svelte/icons/a";
		`);
	});

	test("multiple imports with no valid ones", () => {
		const code = `
		import { Thing } from "another-package";
		import Named from "another-package";
		import { Thing2 } from "another-package";
		import * as All from "another-package";
		`;
		const transformed = /** @type {import("vite").TransformResult} */ (
			plugin().transform(code, "file.svelte")
		);
		expect(transformed).not.toBe(undefined);
		expect(transformed.code).toBe(code);
	});

	test("multiple imports with one valid and others not", () => {
		const code = `
		import { Thing } from "another-package";
		import { Icon2 } from "lucide-svelte";
		import { Thing2 } from "another-package";
		import * as All from "another-package";
		`;
		const transformed = /** @type {import("vite").TransformResult} */ (
			plugin().transform(code, "file.svelte")
		);
		expect(transformed).not.toBe(undefined);
		expect(transformed.code).toBe(`
		import { Thing } from "another-package";
		import Icon2 from "lucide-svelte/icons/icon-2";
		import { Thing2 } from "another-package";
		import * as All from "another-package";
		`);
	});

	test("multiple imports with some valid and some not, worst case", () => {
		const code = `
		import { Thing } from "another-package";
		import Named from "another-package";
		import { Icon2 } from "lucide-react"
		import { Thing2 } from "another-package";
		import type { Thing3 } from "lucide-react";
		import Icon4 from "lucide-svelte/icons/icon-4"
		import { type One, Icon1, Icon3 as Icon4, Icon5 } from "@lucide/svelte";
		import * as All from "another-package";
		`;
		const transformed = /** @type {import("vite").TransformResult} */ (
			plugin().transform(code, "file.svelte")
		);
		expect(transformed).not.toBe(undefined);
		expect(transformed.code).toBe(`
		import { Thing } from "another-package";
		import Named from "another-package";
		import Icon2 from "lucide-react/dist/esm/icons/icon-2"
		import { Thing2 } from "another-package";
		import type { Thing3 } from "lucide-react";
		import Icon4 from "lucide-svelte/icons/icon-4"
		import type { One } from "@lucide/svelte";
		import Icon1 from "@lucide/svelte/icons/icon-1";
		import Icon4 from "@lucide/svelte/icons/icon-3";
		import Icon5 from "@lucide/svelte/icons/icon-5";
		import * as All from "another-package";
		`);
	});
});
