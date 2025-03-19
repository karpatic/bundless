# Build more, bundle less. 

Create react apps with only a file server.

**Bundless.js**: A 35kb browser shim that resolves and tanspiles JSX dependencies at runtime

## Usage  

Bundless processes all `type='text/jsx'` and `'text/babel'` tags onDomLoad

<strong>JSX & Typescript</strong> <a href="/dist/bundless.sucrose.min.js" target="_blank">link</a>: 52Kb |  source-maps. 

```
</script src="./bundless.sucrase.min.js"> 
``` 

<strong>JSX Only</strong> <a href="/dist/bundless.acorn.min.js" target="_blank">link</a>: 36Kb | no source-maps.
```
</script src="./bundless.acorn.min.js"> 
``` 

That's all there is to it! 

- Add `to="preact"` if you want your react code transpiled to preact.
- This page was made with Bundless - [Try it out](./examples/playground.html) - [Examples](./examples/index.html)- [Benchmarks](./benchmarks/index.html)
 
### How it works

1. Modules are resolved using `<script type="importmap">`
1. Static imports are inserted into the page as modules.
2. Dynamic imports() are overriden. 

## A word from Babel

<blockquote>
    You should use a build system running on Node.js, such as Webpack, Rollup, or Parcel, to transpile your JS ahead of time. - <a href="https://babeljs.io/docs/babel-standalone">Babel Docs</a>
</blockquote>

## Memes

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
    <img src="/memes/meme_what_gives_peope_feelings_of_power.jpg" style="width:300px;" /> 
    <img src="/memes/meme_did_you_just_take_both_pills.jpeg" style="width:300px;" /> 
    <img src="/memes/meme_goose_chase.jpg" style="width:300px;" /> 
    <img src="/memes/meme_left_exit_12_off_ramp.jpg" style="width:300px;" />  
</div>

## Why don't more people develop with Preact?
Developers often explore Preact to bypass React bundling, but find using htm() isn't great, and lacks proper tooling and support (such as syntax highlighting and IntelliSense).

## Functional React V Preact/Compat   
If you use preact/compat, most React code works, but be mindful: 
👉 Preact Portals require a DOM element
👉 Preact Context API consumers need a provider.
👉 Preact Uses `e.target.value` instead of `e.currentTarget.value`
👉 Preact Uses `inputRef.focus()` instead of `inputRef.current.focus()`
👉 Preact Uses  `e.currentTarget.value` instead of `e.target.value`