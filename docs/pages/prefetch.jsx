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
      <PageHeader kicker="Feature" title="Prefetch a likely module">
        Fetch source before the user requests it. Prefetch never evaluates the module.
      </PageHeader>

      <h2>Fetch source from application code</h2>
      <CodeBlock code={apiPrefetch} />
      <p>
        <code>window.Bundless.prefetch()</code> accepts one URL or an iterable of URLs. It fills the
        source-fetch cache. It does not transform or evaluate the source.
      </p>

      <h2>Fetch and transform from HTML</h2>
      <CodeBlock code={declarativePrefetch} />
      <p>
        On startup, Bundless reads <code>application/json</code> scripts that have
        <code>data-bundless-prefetch</code>. The JSON value must be an array of URL strings. This
        form fetches and transforms each module. It does not evaluate a module.
      </p>

      <h2>Evaluate the module later</h2>
      <CodeBlock code={laterImport} />
      <p>
        <code>window.import()</code> reuses cached source or prepared code. It then evaluates the
        module and returns its namespace. If prefetch failed, the later import tries again.
      </p>

      <Callout title="Prefetch only a likely next action">
        <p>
          Use prefetch for a dialog, route, or panel that the user is likely to open. Do not fetch
          large source that most users do not need.
        </p>
      </Callout>

      <h2>Know the Webpack behavior</h2>
      <p>
        During migration, literal source calls can become Webpack prefetch hints. Declarative JSON
        blocks are removed from generated HTML when runtime stripping is active; they do not become
        Webpack hints.
      </p>

      <DemoLinks>
        <DemoLink href="/examples/prefetch.html">Open prefetch demo</DemoLink>
      </DemoLinks>
      <DemoDisclosure title="Show prefetch demo source and output" url="/examples/prefetch.html" />
    </div>
  );
}
