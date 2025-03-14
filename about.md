# Build on the browser, bundle less.

Introducing **`bundless.js`:** Resolve and transpile ReactJSX at runtime.

Wite React without a build step.

Put `</script src="./bundless.js" type="text/javascript">` at the top of an html file to write multi-file JSX-projects without the need of a bundler. Skip the dev-env and build on any kind of web server: flask, apache, github code-spaces free tier, a browser bookmark, you name it.

Babel does not resolve nested modules, anyone who wants to develop a React app must now acquaint with a complex server environment. 

Here is what they say about the matter:

<blockquote>
    You should use a build system running on Node.js, such as Webpack, Rollup, or Parcel, to transpile your JS ahead of time. - <a href="https://babeljs.io/docs/babel-standalone">Babel Docs</a>
</blockquote>


<div align="center"> 
    <br>
    <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNjMWlhdnQ4MnlmOTkwazRhdmNyamNoZGFyMjB4dHl5aTh0emZyMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OX25cp7DL6Bt81Yb47/giphy.gif" width="150"><br>  Should? <br>
</div>

Modern browsers already support ESModules and NPM libraries near natively, e.g. Snowpack and Skypack. 

And so here we are:
 

For the purpose of this article, assume the following definitions: 

```
JSX - Developer friendly JavaScript unintelligible to the browser.

Transpiler (Babel.js) - Converts JSX to JS

Resolver - Locates files of code needed by other code

Bundler -  Merges all resolved code used in a project

Compiler - Transpiles and optimizes bundled assets
```

- Snowpack is a server side build tool that compiles npm modules so that they may be imported in the browser. It does not compile the code you write, bundling everything on filechange.


https://deno.com/blog/fresh-is-stable

split & chunk the data, or to minify (dead code elimination, tree-shaking, etc), etc 
  

than can resolve dependencies 
enables incremental development for many
Allowing

CDN - Use a lightweight API endpoint that transpiles and caches code on first request.

Worker-Based Transpilation (Web Workers)
How: Offload transpilation to a Web Worker to avoid blocking the main thread.
 


## Bridging the Gap

The difference in developing Node applications and Browser applications continue to shrink.

Modern browsers can now support:  

- Native ES Modules - `<script type="module">` - Enabling the 'import' of dependencies
- Native Import Maps - `<script type="importmap">` - Allowing aliased module resolution of said dependencies.

These additions allow developers to write server and browser code similarly, forgoing the explicit need of a build step. 

## Shortcomings of not having a build-step: 

- Not transpiled
- Not minified
- Bundle not optimized for load

Everything works just fine like this provided you are writing browser compliant JavaScript.
The problem emerges when you want to write code using syntactic sugars like JSX or Typescript, etc. that get converted a built time.

## Current Solutions and Tools

- React  w/ Babel-standalone - `<script type='text/babel'>` - Babel can't resolve imports!
- StealJs - extends SystemJS - Resolves and bundles on client. Uses babel-standalone. 
 - https://github.com/stealjs/steal-react-jsx
- Steal-tools - Server based build tool: Transpile, Optimize, Minimize, and tree-shake.

## Resolvers 
- SystemJs - Resolves modules - A Universal module loader. That's it.  
 
- handling multiple runtime environments
- build step configuration
  
 StealJS extends SystemJS but provides more features for efficient module loading and bundling.

 
Native Import Maps `<script type="importmap">` 
Native ES Modules `<script type="module">` (Limitations: Doesn't handle dependencies as efficiently as a loader like SystemJS.)
Systemjs - universal module loader w import map support
Steal - Can be buildless or bundled. 



Buildless CDNs: 
- JSPM: Best for structured ES module. includes: (resolution with import maps, fully optimizes npm packages, node polyfills, uses SystemJS as a fallback)
- Skypack: Great for quick prototyping, (converts modules to esm).
- ESM.sh: Optimized for browsers, includes: (tree shaking, node polyfills, converts commonjs to esm )
- UNPKG: Serves raw npm packages.