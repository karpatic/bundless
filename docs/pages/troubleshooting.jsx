import React from "react";
import {
  Callout,
  DemoLink,
  DemoLinks,
  PageHeader,
} from "../App.jsx";

export default function TroubleshootingPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Reference" title="Troubleshooting">
        Most Bundless issues come from browser loading rules, import maps, CSP, or picking a runtime
        that does not match the file syntax.
      </PageHeader>

      <h2>Use a modern browser</h2>
      <p>
        Bundless depends on ES modules, dynamic <code>import()</code>, <code>fetch()</code>, blob
        module URLs, top-level <code>await</code>, and import maps when you use package names.
      </p>

      <h2>Serve over HTTP</h2>
      <p>
        Use a file server from the project root. A <code>file://</code> page can block module and
        fetch behavior that Bundless needs.
      </p>

      <h2>Check import maps</h2>
      <p>
        If a package import fails, make sure the package name appears in the page import map.
        Local files should use a relative or absolute path like <code>./App.jsx</code> or
        <code>/examples/App.jsx</code>.
      </p>

      <h2>Check CSP and CORS</h2>
      <p>
        Bundless inserts module code and evaluates transformed modules through <code>blob:</code>
        URLs. A strict CSP must allow that. Cross-origin source files also need CORS headers that let
        the page read them.
      </p>

      <h2>Pick the matching runtime</h2>
      <p>
        Use Acorn for JSX. Use Sucrase for TypeScript and TSX. Use Babel when you need Babel
        standalone coverage in the browser.
      </p>

      <h2>Preact mode</h2>
      <p>
        Add <code>to="preact"</code> to a supported runtime when React-style code should target
        Preact. Most simple React code works. Be careful with portals, context providers, refs, and
        direct form events because Preact can differ from React in those areas.
      </p>

      <Callout title="Babel standalone">
        <p>
          Babel standalone is useful in the browser, but Babel's own docs recommend a Node-based
          build system for production transpilation. Move to Webpack when production constraints
          show up.
        </p>
      </Callout>

      <DemoLinks>
        <DemoLink href="/playground.html">Open Playground</DemoLink>
        <DemoLink href="/migration.html" secondary>Read Migration Guide</DemoLink>
      </DemoLinks>
    </div>
  );
}
