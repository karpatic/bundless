# Troubleshooting Bundless

[Home](/) - [Playground](/playground.html) - [Usage Docs](/usage.html) - [Benchmarks](/benchmarks.html)

## Preact Mode    

Add `to="preact"` to the tag if you want your react code transpiled to preact. Most React code should work, but be mindful:

- 👉 Preact Portals require a DOM element
- 👉 Preact Context API consumers need a provider.
- 👉 Preact Uses `e.target.value` instead of `e.currentTarget.value`
- 👉 Preact Uses `inputRef.focus()` instead of `inputRef.current.focus()`
- 👉 Preact Uses  `e.currentTarget.value` instead of `e.target.value`

### Import interop

Default imports use the module's own `default` export when it exists. If a module has no default export, Bundless falls back to the module namespace for that default binding. Named imports remain strict, namespace imports stay namespaces, and side-effect imports only load the module.

## A word from Babel

<blockquote>
    You should use a build system running on Node.js, such as Webpack, Rollup, or Parcel, to transpile your JS ahead of time. - <a href="https://babeljs.io/docs/babel-standalone">Babel Docs</a>
</blockquote>
<br>
LOL
