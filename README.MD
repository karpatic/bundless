# Build more, bundle less.

Create React apps without bundling.

**Bundless.js**: A 36kb browser shim that resolves and transpiles React JSX code at runtime.

[Try it out](https://bundless.dev/examples/playground.html) · [Examples](https://bundless.dev/examples/index.html) · [Benchmarks](https://bundless.dev/benchmarks/index.html) · [Troubleshooting](https://bundless.dev/troubleshooting.html)

## Usage

Add Bundless to your page, then mark JSX with `type="text/jsx"` or `type="text/babel"`. Bundless transpiles it in the browser when the page loads.

### JSX and TypeScript

<strong><a href="/dist/bundless.sucrase.min.js" target="_blank">Sucrase</a>: 52Kb | source-maps</strong>

```html
<script src="./dist/bundless.sucrase.min.js"></script>
```

### JSX only

<strong><a href="/dist/bundless.acorn.min.js" target="_blank">Acorn</a>: 36Kb | no source-maps</strong>

```html
<script src="./dist/bundless.acorn.min.js"></script>
```

## Example page

Use `type="text/jsx"` to load JSX from a file:

```html
<script src="./dist/bundless.acorn.min.js"></script>
<script src="./App.jsx" type="text/jsx"></script>
```

Or write JSX directly in the page with `type="text/babel"`:

```html
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@17.0.2/es2022/react.mjs",
    "react-dom": "https://esm.sh/react-dom@17.0.2/es2022/react-dom.mjs"
  }
}
</script>

<div id="react-root"></div>

<script src="./dist/bundless.acorn.min.js"></script>
<script type="text/babel">
  import React from "react";
  import * as ReactDOM from "react-dom";

  function App() {
    return <h1>Hello World</h1>;
  }

  ReactDOM.render(<App />, document.getElementById("react-root"));
</script>
```

See more complete, working pages in [Examples](https://bundless.dev/examples/index.html), or open the [playground](https://bundless.dev/examples/playground.html).

## Options

- Add `to="preact"` to transpile React code to Preact.
- Add `cache="false"` to add a cache-busting query string to transformed imports.
- Use an import map when your JSX imports packages such as React.

That's it!

## How it works

1. Modules resolve through `<script type="importmap">`.
2. Bundless transpiles JSX in `text/jsx` and `text/babel` scripts.
3. Imports run in the browser as modules.

## Memes

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
    <img src="/memes/meme_what_gives_peope_feelings_of_power.jpg" style="width:300px;" />
    <img src="/memes/meme_did_you_just_take_both_pills.jpeg" style="width:300px;" />
    <img src="/memes/meme_left_exit_12_off_ramp.jpg" style="width:300px;" />
</div>
