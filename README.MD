# Build more, bundle less. 

Create react apps without bundling.

**Bundless.js**: A 36kb browser shim that resolves and tanspiles React JSX code at runtime. 

[Try it out](https://bundless.dev/examples/playground.html) - [Examples](https://bundless.dev/examples/index.html) - [Benchmarks](https://bundless.dev/benchmarks/index.html)

## Usage  

All `type='text/jsx'`, `/tsx`, and `/babel` scripts will be transpiled onDomLoad when you place the following tag in your html page:

<strong>JSX & Typescript</strong> <a href="/dist/bundless.sucrase.min.js" target="_blank">link</a>: 52Kb | source-maps 



```
</script src="./bundless.sucrase.min.js"> 
``` 

<strong>JSX Only</strong> <a href="/dist/bundless.acorn.min.js" target="_blank">link</a>: 36Kb | no source-maps
```
</script src="./bundless.acorn.min.js"> 
``` 

- Add `to="preact"` if you want your react code transpiled to preact.
- Tips on [Toubleshooting](http://localhost:3000/troubleshooting.html)

That's it! 
 
 

## How it works

1. Modules resolve using `<script type="importmap">`
1. Imports are inserted into the page as modules
2. Dynamic import() behavior gets modified 

## Publication

- Git tags now drive the release flow through GitHub Actions.
- Release builds are expected to be created locally before you tag and push a release.
- Release bundles are attached to GitHub Releases and can be fetched from the GitHub-backed jsDelivr CDN, for example `https://cdn.jsdelivr.net/gh/karpatic/bundless@v1.0.1/dist/bundless.acorn.min.js`.
- GitHub Releases are live through `v1.0.6`, and the GitHub-backed jsDelivr route is the current verified CDN path.
- The npm package `bundlessdev` is published to npmjs, and the same release flow can also publish a GitHub Packages variant as `@karpatic/bundlessdev`.
- Run the local release build, bump `package.json`, and then push a version tag like `v1.0.8`; GitHub Actions will use the checked-in `dist` files to create the GitHub Release, publish `bundlessdev` to npm through trusted publishing via OIDC, and publish `@karpatic/bundlessdev` to GitHub Packages with `GITHUB_TOKEN`.
- The release workflow now runs on version tags instead of every `main` push so release history stays focused on real versioned releases.

## Memes

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
    <img src="/memes/meme_what_gives_peope_feelings_of_power.jpg" style="width:300px;" /> 
    <img src="/memes/meme_did_you_just_take_both_pills.jpeg" style="width:300px;" />
    <img src="/memes/meme_left_exit_12_off_ramp.jpg" style="width:300px;" />  
</div>