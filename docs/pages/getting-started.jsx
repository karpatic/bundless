import React from "react";
import {
  Callout,
  CodeBlock,
  DemoDisclosure,
  DemoLink,
  DemoLinks,
  PageHeader,
} from "../App.jsx";

const externalTags = `
<div id="react-root"></div>
<script src="./App.jsx" type="text/jsx"></script>
<script src="/dist/bundless.acorn.min.js" type="module"></script>
`;

const inlineTags = `
<div id="react-root"></div>
<script type="text/jsx">
  import React from "react";
  import ReactDOM from "react-dom";

  ReactDOM.render(
    <h1>Hello from Bundless.</h1>,
    document.getElementById("react-root")
  );
</script>
<script src="/dist/bundless.acorn.min.js" type="module"></script>
`;

const fileServer = `
npx http-server .
`;

export default function GettingStartedPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Start" title="Run JSX from a plain HTML page">
        You only need an HTML file, a JSX file, a file server, and one Bundless runtime.
      </PageHeader>

      <h2>Serve the files</h2>
      <p>
        Open the page through HTTP, not by double-clicking the file. Browsers block some module
        and fetch behavior on <code>file://</code> pages.
      </p>
      <CodeBlock code={fileServer} />

      <h2>External JSX</h2>
      <p>
        Put app code in <code>App.jsx</code>. Then add these tags to the page.
      </p>
      <CodeBlock code={externalTags} />

      <h2>Inline JSX</h2>
      <p>
        Inline code works too. It is useful for small demos and docs examples.
      </p>
      <CodeBlock code={inlineTags} />

      <Callout title="Package imports need an import map">
        <p>
          If the JSX imports packages by names like <code>react</code>, add an import map. The next
          guide shows the small import map pattern and how local modules load.
        </p>
      </Callout>

      <h2>TSX note</h2>
      <p>
        Use Sucrase for TypeScript or TSX. Keep the app script as <code>type="text/jsx"</code>,
        and swap the runtime to <code>/dist/bundless.sucrase.min.js</code>.
      </p>
      <DemoLinks>
        <DemoLink href="/examples/acorn.html">Open Basic JSX Demo</DemoLink>
        <DemoLink href="/examples/tsx.html" secondary>Open TSX Demo</DemoLink>
      </DemoLinks>

      <DemoDisclosure title="Basic Acorn React Source + Output" url="/examples/acorn.html" />
    </div>
  );
}
