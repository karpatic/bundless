import React from "react";
import {
  CodeBlock,
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

const tsxCode = `
type GreetingProps = {
  name: string;
};

function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}.</h1>;
}
`;

export default function TypeScriptPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Guide" title="TypeScript and TSX">
        Use Sucrase when you want JSX plus TypeScript syntax in the browser.
      </PageHeader>

      <h2>Swap the runtime</h2>
      <p>
        Keep the app script as <code>type="text/jsx"</code>. The Sucrase runtime understands
        <code>.ts</code> and <code>.tsx</code> files.
      </p>
      <CodeBlock code={tsxTags} />

      <h2>Write normal TSX</h2>
      <p>
        Types are removed in the browser. They are useful for editing and checking, but they do not
        exist at runtime.
      </p>
      <CodeBlock code={tsxCode} />

      <h2>When to move to a build</h2>
      <p>
        Bundless can run TSX for demos, docs, and small apps. Move to Webpack when you need a full
        type-checking step, production chunks, stricter CSP rules, or more control over dependencies.
      </p>
      <DemoLinks>
        <DemoLink href="/examples/tsx.html">Open TSX Demo</DemoLink>
        <DemoLink href="/migration.html" secondary>Read Migration Guide</DemoLink>
      </DemoLinks>
      <DemoDisclosure title="TSX Source + Output" url="/examples/tsx.html" />
    </div>
  );
}
