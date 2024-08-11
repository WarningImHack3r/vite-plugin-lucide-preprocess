import { describe, expect, test } from "vitest";
import { iconCompToDashed, importsMatcher, rawModulesToModulesList } from "./plugin.js";

describe("Regex matching", () => {
	test("single import statement", () => {
		const code = `import { Icon1 } from "lucide-react";`;
		const matches = [...code.matchAll(importsMatcher)];
		expect(matches).not.toBe(null);
		expect(matches).toHaveLength(1);
		expect(matches[0]).toHaveLength(6);
		expect(matches[0][2]).toBe(" Icon1 ");
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
			expect(matches[0]).toHaveLength(6);
			expect(matches[0][2]).toBe(" Icon1 ");
			expect(matches[1]).toHaveLength(6);
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
			expect(matches[0]).toHaveLength(6);
			expect(matches[0][2]).toBe(" Icon1 ");
			expect(matches[1]).toHaveLength(6);
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
			expect(matches[0]).toHaveLength(6);
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
			expect(matches[0]).toHaveLength(6);
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
			expect(matches[0]).toHaveLength(6);
			expect(matches[0][2].trim()).toBe("Icon1");
			expect(matches[1]).toHaveLength(6);
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
			expect(matches[0]).toHaveLength(6);
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
			expect(matches[0]).toHaveLength(6);
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
			expect(matches[0]).toHaveLength(6);
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
			expect(rawModulesToModulesList(modules)).toStrictEqual(["Icon1"]);
		});

		test("multiple", () => {
			const modules = ` Icon1, Icon2, Icon3 `;
			expect(rawModulesToModulesList(modules)).toStrictEqual(["Icon1", "Icon2", "Icon3"]);
		});

		test("single with trailing comma", () => {
			const modules = ` Icon1, `;
			expect(rawModulesToModulesList(modules)).toStrictEqual(["Icon1"]);
		});

		test("multiple with trailing comma", () => {
			const modules = ` Icon1, Icon2, Icon3, `;
			expect(rawModulesToModulesList(modules)).toStrictEqual(["Icon1", "Icon2", "Icon3"]);
		});

		test("single with leading comma", () => {
			const modules = ` ,Icon1 `;
			expect(rawModulesToModulesList(modules)).toStrictEqual(["Icon1"]);
		});

		test("multiple with commas and weird spacing", () => {
			const modules = ` Icon1 , Icon2,Icon3, Icon4 ,`;
			expect(rawModulesToModulesList(modules)).toStrictEqual(["Icon1", "Icon2", "Icon3", "Icon4"]);
		});
	});

	describe("Multiline imports", () => {
		test("single", () => {
			const modules = `
				Icon1
			`;
			expect(rawModulesToModulesList(modules)).toStrictEqual(["Icon1"]);
		});

		test("multiple", () => {
			const modules = `
				Icon1,
				Icon2,
				Icon3
			`;
			expect(rawModulesToModulesList(modules)).toStrictEqual(["Icon1", "Icon2", "Icon3"]);
		});

		test("single with trailing comma", () => {
			const modules = `
				Icon1,
			`;
			expect(rawModulesToModulesList(modules)).toStrictEqual(["Icon1"]);
		});

		test("multiple with trailing comma", () => {
			const modules = `
				Icon1,
				Icon2,
				Icon3,
			`;
			expect(rawModulesToModulesList(modules)).toStrictEqual(["Icon1", "Icon2", "Icon3"]);
		});

		test("single with leading comma", () => {
			const modules = `
				,
				Icon1
			`;
			expect(rawModulesToModulesList(modules)).toStrictEqual(["Icon1"]);
		});

		test("multiple with commas and weird spacing", () => {
			const modules = `
				Icon3,
				,Icon1 ,
				Icon2 ,
				Icon4,
			`;
			expect(rawModulesToModulesList(modules)).toStrictEqual(["Icon3", "Icon1", "Icon2", "Icon4"]);
		});
	});
});

const conversionRegex = /^export \{ default as (\S+) } from ["']\.\/(\S+).svelte/gm;

describe("Icon component name conversion", async () => {
	const imports = await import("/node_modules/lucide-svelte/dist/icons/index.js?raw");
	const modules = imports.default.matchAll(conversionRegex);
	for (const module of modules) {
		const component = module[1];
		const dashedName = module[2];

		test(`${component} -> ${dashedName}`, () => {
			expect(iconCompToDashed(component)).eq(dashedName);
		});
	}
});
