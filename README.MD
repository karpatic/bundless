# Build more, bundle less. 

Create react apps without bundling.

**Bundless.js**: A 36kb browser shim that resolves and transpiles React JSX code at runtime.

[Try it out](https://bundless.dev/examples/playground.html) - [Examples](https://bundless.dev/examples/index.html) - [Benchmarks](https://bundless.dev/benchmarks/index.html)

## Usage  

All `type='text/jsx'`, `/tsx`, and `/babel` scripts will be transpiled onDomLoad when you place the following tag in your html page:

<strong>JSX & Typescript</strong> <a href="/dist/bundless.sucrase.min.js" target="_blank">link</a>: 52Kb | source-maps 



```
<script src="./bundless.sucrase.min.js"></script>
``` 

<strong>JSX Only</strong> <a href="/dist/bundless.acorn.min.js" target="_blank">link</a>: 36Kb | no source-maps
```
<script src="./bundless.acorn.min.js"></script>
``` 

- Add `to="preact"` if you want your react code transpiled to preact.
- Add `cache="false"` if you want transformed import URLs to receive a cache-busting query string.
- Tips on [Toubleshooting](http://localhost:3000/troubleshooting.html)

That's it! 

## Module prefetching

Use `window.Bundless.prefetch()` when an app already knows which JS, JSX, or TS module URLs it will import soon:

```html
<script>
  window.Bundless.prefetch([
    "./components/App.jsx",
    "./routes/Dashboard.jsx?startup=1"
  ]);
</script>
```

Prefetch accepts one URL or an iterable of URLs. It fetches module source only and does not transpile, import, or evaluate the module. Later `window.import()` calls reuse the same pending or resolved source fetch by normalized original URL, so equivalent URLs deduplicate while query strings and cache busters remain distinct. Failed prefetches and failed imports are evicted so retrying fetches again.

## Webpack migration

Bundless apps can move to Webpack without changing application modules that call `window.import()`:

```js
const BundlessWebpackPlugin = require("bundlessdev/webpack");

module.exports = {
  entry: "./src/index.jsx",
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: "babel-loader"
      }
    ]
  },
  plugins: [new BundlessWebpackPlugin()]
};
```

The plugin injects a small pre-loader for JavaScript, JSX, TypeScript, and TSX files. Literal `window.import("./Widget.jsx")` calls become native `import("./Widget.jsx")` expressions so Webpack owns module resolution and chunking. `window.Bundless.prefetch("./Widget.jsx")` and string-array prefetches become Webpack prefetch hints that return a resolved Promise; pass `{ prefetch: "noop" }` to make prefetch calls pure no-ops instead.

Bundless does not transform JSX in Webpack. Keep React imports in your source and configure Babel, SWC, esbuild, or another JSX loader exactly as you normally would.

Use a normal Webpack entry and avoid the browser runtime bootstrap in the built app. Remove the Bundless `<script src="...bundless.*.js">` tag and `type="text/jsx"`/`type="text/babel"` script tags from your production HTML template, or keep using HtmlWebpackPlugin and let `new BundlessWebpackPlugin()` strip those tags from emitted HTML. The plugin also aliases Bundless runtime package entry points to `false` by default so accidental runtime imports are not bundled. For manual rule wiring, the loader is exported as `bundlessdev/webpack/loader`.
 
 
## Source maps

Acorn and Meriyah intentionally split their runtime source-map behavior by build variant. The `.dev.js` variants include runtime inline source maps for debugging. The default/minified variants, such as `bundless.acorn.min.js` and `bundless.meriyah.min.js`, and the explicit `.prod.js` variants omit runtime source maps to avoid production size and runtime overhead.

This policy is specific to the Acorn and Meriyah runtime transpiler paths. Babel and Sucrase keep their existing transpiler-specific source-map behavior rather than following the Acorn/Meriyah dev/prod matrix.


## How it works

1. Modules resolve using `<script type="importmap">`.
2. Static imports are rewritten to the custom `window.import()` loader.
3. `window.Bundless.prefetch()` can warm the shared source-fetch cache without evaluating modules.
4. `window.import()` reuses any prefetched source, transpiles it, then imports the transpiled blob.
5. Repeated or concurrent imports of the same normalized original module URL share the same pending promise and resolved module.
6. Failed prefetches and imports are removed from their caches so the next call can retry, and cache-busting query strings remain part of the cache key.

## Publication

- Git tags now drive the release flow through GitHub Actions.
- Release builds are expected to be created locally before you tag and push a release.
- Release bundles are attached to GitHub Releases and can be fetched from the GitHub-backed jsDelivr CDN, for example `https://cdn.jsdelivr.net/gh/karpatic/bundless@v1.0.1/dist/bundless.acorn.min.js`.
- GitHub Releases are live through `v1.0.10`, and the GitHub-backed jsDelivr route is the current verified CDN path.
- The npm package `bundlessdev` is published to npmjs, and the same release flow can also publish a GitHub Packages variant as `@karpatic/bundlessdev`.
- Run `npm test`, run the local release build, bump `package.json` and `package-lock.json`, and then push a version tag like `v1.0.10`; GitHub Actions will use the checked-in `dist` files to create the GitHub Release, publish `bundlessdev` to npm through trusted publishing via OIDC, and publish `@karpatic/bundlessdev` to GitHub Packages with `GITHUB_TOKEN`.
- The release workflow now runs on version tags instead of every `main` push so release history stays focused on real versioned releases.

## Memes

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
    <img src="/memes/meme_what_gives_peope_feelings_of_power.jpg" style="width:300px;" /> 
    <img src="/memes/meme_did_you_just_take_both_pills.jpeg" style="width:300px;" />
    <img src="/memes/meme_left_exit_12_off_ramp.jpg" style="width:300px;" />  
</div>
