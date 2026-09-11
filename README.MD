# Build more, bundle less.

Create React apps with a file server.

Bundless resolves nested imports in the browser. Your React app can keep components in separate files, and those components can import more components, with no local bundler.

Use it on shared hosting, GitHub Pages, a simple PHP site, or any account that includes static file serving.

The local default Acorn runtime is about 35.1 kB with Brotli; Sucrase is about 56.4 kB (decimal kB). These are runtime files only, when served with Brotli. See [browser footprint](#browser-footprint) for raw sizes and package scope.

[Usage Docs](https://bundless.dev/usage.html) · [Getting Started](https://bundless.dev/docs/getting-started.html) · [Playground](https://bundless.dev/playground.html) · [Benchmarks](https://bundless.dev/benchmarks.html) · [GitHub](https://github.com/karpatic/bundless)

## Getting Started

Acquire a version-pinned runtime in a fresh folder. The footprint refactor described below is local and unreleased; these npm/CDN examples do not promise the new bytes in the published `1.0.12` package:

```sh
npm init -y
npm install --save-exact bundlessdev@1.0.12
mkdir -p vendor components
cp node_modules/bundlessdev/dist/bundless.acorn.min.js vendor/bundless.acorn.min.js
```

Serve a plain HTML file over HTTP. Keep local paths relative so the same folder works at a domain root or below a hosted subdirectory.

Put this in the page if your JSX imports React by name:

```html
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@17.0.2/es2022/react.mjs",
    "react-dom": "https://esm.sh/react-dom@17.0.2/es2022/react-dom.mjs"
  }
}
</script>
```

External JSX:

```html
<div id="react-root"></div>
<script src="./App.jsx" type="text/jsx"></script>
<script src="./vendor/bundless.acorn.min.js" type="module"></script>
```

Inline JSX:

```html
<div id="react-root"></div>
<script type="text/jsx">
  import React from "react";
  import ReactDOM from "react-dom";

  function App() {
    return <h1>Finally, the page exists.</h1>;
  }

  ReactDOM.render(<App />, document.getElementById("react-root"));
</script>
<script src="./vendor/bundless.acorn.min.js" type="module"></script>
```

TSX is the same idea, just swap in Sucrase and keep the app script as `text/jsx`:

```sh
cp node_modules/bundlessdev/dist/bundless.sucrase.min.js vendor/bundless.sucrase.min.js
```

```html
<script src="./App.tsx" type="text/jsx"></script>
<script src="./vendor/bundless.sucrase.min.js" type="module"></script>
```

Acorn is the small default. Sucrase handles JSX plus TypeScript. Babel, Meriyah, prefetching, Webpack migration, and the rest are in the [Usage Docs](https://bundless.dev/usage.html).

## Browser footprint

Measured from the checked-in artifacts after the local refactor at `0aab0e6`.
The package version remains `1.0.12`; these changes are unreleased.
All sizes below use decimal **kB = 1,000 bytes**, rounded to one decimal.

| Browser artifact in `dist/` | Raw kB | Brotli kB |
| --- | ---: | ---: |
| `bundless.acorn.min.js` / `.prod.js` | 139.6 | 35.1 |
| `bundless.acorn.dev.js` | 204.4 | 49.9 |
| `bundless.meriyah.min.js` / `.prod.js` | 155.5 | 41.8 |
| `bundless.meriyah.dev.js` | 214.3 | 55.9 |
| `bundless.sucrase.min.js` | 283.8 | 56.4 |
| `bundless.babel.min.js` (wrapper only) | 26.1 | 9.6 |

Brotli sizes are the checked-in `.js.br` files and apply to downloads only when
the server serves them with `Content-Encoding: br`. A plain `.js` response can
transfer the raw size instead. React, ReactDOM, application code, and other
external dependencies are additional downloads. The Babel wrapper excludes its
external Babel Standalone compiler.

The full local npm package dry run is about **980 kB compressed / 3,300 kB
unpacked across 20 files**, rounded to the nearest 10 kB. This includes all
runtime variants, Brotli companions, Webpack helpers, package metadata, and
this README. It is neither a single browser download nor the installed size
of the app and its dependencies.

## What the browser does

Acorn and Meriyah parse each compilation once and reuse that AST for module
metadata and JSX edits. Ordinary JavaScript source is preserved around those
edits instead of regenerating the whole program. Their parsers remain bundled,
but a separate module lexer and its WASM payload are no longer bundled.
Babel and Sucrase retain their compiler-plus-lexer path. React is not bundled
in any runtime.

Default `.min.js` paths are genuinely minified. For Acorn and Meriyah, `.min.js`
and `.prod.js` are byte-identical and omit inline runtime source maps;
`.dev.js` retains maps for the final transformed source. Babel and Sucrase
still append their compiler maps inline; those maps are not composed through
the loader's later rewrites.

`window.import()` caches by normalized original module URL: concurrent and
repeated imports share a pending promise and resolved module, failures are
evicted for retry, and query strings distinguish cache entries. Transformed
local bindings are snapshots; full native ESM live bindings and cyclic
custom-loader graphs are unsupported. See [module limits](DOCS.md#modules-and-cache).

## Local checks

Run `npm test` for source and emitted-runtime behavior, lexer/WASM separation,
min/prod parity, Brotli/source parity, and the rendered runtime-doc content.
Run `npm pack --dry-run --json` after README edits to measure the full local
package. Artifact sizes can be inspected with `wc -c dist/*.js dist/*.js.br`.
Prose changes do not require rebuilding `dist`.

## Memes

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
  <img src="memes/meme_what_gives_peope_feelings_of_power.jpg" style="width:300px;" />
  <img src="memes/meme_did_you_just_take_both_pills.jpeg" style="width:300px;" />
  <img src="memes/meme_left_exit_12_off_ramp.jpg" style="width:300px;" />
</div>
