import React from "react";
import {
  Callout,
  CardGrid,
  CodeBlock,
  codeLines,
  DemoLink,
  DemoLinks,
  LinkCard,
  PageHeader,
  RuntimeTable,
} from "../App.jsx";

const firstPage = codeLines([
  "<!doctype html>",
  "<meta charset=\"utf-8\">",
  "<title>Bundless example</title>",
  "<script type=\"importmap\">",
  "{",
  "  \"imports\": {",
  "    \"react\": \"https://esm.sh/react@17.0.2/es2022/react.mjs\",",
  "    \"react-dom\": \"https://esm.sh/react-dom@17.0.2/es2022/react-dom.mjs\"",
  "  }",
  "}",
  "</script>",
  "<div id=\"react-root\"></div>",
  "<script type=\"text/jsx\">",
  "  import React from \"react\";",
  "  import ReactDOM from \"react-dom\";",
  "  ReactDOM.render(",
  "    <h1>Hello from Bundless.</h1>,",
  "    document.getElementById(\"react-root\")",
  "  );",
  "</script>",
  "<script src=\"/dist/bundless.acorn.min.js\" type=\"module\"></script>",
]);

export default function UsagePage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Usage" title="Run source now. Add a build later.">
        Bundless runs JSX or TSX from a static server. It transforms source in the browser and does not make an application bundle.
      </PageHeader>

      <h2>Run the first page</h2>
      <p>
        Save this file as <code>index.html</code>. Serve the directory over HTTP. The example uses
        Acorn, which is the recommended JSX runtime.
      </p>
      <CodeBlock code={firstPage} />
      <CodeBlock code={`npx http-server .`} />
      <p>
        The runtime scans <code>script[type="text/jsx"]</code> and
        <code>script[type="text/babel"]</code>. Package imports need an import map.
      </p>

      <h2>Choose the next task</h2>
      <CardGrid>
        <LinkCard href="/docs/getting-started.html" title="Use an external JSX file">
          Move application code from the HTML file to <code>App.jsx</code>.
        </LinkCard>
        <LinkCard href="/docs/guides/modules.html" title="Load modules">
          Use import maps, local imports, and <code>window.import()</code>.
        </LinkCard>
        <LinkCard href="/docs/guides/typescript.html" title="Use TypeScript or TSX">
          Select Sucrase and keep a supported script type.
        </LinkCard>
        <LinkCard href="/docs/features/prefetch.html" title="Prefetch modules">
          Fetch likely source before a later import.
        </LinkCard>
        <LinkCard href="/docs/troubleshooting.html" title="Fix a problem">
          Check HTTP, script types, imports, CSP, and CORS.
        </LinkCard>
        <LinkCard href="/migration.html" title="Add Webpack">
          Keep supported source calls and move compilation into a build.
        </LinkCard>
      </CardGrid>

      <h2>Choose a runtime</h2>
      <RuntimeTable />

      <h2>Understand the browser work</h2>
      <ul>
        <li>Bare package imports remain native browser imports and use the page import map.</li>
        <li>Local static imports for supported source extensions use the Bundless module loader.</li>
        <li><code>window.import()</code> fetches, transforms, evaluates, and caches a module namespace.</li>
        <li><code>window.Bundless.prefetch()</code> fetches source but does not transform or evaluate it.</li>
        <li>Declarative prefetch JSON fetches and transforms source but does not evaluate it.</li>
      </ul>

      <Callout title="Use a build when browser compilation is not suitable">
        <p>
          Move to a build for strict CSP, type checking, optimized assets, production chunks, or
          controlled dependency output. There is no universal project-size limit. Measure startup
          work on the target devices and network.
        </p>
      </Callout>

      <h2>Open a runnable example</h2>
      <DemoLinks>
        <DemoLink href="/playground.html">Open Playground</DemoLink>
        <DemoLink href="/examples/acorn.html" secondary>Open JSX Demo</DemoLink>
        <DemoLink href="/examples/tsx.html" secondary>Open TSX Demo</DemoLink>
        <DemoLink href="/examples/prefetch.html" secondary>Open Prefetch Demo</DemoLink>
        <DemoLink href="/benchmarks.html" secondary>Open Benchmarks</DemoLink>
      </DemoLinks>
    </div>
  );
}
