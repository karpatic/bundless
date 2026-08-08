import React from "react";
import {
  Callout,
  CodeBlock,
  codeLines,
  DemoDisclosure,
  DemoLink,
  DemoLinks,
  PageHeader,
} from "../App.jsx";

const importMapSnippet = `
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@17.0.2/es2022/react.mjs",
    "react-dom": "https://esm.sh/react-dom@17.0.2/es2022/react-dom.mjs"
  }
}
</script>
`;

const localImports = codeLines([
  "import React from \"react\";",
  "import Counter from \"./Counter.jsx\";",
  "import \"./analytics.js\";",
  "",
  "export default function App() {",
  "  return <Counter />;",
  "}",
]);

const dynamicImport = `
const dialog = await window.import("./Dialog.jsx");
dialog.openDialog();
`;

export default function ModulesPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Guide" title="Load packages and application modules">
        Use an import map for package names. Use local paths for application source.
      </PageHeader>

      <h2>Map package names</h2>
      <p>
        Bare imports such as <code>react</code> remain native browser imports. Put the import map
        before the Bundless runtime and before application code runs.
      </p>
      <CodeBlock code={importMapSnippet} />

      <h2>Import local source</h2>
      <p>
        Bundless routes local static imports through its loader when the path ends in
        <code>.mjs</code>, <code>.js</code>, <code>.jsx</code>, <code>.ts</code>, or
        <code>.tsx</code>. It resolves the path from the file that contains the import.
      </p>
      <CodeBlock code={localImports} />
      <p>
        A default import uses the module <code>default</code> export. If there is no default export,
        Bundless uses the module namespace for that binding. Named imports must match named exports.
        Namespace imports remain namespaces. A side-effect import only loads and runs the module.
      </p>

      <h2>Load a module after startup</h2>
      <CodeBlock code={dynamicImport} />
      <p>
        <code>window.import()</code> is the Bundless loader, not native <code>import()</code>. It
        fetches the source, transforms it, evaluates a temporary <code>blob:</code> module, and
        resolves to the module namespace.
      </p>

      <h2>Understand the cache</h2>
      <ul>
        <li>Relative and absolute forms of the same normalized URL share one promise.</li>
        <li>Concurrent calls share the pending promise and one evaluated module.</li>
        <li>A failed import is removed so that the next call can fetch and run again.</li>
        <li>Query strings are part of the key. <code>?v=1</code> and <code>?v=2</code> are different modules.</li>
      </ul>

      <Callout title="Cross-origin source needs CORS">
        <p>
          Bundless reads local module source with <code>fetch()</code>. A different origin must send
          CORS headers that permit the page to read the response.
        </p>
      </Callout>

      <DemoLinks>
        <DemoLink href="/examples/acorn.html">Open module demo</DemoLink>
        <DemoLink href="/examples/prefetch.html" secondary>Open dynamic-import demo</DemoLink>
      </DemoLinks>
      <DemoDisclosure title="Show module demo source and output" url="/examples/acorn.html" />
    </div>
  );
}
