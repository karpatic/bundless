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

const appFile = codeLines([
  "ReactDOM.render(",
  "  <h1>Hello from Bundless.</h1>,",
  "  document.getElementById(\"root\")",
  ");",
]);

const htmlFile = codeLines([
  "<div id=\"root\"></div>",
  "<script src=\"https://unpkg.com/react@17/umd/react.production.min.js\"></script>",
  "<script src=\"https://unpkg.com/react-dom@17/umd/react-dom.production.min.js\"></script>",
  "<script src=\"./App.jsx\" type=\"text/jsx\"></script>",
  "<script src=\"/dist/bundless.acorn.min.js\" type=\"module\"></script>",
]);

export default function GettingStartedPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Start" title="Run the first JSX file">
        Make one HTML file and one JSX file. Serve the folder over HTTP. That is enough to begin.
      </PageHeader>

      <div className="docs-step-list">
        <p><strong>1.</strong> Create <code>App.jsx</code>.</p>
        <p><strong>2.</strong> Add it to a small HTML page.</p>
        <p><strong>3.</strong> Start a file server and open the page.</p>
      </div>

      <h2>1. Write the JSX</h2>
      <p>Save this as <code>App.jsx</code>.</p>
      <CodeBlock code={appFile} />

      <h2>2. Load it from HTML</h2>
      <p>
        This first page uses the browser-ready React scripts, so there is no import map to explain yet.
      </p>
      <CodeBlock code={htmlFile} />

      <h2>3. Serve the folder</h2>
      <CodeBlock code={`npx http-server .`} />
      <p>Open the HTTP address shown by the command. Do not open the page with a <code>file://</code> URL.</p>

      <Callout title="Ready for imports?">
        <p>
          <a href="/docs/guides/modules.html">Open the modules guide.</a>
        </p>
        <p>
          It explains import maps, package names, local files, and window.import(). They are useful,
          but they do not need to be the first thing on the page.
        </p>
      </Callout>

      <DemoLinks>
        <DemoLink href="/examples/acorn.html">Open JSX Demo</DemoLink>
        <DemoLink href="/playground.html" secondary>Open Playground</DemoLink>
      </DemoLinks>
      <DemoDisclosure title="Show JSX demo source and output" url="/examples/acorn.html" />
    </div>
  );
}
