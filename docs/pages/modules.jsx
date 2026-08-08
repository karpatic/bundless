import React from "react";
import {
  Callout,
  CodeBlock,
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

const localImports = `
import React from "react";
import Counter from "./Counter.jsx";
import "./analytics.js";

export default function App() {
  return <Counter />;
}
`;

const dynamicImport = `
const module = await window.import("./Dialog.jsx");
module.openDialog();
`;

export default function ModulesPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Guide" title="Modules and imports">
        Bundless keeps browser module rules close to the surface. Import maps handle package names.
        Local app files can be fetched, transformed, cached, and imported by Bundless.
      </PageHeader>

      <h2>Use import maps for package names</h2>
      <p>
        Bare imports such as <code>react</code> and <code>react-dom</code> need an import map in
        the page. The browser reads the map before module code runs.
      </p>
      <CodeBlock code={importMapSnippet} />

      <h2>Use local imports for app files</h2>
      <p>
        Local imports with <code>.js</code>, <code>.jsx</code>, <code>.ts</code>, <code>.tsx</code>,
        or <code>.mjs</code> are resolved from the current file and loaded through
        <code>window.import()</code>.
      </p>
      <CodeBlock code={localImports} />

      <h2>Default and named imports</h2>
      <p>
        Default imports use the module's own <code>default</code> export when it exists. If the
        module has no default export, Bundless falls back to the module namespace. Named imports
        stay strict, namespace imports stay namespaces, and side-effect imports only load the file.
      </p>

      <h2>Dynamic app modules</h2>
      <p>
        Call <code>window.import(url)</code> when a module should load later. Repeated calls for
        the same normalized URL share one pending promise and then one resolved module. Failed
        imports are removed from the cache so a retry can fetch again.
      </p>
      <CodeBlock code={dynamicImport} />

      <Callout title="Cache keys include query strings">
        <p>
          Cache-busting query strings remain part of the module key. <code>./Panel.jsx?v=1</code>
          and <code>./Panel.jsx?v=2</code> are different module requests.
        </p>
      </Callout>

      <DemoLinks>
        <DemoLink href="/examples/acorn.html">Open Module Demo</DemoLink>
        <DemoLink href="/examples/prefetch.html" secondary>Open Dynamic Import Demo</DemoLink>
      </DemoLinks>
      <DemoDisclosure title="Acorn React Source + Output" url="/examples/acorn.html" />
    </div>
  );
}
