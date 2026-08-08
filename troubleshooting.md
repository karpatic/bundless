# Fix a Bundless page

[Usage](/usage.html) · [Playground](/playground.html) · [Webpack migration](/migration.html) · [Canonical troubleshooting page](/docs/troubleshooting.html)

Start with the browser console and network panel. Then use the symptom that matches the failure.

## The page does not run

1. Serve the project over HTTP. Do not use a `file://` URL.
2. Put the import map before application modules run.
3. Load the Bundless runtime as `type="module"`.
4. Check failed requests and JavaScript errors.

```sh
npx http-server .
```

## The console says “No JSX scripts found”

Bundless scans only `script[type="text/jsx"]` and `script[type="text/babel"]`. Use one of these exact types for inline and external source.

For TSX, use Sucrase and keep `type="text/jsx"`:

```html
<script src="./App.tsx" type="text/jsx"></script>
<script src="/dist/bundless.sucrase.min.js" type="module"></script>
```

Do not use `type="text/tsx"`.

## TypeScript or TSX has a syntax error

Use `bundless.sucrase.min.js`. Acorn and Meriyah parse JSX, not TypeScript. Sucrase removes TypeScript syntax; it does not type-check the source.

## A package import cannot resolve

Put each bare package name in the page import map. A bare import such as `react` remains a native browser import. Use a relative or absolute URL for local source, such as `./App.jsx` or `/app/App.jsx`.

## A local module does not load

- Confirm that the URL returns source and not an HTML error page.
- Use `.mjs`, `.js`, `.jsx`, `.ts`, or `.tsx` for source that Bundless must transform.
- Make named imports match named exports.
- Retry after a temporary failure. A failed `window.import()` call is removed from the cache.

Default imports use the module `default` export when it exists. If there is no default export, Bundless uses the module namespace for that default binding. Named imports remain strict. Namespace imports remain namespaces. Side-effect imports only load and run the module.

## A cross-origin request fails

Bundless reads source with `fetch()`. The source server must send CORS headers that permit the page origin. A resource that loads from a script tag is not always readable with `fetch()`.

## Content Security Policy blocks the page

Bundless creates an inline module script and evaluates transformed application modules from `blob:` URLs. The policy must permit the runtime, generated inline script, module dependencies, and `blob:` modules.

A strict nonce-only or hash-only policy can be incompatible because Bundless creates code in the browser. Use a build if the policy cannot permit this behavior.

## Prefetch does not run the module

This is correct. `window.Bundless.prefetch()` only fetches source. Declarative prefetch JSON fetches and transforms source. Neither form evaluates a module. Use `window.import()` when the application must run it.

## Preact mode differs from React

The `to="preact"` mode rewrites a limited set of React and ReactDOM calls. It is not a complete React compatibility layer. Check portals, context providers, refs, fragments, hooks, and form events. Use a direct Preact setup when the application needs behavior that the rewrite does not cover.

## Source maps or startup are too large

For Acorn or Meriyah, use `.min.js` or `.prod.js` to omit inline runtime source maps. Use `.dev.js` only when you need those maps. Babel and Sucrase keep their own inline source-map behavior.

If parser download or browser transformation is too costly, [move compilation to Webpack](/migration.html). There is no universal project-size limit. Measure the target page on the target devices and network.

## Check production limits

Before release, verify:

- browser support for ES modules, dynamic import, `fetch()`, blob URLs, top-level `await`, and import maps when used;
- CSP and CORS policy;
- startup transformation cost;
- cache headers;
- pinned runtime and package versions;
- source-map transfer and memory cost.

Bundless is useful for demos, documentation, prototypes, and small static applications. It does not replace a controlled production asset pipeline.
