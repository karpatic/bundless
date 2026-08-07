# Build more. Bundle less.

React JSX and TypeScript can run directly in the browser without a build step.

Bundless starts with browser-native modules: serve HTML, load JSX or TSX, edit, refresh. When bundling becomes necessary, move the same application imports to Webpack. Bundling is an optimization and deployment decision, not a prerequisite for writing the app.

[Get Started](#get-started) · [Playground](https://bundless.dev/examples/playground.html) · [GitHub](https://github.com/karpatic/bundless)

## Get Started

Serve this file over HTTP:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@17.0.2/es2022/react.mjs",
          "react-dom": "https://esm.sh/react-dom@17.0.2/es2022/react-dom.mjs"
        }
      }
    </script>
  </head>
  <body>
    <div id="react-root"></div>

    <script type="text/babel">
      import React from "react";
      import ReactDOM from "react-dom";

      function App() {
        return (
          <main>
            <h1>Hello from Bundless</h1>
            <p>React JSX is running without an app bundle.</p>
          </main>
        );
      }

      ReactDOM.render(<App />, document.getElementById("react-root"));
    </script>

    <script src="/dist/bundless.acorn.min.js" type="module"></script>
  </body>
</html>
```

For a separate file, use the same imports in `App.jsx` and load it with `<script src="./App.jsx" type="text/jsx"></script>`. For TSX, load `bundless.sucrase.min.js` and keep the app script type as `text/jsx`.

## Runtime Choices

<strong><a href="/dist/bundless.acorn.min.js" target="_blank">Acorn</a>: 36Kb | default runtime | no runtime inline source maps</strong>

```html
<script src="./dist/bundless.acorn.min.js" type="module"></script>
```

<strong><a href="/dist/bundless.sucrase.min.js" target="_blank">Sucrase</a>: 52Kb | JSX + TypeScript | source-maps</strong>

```html
<script src="./dist/bundless.sucrase.min.js" type="module"></script>
```

Use Sucrase when you need JSX and TypeScript syntax. Babel and Meriyah are also available; see the [Usage Docs](https://bundless.dev/examples/index.html) for working pages and the full build matrix.

## How It Works

1. Browser import maps resolve packages such as React.
2. Bundless transforms `text/jsx` and `text/babel` scripts in the browser.
3. Local JSX, JS, TS, and TSX app modules load through `window.import()`.

Default imports use bundler-style interop: if a module owns a `default` export, Bundless uses it; otherwise the default binding falls back to the module namespace. Named imports stay named imports, namespace imports stay namespaces, and side-effect imports load only.

## Move to Webpack

Bundless is an on-ramp, not a trap. Keep ordinary imports plus literal `window.import()` and `window.Bundless.prefetch()` calls, then add [`bundlessdev/webpack`](https://bundless.dev/examples/index.html#move-to-webpack) when runtime compilation, dependency control, CSP, or production performance starts to matter.

See [Usage Docs](https://bundless.dev/examples/index.html) for runtime behavior, prefetching, troubleshooting, runnable examples, and the full Webpack API reference.
