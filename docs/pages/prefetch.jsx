import React from "react";
import {
  Callout,
  CodeBlock,
  DemoDisclosure,
  DemoLink,
  DemoLinks,
  PageHeader,
} from "../App.jsx";

const apiPrefetch = `
await window.Bundless.prefetch(["./Dialog.jsx", "./Settings.jsx"]);
`;

const declarativePrefetch = `
<script type="application/json" data-bundless-prefetch>
[
  "./Dialog.jsx",
  "./Settings.jsx"
]
</script>
`;

const laterImport = `
const dialog = await window.import("./Dialog.jsx");
dialog.openDialog();
`;

export default function PrefetchPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Feature" title="Prefetch likely modules">
        Prefetch lets the browser fetch and prepare modules that a user will probably need soon.
      </PageHeader>

      <h2>Normal user behavior</h2>
      <p>
        Prefetch does not run the module. It fetches and prepares the code so a later
        <code>window.import()</code> can reuse the work.
      </p>
      <CodeBlock code={apiPrefetch} />

      <h2>Declare prefetches in HTML</h2>
      <p>
        Add a JSON array in a <code>data-bundless-prefetch</code> script. Bundless reads the block
        on startup. The docs pages use this same feature for their shared JSX and next likely page.
      </p>
      <CodeBlock code={declarativePrefetch} />

      <h2>Import later</h2>
      <p>
        When the user action happens, load the module with <code>window.import()</code>. If the
        prefetch finished, Bundless can reuse the prepared code. If it failed, the import retries.
      </p>
      <CodeBlock code={laterImport} />

      <Callout title="Use it for likely next steps">
        <p>
          Good targets include dialog modules, settings panels, route modules, or the next docs page.
          Avoid prefetching large code that most users will never open.
        </p>
      </Callout>

      <DemoLinks>
        <DemoLink href="/examples/prefetch.html">Open Prefetch Demo</DemoLink>
      </DemoLinks>
      <DemoDisclosure title="Prefetch Source + Output" url="/examples/prefetch.html" />
    </div>
  );
}
