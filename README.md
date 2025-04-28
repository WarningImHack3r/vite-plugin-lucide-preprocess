# vite-plugin-lucide-preprocess

[![NPM Version](https://img.shields.io/npm/v/vite-plugin-lucide-preprocess)](https://www.npmjs.com/package/vite-plugin-lucide-preprocess?activeTab=versions)
[![NPM Downloads](https://img.shields.io/npm/dw/vite-plugin-lucide-preprocess)](https://www.npmjs.com/package/vite-plugin-lucide-preprocess)
[![NPM Type Definitions](https://img.shields.io/npm/types/vite-plugin-lucide-preprocess)](https://www.npmjs.com/package/vite-plugin-lucide-preprocess)
[![NPM License](https://img.shields.io/npm/l/vite-plugin-lucide-preprocess)](LICENSE)

A [Vite](https://vite.dev) plugin to replace imports for [Lucide icons](https://lucide.dev).

## What is this?

### Motivation

If you want to import Lucide icons in your project, you can (usually — depending on
the package) use two methods:

```js
import { IconName } from "@lucide/svelte";
// or
import IconName from "@lucide/svelte/icons/icon-name";
```

While the first method is more convenient (and may be the one used by auto-import features in your editor),
it is not tree-shakable.  
In fact, a single import from `"lucide-<framework>"` or `"@lucide/<framework>"`
[will import all icons](https://github.com/WarningImHack3r/vite-plugin-lucide-preprocess/issues/11#issuecomment-2445209558);
not ideal for Vite dev server performance and build time.

**This plugin will replace the first method with the second one, so you can keep the convenience of the first method
while benefiting from tree-shaking optimizations.** “Correct” imports will be kept as-is.

> [!NOTE]
> The plugin is primarily intended for `@lucide/svelte`, but it works with
> any Lucide package using Vite.
> If it doesn't support a Lucide implementation,
> [please open an issue](https://github.com/WarningImHack3r/vite-plugin-lucide-preprocess).

### Credits and opinion

I got the idea from [Phosphor Icons' optimizer](https://github.com/haruaki07/phosphor-svelte#import-optimizer).
However, this plugin is written from scratch and is not based on the Phosphor one, even though the technique is
essentially the same.

Contrary to the experimental version of Phosphor Icons' implementation, this plugin is
a Vite plugin and not a Svelte one, it is more generic and can be used with any framework.
Additionally, it doesn't suffer from the limitations of the Svelte plugin, preventing the old Phosphor
optimizer from working without disabling the native Vite optimizations of `phosphor-svelte`.

This should subjectively be a feature embedded in Lucide itself (`@lucide/svelte/preprocessor`),
but I don't know if it will ever be implemented.
[I opened an issue](https://github.com/lucide-icons/lucide/issues/2295) on the `lucide-icons` repository to discuss
this.

## Auto-updater

As of version 1.1.0, the plugin includes an auto-updater.
It helps support the renamed and deprecated icons by automatically updating the plugin when necessary.

If you use a recently deprecated icon and can't make your build work, please wait for a few hours for the plugin
to update itself.
If the problem persists, please open an issue in this repository.

More information about the auto-updater can be found in WarningImHack3r/vite-plugin-lucide-preprocess#6.

## Installation

Install the plugin with your package manager of choice:

```bash
pnpm i -D vite-plugin-lucide-preprocess
```

Then, add it to your `vite.config.js`/`.ts`:

```js
import { defineConfig } from "vite";
import lucidePreprocess from "vite-plugin-lucide-preprocess";

export default defineConfig({
	plugins: [lucidePreprocess() /* , ... */]
});
```

> [!WARNING]
> Make sure to add the plugin **before** any other preprocessors in the `plugins` array.

## Options

The plugin optionally accepts an object with the following options:

- `importMode` (default: `"esm"`): The import mode for CommonJS-compatible frameworks.

  - `"esm"`: Import the icons as ES modules.
  - `"cjs"`: Import the icons as CommonJS modules.

  This option is useful if you use a CommonJS-compatible framework like React or Vue.
  It will automatically replace the imports with the correct syntax depending on whether
  your framework supports CJS or not.

## License

MIT
