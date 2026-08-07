# Build more, bundle less.

Create React apps without bundling.

**Bundless.js**: A 36kb browser shim that resolves and transpiles React JSX code at runtime.

[Try it out](https://bundless.dev/examples/playground.html) · [Examples](https://bundless.dev/examples/index.html) · [Benchmarks](https://bundless.dev/benchmarks/index.html) · [Troubleshooting](https://bundless.dev/troubleshooting.html)

## Usage

Add Bundless to your page, then mark JSX with `type="text/jsx"` or `type="text/babel"`. Bundless transpiles it in the browser when the page loads.

### Runtime choices

<strong><a href="/dist/bundless.acorn.min.js" target="_blank">Acorn</a>: 36Kb | default runtime | no runtime inline source maps</strong>

```html
<script src="./dist/bundless.acorn.min.js" type="module"></script>
```

<strong><a href="/dist/bundless.acorn.dev.js" target="_blank">Acorn dev</a>: browser debugging source maps</strong>

```html
<script src="./dist/bundless.acorn.dev.js" type="module"></script>
```

Use Acorn for normal JSX pages. Use Acorn dev when you want runtime inline source maps so browser debugging points back to the JSX source; Acorn default/min and explicit `.prod.js` builds omit those runtime maps.

<strong><a href="/dist/bundless.sucrase.min.js" target="_blank">Sucrase</a>: 52Kb | JSX + TypeScript | source-maps</strong>

```html
<script src="./dist/bundless.sucrase.min.js" type="module"></script>
```

Use Sucrase when you need JSX and TypeScript syntax. Babel and Meriyah are also available; see the [examples grid](https://bundless.dev/examples/index.html) for working pages and the full build matrix.

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
