import React from "react";
import {
  Callout,
  CardGrid,
  CodeBlock,
  codeLines,
  DemoLink,
  DemoLinks,
  LinkCard,
  PageHeader,
  RuntimeTable,
} from "../App.jsx";

const acquireRuntime = codeLines([
  "npm init -y",
  "npm install --save-exact bundlessdev@1.0.12",
  "mkdir -p vendor",
  "cp node_modules/bundlessdev/dist/bundless.acorn.min.js vendor/bundless.acorn.min.js",
]);

const firstPage = codeLines([
  "<!doctype html>",
  '<meta charset="utf-8">',
  "<title>Bundless example</title>",
  '<script type="importmap">',
  "{",
  '  "imports": {',
  '    "react": "https://esm.sh/react@17.0.2/es2022/react.mjs",',
  '    "react-dom": "https://esm.sh/react-dom@17.0.2/es2022/react-dom.mjs"',
  "  }",
  "}",
  "</script>",
  '<div id="react-root"></div>',
  '<script src="./App.jsx" type="text/jsx"></script>',
  '<script src="./vendor/bundless.acorn.min.js" type="module"></script>',
]);

export default function UsagePage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Usage" title="Run source now. Add a build later.">
        Bundless runs JSX or TSX from a static server, follows local imports, and leaves application files unbundled.
      </PageHeader>

      <h2>Start in a fresh folder</h2>
      <p>Acquire a pinned runtime and copy it into a deployable, application-owned path.</p>
      <CodeBlock code={acquireRuntime} />
      <p>Create <code>App.jsx</code>, then save this as <code>index.html</code>:</p>
      <CodeBlock code={firstPage} />
      <CodeBlock code={`npx http-server . -c-1`} />
      <p>
        Relative <code>./</code> URLs keep this page working on a domain root and on subdirectory
        hosts. The runtime scans <code>script[type="text/jsx"]</code> and
        <code>script[type="text/babel"]</code>; package imports need an import map.
      </p>
      <DemoLinks>
        <DemoLink href="/docs/getting-started.html">Copy the complete three-file starter</DemoLink>
        <DemoLink href="/playground.html" secondary>Try it live</DemoLink>
      </DemoLinks>

      <h2>Choose the next task</h2>
      <CardGrid>
        <LinkCard href="/docs/getting-started.html" title="Build the starter">
          Run <code>App.jsx → Header.jsx → Button.jsx</code> from a fresh folder.
        </LinkCard>
        <LinkCard href="/docs/guides/modules.html" title="Load modules">
          Use import maps, local imports, and <code>window.import()</code>.
        </LinkCard>
        <LinkCard href="/docs/guides/typescript.html" title="Use TypeScript or TSX">
          Select Sucrase and keep type checking as a separate step.
        </LinkCard>
        <LinkCard href="/docs/features/prefetch.html" title="Prefetch modules">
          Fetch likely source before a later import.
        </LinkCard>
        <LinkCard href="/docs/troubleshooting.html" title="Fix a problem">
          Check HTTP, script types, imports, CSP, and CORS.
        </LinkCard>
        <LinkCard href="/migration.html" title="Add Webpack">
          Install application dependencies and move compilation into a build.
        </LinkCard>
      </CardGrid>

      <h2>Choose a runtime</h2>
      <RuntimeTable />

      <h2>Where this approach fits</h2>
      <p>
        Bundless works on shared hosting, GitHub Pages, simple PHP sites, sandboxes, and
        education accounts that can serve static files. It lets a small multi-file React app start
        without local build configuration.
      </p>
      <p>
        Preact mode can reduce the framework payload, but its rewrite is intentionally limited and
        is not a complete React compatibility layer. Start with React when React behavior matters;
        use the documented Preact path only after checking the application’s APIs.
      </p>

      <h2>Understand the browser work</h2>
      <ul>
        <li>Bare package imports remain native browser imports and use the page import map.</li>
        <li>Local static imports for supported source extensions use the Bundless module loader.</li>
        <li><code>window.import()</code> fetches, transforms, evaluates, and caches a module namespace.</li>
        <li><code>window.Bundless.prefetch()</code> fetches source but does not transform or evaluate it.</li>
        <li>Declarative prefetch JSON fetches and transforms source but does not evaluate it.</li>
      </ul>

      <Callout title="Use a build when browser compilation is not suitable">
        <p>
          Move to a build for strict CSP, required type checks, optimized assets, production
          chunks, or controlled dependency output. There is no universal project-size limit;
          measure startup on the target devices and network.
        </p>
      </Callout>

      <p className="docs-footer-note">
        Prefer plain text? <a href="/DOCS.md">Read the Markdown documentation fallback.</a>
      </p>
    </div>
  );
}
