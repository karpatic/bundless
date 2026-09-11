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
        are byte-identical and minified, and omit inline runtime source maps and their transfer
        and runtime cost. Dev maps describe the final transformed source.
      </p>
      <p>
        Babel and Sucrase have one browser build each. The Babel build requests a source map from
        Babel Standalone and appends it inline. The Sucrase build generates and appends its source
        map inline. These compiler maps are not composed through subsequent loader rewrites.
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
          The local default Acorn runtime is about 35.1 kB with Brotli; Sucrase is about 56.4 kB
          (decimal kB = 1,000 bytes). These are runtime downloads only when the server serves
          Brotli with{' '}<code>Content-Encoding: br</code>. React and application code are additional;
          the Babel wrapper also excludes its external Babel Standalone compiler.
        </p>
        <p>
          The footprint refactor is unreleased; the package version remains{' '}<code>1.0.12</code>.
          Pinned npm/CDN examples do not promise the local changes are published. See the{' '}
          <a href="/README.MD#browser-footprint">README
          browser footprint table</a>{' '}in this checkout for all raw/Brotli sizes and full npm package
          scope. Test startup on the target devices and network.
        </p>
      </Callout>

      <h2>What changed inside</h2>
      <p>
        Acorn and Meriyah reuse one AST per compilation for module metadata and JSX edits.
        Ordinary JavaScript source is preserved around the edits instead of regenerating the
        whole program. Their parsers remain bundled, but the separate module lexer and its
        WASM payload are gone. Babel and Sucrase retain their compiler-plus-lexer path.
        React is not bundled in any runtime. All default{' '}<code>.min.js</code>{' '}paths are minified.
      </p>
      <p>
        Source preservation does not downlevel JavaScript for older browsers. The selected
        parser must accept the syntax and the target browser must run it. Meriyah still rejects
        trailing commas in dynamic imports and keeps entity spellings in quoted JSX attributes;
        Acorn decodes those attribute entities. The{' '}
        <a href="/docs/guides/modules.html">snapshot binding, cycle, and import-attribute limits</a>
        {' '}of the custom loader still apply.
      </p>

      <DemoLinks>
        <DemoLink href="/benchmarks.html">Open benchmarks</DemoLink>
        <DemoLink href="/examples/acorn_preact.html" secondary>Open Acorn Preact demo</DemoLink>
      </DemoLinks>
      <DemoDisclosure title="Show Acorn Preact source and output" url="/examples/acorn_preact.html" />
      <DemoDisclosure title="Show Sucrase Preact source and output" url="/examples/sucrase_preact.html" />
    </div>
  );
}
