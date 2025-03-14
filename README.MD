# Build more, bundle less.

**Bundless.js**: Resolve and transpile ReactJSX modules directly in the browser. Create multi-page React apps, without a build system, using web servers like Flask, Apache, GitHub, and VSCode.

[Demo](https://bundles.dev/index.html)

## Usage 

Import `Bundless`:

```
</script src="https://bundless.dev/rsc/bundless.acorn.min.js" type="text/javascript"> 
```

Then import your_app:

```
</script type="text/jsx" src="./YOUR_APP.jsx">
<!-- Or -->
<script type="text/jsx" >
    import { named, xport } from "./YOUR_APP.jsx"       // or
    import defaultExport from "./YOUR_APP.jsx"          // or
    import * as module from "./YOUR_APP.jsx"            // or
    const module = await import("./YOUR_APP.jsx")
</script>
``` 
 
### How does it work?  

1. `Bundless` will recursively transpile your code using:
    - ```.acorn```: 30kb but no source-map
    - ```.babel```: 500Kb but with source-maps
2. Static imports are retrieved and inserted into the page as modules.
3. Dynamic import() behavior is overwritten.   
 
 
## A word from Babel

<blockquote>
    You should use a build system running on Node.js, such as Webpack, Rollup, or Parcel, to transpile your JS ahead of time. - <a href="https://babeljs.io/docs/babel-standalone">Babel Docs</a>
</blockquote>

 