# vite-plugin-lucide-preprocess

![NPM Version](https://img.shields.io/npm/v/vite-plugin-lucide-preprocess)
![NPM Downloads](https://img.shields.io/npm/dw/vite-plugin-lucide-preprocess)
![NPM Type Definitions](https://img.shields.io/npm/types/vite-plugin-lucide-preprocess)
![NPM License](https://img.shields.io/npm/l/vite-plugin-lucide-preprocess)

A [Vite](https://vitejs.dev) plugin to replace imports for [Lucide icons](https://lucide.dev).

## What is this?

This plugin is a follow-up to [this PR on Lucide](https://github.com/lucide-icons/lucide/pull/1707).  
If you want to import Lucide icons in your project, you can use two methods:

```js
import { IconName } from "lucide-svelte";
// or, since PR #1707 (at least for lucide-svelte):
import IconName from "lucide-svelte/icons/icon-name";
```

While the first method is more convenient (and may be the one used by auto-import features in your editor), it is not tree-shakeable. In fact, a single import from `"lucide-<library>"` will import all icons, which is not ideal for performance.

This plugin will replace the first method with the second one, so you can keep the convenience of the first method while benefiting from tree-shaking optimizations. “Correct” imports will be kept as-is.

> [!NOTE]
> It is primarily intended for `lucide-svelte`, but it should work with any Lucide package using Vite, if they follow the same structure.

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
  plugins: [lucidePreprocess(), ...]
});
```

> [!WARNING]
> Make sure to add the plugin **before** any other preprocessors in the `plugins` array.

## License

MIT
