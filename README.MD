# Build more. Bundle less.

React JSX in the browser. No starter temple. No local Node shrine. No "first configure the toolchain" side quest.

Write the component. Refresh the tab. Get on with your life.

**Bundless.js**: 36Kb Acorn runtime for JSX. Need TypeScript or TSX? Use Sucrase: 52Kb.

[Playground](https://bundless.dev/examples/playground.html) · [Usage Docs](https://bundless.dev/examples/index.html) · [Benchmarks](https://bundless.dev/benchmarks/index.html) · [GitHub](https://github.com/karpatic/bundless)

## Getting Started

Serve a plain HTML file over HTTP. Browsers do not fetch modules from vibes.

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
<script src="./dist/bundless.acorn.min.js" type="module"></script>
```

Inline JSX:

```html
<div id="react-root"></div>
<script type="text/babel">
  import React from "react";
  import ReactDOM from "react-dom";

  function App() {
    return <h1>Finally, the page exists.</h1>;
  }

  ReactDOM.render(<App />, document.getElementById("react-root"));
</script>
<script src="./dist/bundless.acorn.min.js" type="module"></script>
```

TSX is the same idea, just swap in Sucrase and keep the app script as `text/jsx`:

```html
<script src="./App.tsx" type="text/jsx"></script>
<script src="./dist/bundless.sucrase.min.js" type="module"></script>
```

Acorn is the small default. Sucrase is for JSX plus TypeScript. Babel, Meriyah, prefetching, Webpack migration, cache behavior, and the other sharp bits live in the [Usage Docs](https://bundless.dev/examples/index.html), where that wall of detail belongs.

## Memes

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
  <img src="memes/meme_what_gives_peope_feelings_of_power.jpg" style="width:300px;" />
  <img src="memes/meme_did_you_just_take_both_pills.jpeg" style="width:300px;" />
  <img src="memes/meme_left_exit_12_off_ramp.jpg" style="width:300px;" />
</div>
