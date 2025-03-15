# Build more, bundle less. 

Create react apps using only a file server.

**Bundless.js**: A 35kb browser shim to resolve and tanspile JSX dependencies at runtime

## Usage  

Bundless processes all `type='text/jsx'` and `text/babel` tags onDomLoad

<a href="/dist/bundless.babel.min.js" target="_blank"><strong>Development</strong></a>: 500Kb | no caching | source-maps.
```
</script src="./bundless.babel.min.js"> 
``` 

<a href="/dist/bundless.acorn.min.js" target="_blank"><strong>Production</strong></a>: 35Kb | caching | no source-maps.
```
</script src="./bundless.acorn.min.js"> 
``` 

That's all there is to it! 

- This page was made with Bundless - [Try it out](./tests/index.html) - [Examples](./tests/index.html)
 
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
    <img src="/memes/meme_running_away_ballon.jpg" style="width:300px;" /> 
    <img src="/memes/meme_anime_girl_hiding_from_terminator.jpg" style="width:300px;" /> 
    <img src="/memes/meme_goose_chase.jpg" style="width:300px;" /> 
    <img src="/memes/meme_left_exit_12_off_ramp.jpg" style="width:300px;" />  
</div>