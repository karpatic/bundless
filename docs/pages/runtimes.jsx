import React from "react";
import {
  Callout,
  CodeBlock,
  DemoDisclosure,
  DemoLink,
  DemoLinks,
  PageHeader,
  RuntimeTable,
} from "../App.jsx";

const preactSnippet = `
<script src="./App.jsx" type="text/jsx"></script>
<script src="/dist/bundless.acorn.min.js" type="module" to="preact"></script>
`;

export default function RuntimesPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Reference" title="Choose a runtime">
        Bundless ships a few browser runtimes. Pick the smallest runtime that understands the code
        you want to write.
      </PageHeader>

      <RuntimeTable />

      <h2>Source-map behavior</h2>
      <p>
        Acorn and Meriyah <code>.dev.js</code> variants include runtime inline source maps for
        debugging. Their default, minified, and explicit <code>.prod.js</code> variants omit runtime
        inline source maps to avoid production size and runtime overhead.
      </p>
      <p>
        Babel and Sucrase have separate behavior. Babel uses Babel standalone source-map behavior.
        Sucrase uses Sucrase inline source-map behavior.
      </p>

      <h2>Preact target</h2>
      <p>
        Add <code>to="preact"</code> to Acorn, Meriyah, or Sucrase when React-style code should be
        transformed toward Preact.
      </p>
      <CodeBlock code={preactSnippet} />

      <Callout title="Measure on your page">
        <p>
          The benchmark page runs small Hello World examples in this browser. It is useful for a
          quick comparison, but your real app and network matter more.
        </p>
      </Callout>

      <DemoLinks>
        <DemoLink href="/benchmarks.html">Open Benchmarks</DemoLink>
        <DemoLink href="/examples/acorn_preact.html" secondary>Open Acorn Preact Demo</DemoLink>
      </DemoLinks>
      <DemoDisclosure title="Acorn to Preact Source + Output" url="/examples/acorn_preact.html" />
      <DemoDisclosure title="Sucrase to Preact Source + Output" url="/examples/sucrase_preact.html" />
    </div>
  );
}
