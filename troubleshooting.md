# Troubleshooting Bundless

[Home](/index.html) - [Try it out](/examples/playground.html) - [Examples](/examples/index.html) - [Benchmarks](/benchmarks/index.html)

## Preact Mode    

Add `to="preact"` to the tag if you want your react code transpiled to preact. Most React code should work, but be mindful:

- 👉 Preact Portals require a DOM element
- 👉 Preact Context API consumers need a provider.
- 👉 Preact Uses `e.target.value` instead of `e.currentTarget.value`
- 👉 Preact Uses `inputRef.focus()` instead of `inputRef.current.focus()`
- 👉 Preact Uses  `e.currentTarget.value` instead of `e.target.value`

## A word from Babel

<blockquote>
    You should use a build system running on Node.js, such as Webpack, Rollup, or Parcel, to transpile your JS ahead of time. - <a href="https://babeljs.io/docs/babel-standalone">Babel Docs</a>
</blockquote>
<br>
LOL