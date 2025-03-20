# Build more, bundle less. 

Create react apps without bundling.

**Bundless.js**: A 36kb browser shim that resolves and tanspiles React JSX code at runtime. 

[Try it out](https://bundless.dev/examples/playground.html) - [Examples](https://bundless.dev/examples/index.html)- [Benchmarks](https://bundless.dev/benchmarks/index.html)

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
- Tips on [Toubleshooting](https://bundless.dev/troubleshooting.md)

That's it! 
 
 

## How it works

1. Modules resolve using `<script type="importmap">`
1. Imports are inserted into the page as modules
2. Dynamic import() behavior gets modified 

## Memes

<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
    <img src="/memes/meme_what_gives_peope_feelings_of_power.jpg" style="width:300px;" /> 
    <img src="/memes/meme_did_you_just_take_both_pills.jpeg" style="width:300px;" />
    <img src="/memes/meme_left_exit_12_off_ramp.jpg" style="width:300px;" />  
</div>