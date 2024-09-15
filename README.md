# vite-plugin-lucide-preprocess

![NPM Version](https://img.shields.io/npm/v/vite-plugin-lucide-preprocess)
![NPM Downloads](https://img.shields.io/npm/dw/vite-plugin-lucide-preprocess)
![NPM Type Definitions](https://img.shields.io/npm/types/vite-plugin-lucide-preprocess)
![NPM License](https://img.shields.io/npm/l/vite-plugin-lucide-preprocess)

A [Vite](https://vitejs.dev) plugin to replace imports for [Lucide icons](https://lucide.dev).

## What is this?

### Motivation

If you want to import Lucide icons in your project, you can use two methods
since [this PR on Lucide](https://github.com/lucide-icons/lucide/pull/1707) (at least for `lucide-svelte`):

```js
import { IconName } from "lucide-svelte";
// or
import IconName from "lucide-svelte/icons/icon-name";
```

While the first method is more convenient (and may be the one used by auto-import features in your editor),
it is not tree-shakable.
In fact, a single import from `"lucide-<framework>"` will import all icons, not ideal for performance and bundle size.

**This plugin will replace the first method with the second one, so you can keep the convenience of the first method
while benefiting from tree-shaking optimizations.** “Correct” imports will be kept as-is.

> [!NOTE]
> The plugin is primarily intended for `lucide-svelte`, but it should work with
> any Lucide package using Vite if they follow the same structure.

### Credits and opinion

I got the idea
from [Phosphor Icons' optimizer](https://github.com/haruaki07/phosphor-svelte#import-optimizer-experimental).
However, this plugin is written from scratch and is not based on the Phosphor one (even though the technique is
essentially the same).

As it is a Vite plugin and not a Svelte one, it is more generic and can be used with any framework.
Additionally, it doesn't suffer from the limitations of the Svelte plugin, preventing the Phosphor
optimizer from working without disabling the native Vite optimizations of `phosphor-svelte`.

In my opinion, this should be a feature embedded in Lucide itself (`lucide-svelte/preprocessor`),
but I don't know if it will ever be implemented.
[I opened an issue](https://github.com/lucide-icons/lucide/issues/2295) on the `lucide-icons` repository to discuss
this.

## Auto-updater

As of version 1.1.0, the plugin includes an auto-updater.
It helps support the renamed and deprecated icons by automatically updating the plugin when necessary.

If you use a recently deprecated icon and can't make your build work, please wait for a few hours for the plugin
to update itself.
If the issue persists, please open an issue on this repository.

More information about the auto-updater can be found in #6.

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
