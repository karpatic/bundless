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

const tsxTags = `
<div id="react-root"></div>
<script src="./App.tsx" type="text/jsx"></script>
<script src="/dist/bundless.sucrase.min.js" type="module"></script>
`;

const tsxCode = codeLines([
  "import React from \"react\";",
  "import ReactDOM from \"react-dom\";",
  "",
  "type GreetingProps = {",
  "  name: string;",
  "};",
  "",
  "function Greeting({ name }: GreetingProps) {",
  "  return <h1>Hello, {name}.</h1>;",
  "}",
  "",
  "ReactDOM.render(",
  "  <Greeting name=\"Bundless\" />,",
  "  document.getElementById(\"react-root\")",
  ");",
]);

export default function TypeScriptPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Guide" title="Run TypeScript and TSX with Sucrase">
        Select the Sucrase runtime when application source contains TypeScript syntax.
      </PageHeader>

      <h2>1. Select Sucrase</h2>
      <p>
        Keep the source-script type as <code>text/jsx</code>. Bundless does not scan
        <code>text/tsx</code>. The Sucrase runtime reads <code>.ts</code> and <code>.tsx</code> files.
      </p>
      <CodeBlock code={tsxTags} />

      <h2>2. Write the TSX file</h2>
      <p>Save this code as <code>App.tsx</code>. Keep the React import map in the HTML page.</p>
      <CodeBlock code={tsxCode} />

      <Callout title="Sucrase does not type-check">
        <p>
          Sucrase removes TypeScript syntax and transforms JSX in the browser. Use a separate type
          checker if you need type errors before the page runs. Types do not exist at runtime.
        </p>
      </Callout>

      <h2>Move type checks into a build when needed</h2>
      <p>
        Add a build when you need required type checks, production chunks, strict CSP, or controlled
        dependency output. Keep the application source and configure a Webpack TypeScript or JSX
        loader separately from the Bundless loader.
      </p>
      <DemoLinks>
        <DemoLink href="/examples/tsx.html">Open TSX demo</DemoLink>
        <DemoLink href="/migration.html" secondary>Move to Webpack</DemoLink>
      </DemoLinks>
      <DemoDisclosure title="Show TSX demo source and output" url="/examples/tsx.html" />
    </div>
  );
}
