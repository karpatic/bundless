# Bundless

Run JSX or TSX from a plain HTML page. Start with a static file server. Add Webpack later if the project needs a build.

Bundless transforms application source in the browser. It does not make an application bundle.

[Usage](https://bundless.dev/usage.html) · [Playground](https://bundless.dev/playground.html) · [Troubleshooting](https://bundless.dev/docs/troubleshooting.html) · [Benchmarks](https://bundless.dev/benchmarks.html) · [GitHub](https://github.com/karpatic/bundless)

## Run the first page

Save this code as `index.html`. Then serve the directory over HTTP.

```html
<!doctype html>
<meta charset="utf-8">
<title>Bundless example</title>

<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@17.0.2/es2022/react.mjs",
    "react-dom": "https://esm.sh/react-dom@17.0.2/es2022/react-dom.mjs"
  }
}
</script>

<div id="react-root"></div>
<script type="text/jsx">
  import React from "react";
  import ReactDOM from "react-dom";

  ReactDOM.render(
    <h1>Hello from Bundless.</h1>,
    document.getElementById("react-root")
  );
</script>
<script
  src="https://cdn.jsdelivr.net/npm/bundlessdev@1.0.12/dist/bundless.acorn.min.js"
  type="module"
></script>
```

Run a file server from the same directory:

```sh
npx http-server .
```

Do not open the page as a `file://` URL. Browser module and fetch rules can block the page.

## Put JSX in a file

Use the same import map. Replace the inline application script with this tag:

```html
<div id="react-root"></div>
<script src="./App.jsx" type="text/jsx"></script>
<script
  src="https://cdn.jsdelivr.net/npm/bundlessdev@1.0.12/dist/bundless.acorn.min.js"
  type="module"
></script>
```

Bundless scans only `script[type="text/jsx"]` and `script[type="text/babel"]`. It fetches external source, transforms it, and inserts a module script.

## Use TypeScript or TSX

Use Sucrase. Keep `type="text/jsx"` even when the file name is `App.tsx`.

```html
<script src="./App.tsx" type="text/jsx"></script>
<script
  src="https://cdn.jsdelivr.net/npm/bundlessdev@1.0.12/dist/bundless.sucrase.min.js"
  type="module"
></script>
```

Sucrase removes TypeScript syntax. It does not type-check the source.

## Choose a runtime

| Runtime | Pick it when | Builds |
| --- | --- | --- |
| Acorn | You need the recommended JSX default. | `bundless.acorn.min.js`, `bundless.acorn.prod.js`, `bundless.acorn.dev.js` |
| Meriyah | You need the alternate JSX parser. | `bundless.meriyah.min.js`, `bundless.meriyah.prod.js`, `bundless.meriyah.dev.js` |
| Babel | You need Babel Standalone syntax support. | `bundless.babel.min.js`; it loads Babel Standalone if the page did not load it. |
| Sucrase | You need JSX, TypeScript, or TSX. | `bundless.sucrase.min.js` |

The checked-in Brotli files are approximately 37 KiB for Acorn and 53 KiB for Sucrase. Acorn and Meriyah development builds include inline runtime source maps. Their default and production builds omit these maps. Babel and Sucrase always use their own inline source-map behavior.

## Load application modules

Bare package imports remain browser imports. Define them in an import map. Bundless routes local static imports with `.mjs`, `.js`, `.jsx`, `.ts`, or `.tsx` through its loader.

Use `window.import()` to load a local module later:

```js
const dialog = await window.import("./Dialog.jsx");
dialog.openDialog();
```

`window.import()` is a Bundless function. It is not native `import()`. It fetches the source, transforms it, evaluates a blob module, and returns the module namespace. Calls for the same normalized URL share one cached promise. A failed call is removed from the cache so that the next call can retry. Query strings remain part of the cache key.

## Prefetch a likely module

```js
await window.Bundless.prefetch("./Dialog.jsx");
```

This call fetches source into the source cache. It does not transform or evaluate the module. A later `window.import()` does that work.

A declarative prefetch can fetch and transform source during page startup. It does not evaluate the module:

```html
<script type="application/json" data-bundless-prefetch>
["./Dialog.jsx", "./Settings.jsx"]
</script>
```

## Know the limits

- Use a modern browser with ES modules, dynamic import, `fetch()`, blob URLs, top-level `await`, and import maps when you use package names.
- Cross-origin source must permit CORS reads.
- A strict Content Security Policy must permit the generated inline module and `blob:` module URLs. Some strict policies are not compatible with browser compilation.
- The browser downloads parser code and transforms application source at startup. Measure this cost on the target devices and network.
- Browser caches can cache pinned runtime and package URLs, but Bundless does not replace a production asset pipeline.
- Pin CDN package versions. An unpinned URL can change without a source change in your project.
- Inline source maps add transfer and memory cost in builds that include them.

Use Bundless for demos, documentation, prototypes, and small static applications. Use a build when you need strict CSP, type checking, optimized assets, production chunks, or controlled dependency output.

## Move to Webpack

The Webpack plugin rewrites supported Bundless calls and can remove Bundless tags from HtmlWebpackPlugin output. The Bundless loader does not transpile JSX or TypeScript. Keep Babel, SWC, esbuild, or TypeScript compilation in the Webpack configuration.

Read the [Webpack migration guide](https://bundless.dev/migration.html).
