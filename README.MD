# Build more, bundle less.

Create React apps with a file server.

Bundless resolves nested imports in the browser. Your React app can keep components in separate files, and those components can import more components, with no local bundler.

Use it on shared hosting, GitHub Pages, a simple PHP site, or any account that includes static file serving.

The checked-in Brotli files are about 44.6 KiB for the default Acorn runtime and 60.0 KiB for Sucrase. Those figures are measured binary KiB for the runtime file only; React and application code are outside that scope.

[Usage Docs](https://bundless.dev/usage.html) · [Getting Started](https://bundless.dev/docs/getting-started.html) · [Playground](https://bundless.dev/playground.html) · [Benchmarks](https://bundless.dev/benchmarks.html) · [GitHub](https://github.com/karpatic/bundless)

## Getting Started

Acquire a version-pinned runtime in a fresh folder:

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

## Memes

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
  <img src="memes/meme_what_gives_peope_feelings_of_power.jpg" style="width:300px;" />
  <img src="memes/meme_did_you_just_take_both_pills.jpeg" style="width:300px;" />
  <img src="memes/meme_left_exit_12_off_ramp.jpg" style="width:300px;" />
</div>
