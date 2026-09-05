import React from "react";
import {
  Callout,
  CodeBlock,
  codeLines,
  DemoLink,
  DemoLinks,
  PageHeader,
} from "../App.jsx";

const setupCommands = codeLines([
  "mkdir bundless-starter && cd bundless-starter",
  "npm init -y",
  "npm install --save-exact bundlessdev@1.0.12",
  "mkdir -p vendor components",
  "cp node_modules/bundlessdev/dist/bundless.acorn.min.js vendor/bundless.acorn.min.js",
]);

const appFile = codeLines([
  'import React from "react";',
  'import ReactDOM from "react-dom";',
  'import Header from "./components/Header.jsx";',
  "",
  "function App() {",
  "  return (",
  "    <main>",
  "      <Header />",
  "      <p>Edit any component, save, and reload.</p>",
  "    </main>",
  "  );",
  "}",
  "",
  'ReactDOM.render(<App />, document.getElementById("react-root"));',
]);

const headerFile = codeLines([
  'import React from "react";',
  'import Button from "./Button.jsx";',
  "",
  "export default function Header() {",
  "  return (",
  "    <header>",
  "      <h1>Hello from three files.</h1>",
  "      <Button>It works</Button>",
  "    </header>",
  "  );",
  "}",
]);

const buttonFile = codeLines([
  'import React from "react";',
  "",
  "export default function Button({ children }) {",
  '  return <button type="button">{children}</button>;',
  "}",
]);

const htmlFile = codeLines([
  "<!doctype html>",
  '<html lang="en">',
  "<head>",
  '  <meta charset="utf-8">',
  '  <meta name="viewport" content="width=device-width, initial-scale=1">',
  "  <title>Bundless starter</title>",
  '  <script type="importmap">',
  "    {",
  '      "imports": {',
  '        "react": "https://esm.sh/react@17.0.2/es2022/react.mjs",',
  '        "react-dom": "https://esm.sh/react-dom@17.0.2/es2022/react-dom.mjs"',
  "      }",
  "    }",
  "  </script>",
  "</head>",
  "<body>",
  '  <div id="react-root"></div>',
  '  <script src="./App.jsx" type="text/jsx"></script>',
  '  <script src="./vendor/bundless.acorn.min.js" type="module"></script>',
  "</body>",
  "</html>",
]);

const cdnRuntime = codeLines([
  "<script",
  '  src="https://unpkg.com/bundlessdev@1.0.12/dist/bundless.acorn.min.js"',
  '  type="module"',
  "></script>",
]);

const react18Map = codeLines([
  '<script type="importmap">',
  "{",
  '  "imports": {',
  '    "react": "https://esm.sh/react@18.3.1/es2022/react.mjs",',
  '    "react-dom/client": "https://esm.sh/react-dom@18.3.1/es2022/client.mjs?external=react"',
  "  }",
  "}",
  "</script>",
]);

const react18Entry = codeLines([
  'import React from "react";',
  'import { createRoot } from "react-dom/client";',
  'import Header from "./components/Header.jsx";',
  "",
  'createRoot(document.getElementById("react-root")).render(<Header />);',
]);

export default function GettingStartedPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Start" title="Run a multi-file React app">
        Start in an empty folder, acquire the browser runtime, and serve three editable JSX files.
      </PageHeader>

      <div className="docs-step-list">
        <p><strong>1.</strong>{" "}Install and copy the version-pinned runtime.</p>
        <p><strong>2.</strong>{" "}Create <code>App.jsx → Header.jsx → Button.jsx</code>.</p>
        <p><strong>3.</strong>{" "}Add the HTML entry and start a static server.</p>
      </div>

      <h2>1. Create a fresh folder and acquire the runtime</h2>
      <CodeBlock code={setupCommands} />
      <p>
        The copy belongs to this application, so deployment does not depend on a Bundless source
        checkout or a public CDN. Commit <code>vendor/bundless.acorn.min.js</code> with the site.
      </p>

      <h2>2. Create the application files</h2>
      <h3><code>App.jsx</code></h3>
      <CodeBlock code={appFile} />
      <h3><code>components/Header.jsx</code></h3>
      <CodeBlock code={headerFile} />
      <h3><code>components/Button.jsx</code></h3>
      <CodeBlock code={buttonFile} />

      <h2>3. Create <code>index.html</code></h2>
      <CodeBlock code={htmlFile} />
      <p>
        Every application URL is relative: <code>./App.jsx</code>, <code>./components/…</code>, and
        <code>./vendor/…</code>. The same folder therefore works at a domain root or below a path
        such as <code>https://example.com/demos/bundless/</code>.
      </p>

      <h2>4. Serve the folder</h2>
      <CodeBlock code={`npx http-server . -c-1`} />
      <p>Open the HTTP address shown by the command. Do not open the page with a <code>file://</code> URL.</p>

      <h2>Use the CDN instead of copying a runtime</h2>
      <p>Replace the final runtime tag with this version-pinned URL when a CDN dependency is acceptable.</p>
      <CodeBlock code={cdnRuntime} />

      <h2>Why the smallest starter uses React 17</h2>
      <p>
        This path uses the established <code>ReactDOM.render</code> API and matching pinned React 17
        modules so the first page stays compatible with the project’s existing browser examples.
        Bundless itself does not require React 17.
      </p>
      <p>For the modern React root API, replace the import map and the startup lines with these:</p>
      <CodeBlock code={react18Map} />
      <CodeBlock code={react18Entry} />
      <p><a href="/examples/react18.html">Open the verified React 18 <code>createRoot</code> example.</a></p>

      <Callout title="Ready for a real edit loop?">
        <p>
          The{" "}<a href="/playground.html">playground</a> runs the same three-file import chain and
          reports compile or runtime failures beside the preview.
        </p>
      </Callout>

      <DemoLinks>
        <DemoLink href="/playground.html">Try the multi-file playground</DemoLink>
        <DemoLink href="https://github.com/karpatic/bundless/tree/main/starter" secondary>Browse the starter files</DemoLink>
      </DemoLinks>
    </div>
  );
}
