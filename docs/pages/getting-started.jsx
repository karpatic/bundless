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

const completePage = codeLines([
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
  "<script src=\"./App.jsx\" type=\"text/jsx\"></script>",
  "<script src=\"/dist/bundless.acorn.min.js\" type=\"module\"></script>",
]);

const appFile = codeLines([
  "import React from \"react\";",
  "import ReactDOM from \"react-dom\";",
  "",
  "ReactDOM.render(",
  "  <h1>Hello from Bundless.</h1>,",
  "  document.getElementById(\"react-root\")",
  ");",
]);

const inlineScript = codeLines([
  "<script type=\"text/jsx\">",
  "  import React from \"react\";",
  "  import ReactDOM from \"react-dom\";",
  "",
  "  ReactDOM.render(",
  "    <h1>Hello from Bundless.</h1>,",
  "    document.getElementById(\"react-root\")",
  "  );",
  "</script>",
]);

export default function GettingStartedPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Start" title="Run an external JSX file">
        Create one HTML file and one JSX file. Then serve the directory over HTTP.
      </PageHeader>

      <h2>1. Create the HTML file</h2>
      <p>
        Save this code as <code>index.html</code>. The import map defines the package names that
        <code>App.jsx</code> imports.
      </p>
      <CodeBlock code={completePage} />

      <h2>2. Create the application file</h2>
      <p>Save this code as <code>App.jsx</code> in the same directory.</p>
      <CodeBlock code={appFile} />

      <h2>3. Serve the directory</h2>
      <CodeBlock code={`npx http-server .`} />
      <p>
        Open the HTTP address from the command output. Do not use a <code>file://</code> URL.
      </p>

      <h2>Keep a small example inline</h2>
      <p>
        For a small demo, replace the external application tag with this inline script. Keep the
        import map and runtime tag in the page.
      </p>
      <CodeBlock code={inlineScript} />

      <Callout title="Use only supported source-script types">
        <p>
          Bundless scans <code>text/jsx</code> and <code>text/babel</code>. For a TSX file, use
          <code>type="text/jsx"</code> and select the Sucrase runtime. Do not use
          <code>type="text/tsx"</code>.
        </p>
      </Callout>

      <DemoLinks>
        <DemoLink href="/examples/acorn.html">Open JSX Demo</DemoLink>
        <DemoLink href="/examples/tsx.html" secondary>Open TSX Demo</DemoLink>
      </DemoLinks>
      <DemoDisclosure title="Show JSX demo source and output" url="/examples/acorn.html" />
    </div>
  );
}
