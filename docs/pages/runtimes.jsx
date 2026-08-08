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
      <PageHeader kicker="Reference" title="Choose the runtime for the source syntax">
        Use Acorn for normal JSX. Use Sucrase when the source contains TypeScript or TSX.
      </PageHeader>

      <RuntimeTable />

      <h2>Choose a source-map build</h2>
      <p>
        Acorn and Meriyah <code>.dev.js</code> builds include inline runtime source maps. Use these
        builds to debug transformed JSX. Their <code>.min.js</code> and <code>.prod.js</code> builds
        omit inline runtime source maps and their transfer and runtime cost.
      </p>
      <p>
        Babel and Sucrase have one browser build each. Babel uses Babel Standalone source-map
        behavior. Sucrase includes its own inline source maps.
      </p>

      <h2>Target Preact only for compatible code</h2>
      <p>
        Add <code>to="preact"</code> to an Acorn, Meriyah, or Sucrase runtime tag. Bundless rewrites a
        limited set of React and ReactDOM calls and loads pinned Preact modules. This mode is not a
        complete React compatibility layer.
      </p>
      <CodeBlock code={preactSnippet} />

      <Callout title="Measure the selected runtime">
        <p>
          The checked-in Brotli files are approximately 37 KiB for Acorn and 53 KiB for Sucrase.
          Parser download and browser transformation affect startup. Test the target page on the
          target devices and network.
        </p>
      </Callout>

      <DemoLinks>
        <DemoLink href="/benchmarks.html">Open benchmarks</DemoLink>
        <DemoLink href="/examples/acorn_preact.html" secondary>Open Acorn Preact demo</DemoLink>
      </DemoLinks>
      <DemoDisclosure title="Show Acorn Preact source and output" url="/examples/acorn_preact.html" />
      <DemoDisclosure title="Show Sucrase Preact source and output" url="/examples/sucrase_preact.html" />
    </div>
  );
}
