import React from "react";
import {
  Callout,
  CodeBlock,
  DemoLink,
  DemoLinks,
  PageHeader,
} from "../App.jsx";

const serverCommand = `
npx http-server .
`;

const tsxTags = `
<script src="./App.tsx" type="text/jsx"></script>
<script src="/dist/bundless.sucrase.min.js" type="module"></script>
`;

export default function TroubleshootingPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Reference" title="Fix a Bundless page">
        Start with the browser console. Then use the symptom that matches the failure.
      </PageHeader>

      <h2>The page does not run</h2>
      <ol>
        <li>Serve the project over HTTP. Do not open it with a <code>file://</code> URL.</li>
        <li>Put the import map before application modules run.</li>
        <li>Load the Bundless runtime as <code>type="module"</code>.</li>
        <li>Check failed requests and JavaScript errors in browser developer tools.</li>
      </ol>
      <CodeBlock code={serverCommand} />

      <h2>The console says “No JSX scripts found”</h2>
      <p>
        Bundless scans only <code>script[type="text/jsx"]</code> and
        <code>script[type="text/babel"]</code>. Use one of these exact types for inline and external
        source. Do not use <code>text/tsx</code>.
      </p>
      <CodeBlock code={tsxTags} />

      <h2>TypeScript or TSX has a syntax error</h2>
      <p>
        Use <code>bundless.sucrase.min.js</code>. Acorn and Meriyah parse JSX, not TypeScript. Babel
        has Babel Standalone syntax support, but Sucrase is the Bundless TypeScript and TSX choice.
        Sucrase removes types; it does not type-check them.
      </p>

      <h2>A package import cannot resolve</h2>
      <p>
        Put each bare package name in the page import map. A bare import such as
        <code>react</code> remains a native browser import. Use a relative or absolute URL for local
        source, such as <code>./App.jsx</code> or <code>/app/App.jsx</code>.
      </p>

      <h2>A local module does not load</h2>
      <ul>
        <li>Confirm that the URL returns source and not an HTML error page.</li>
        <li>Use a supported extension: <code>.mjs</code>, <code>.js</code>, <code>.jsx</code>, <code>.ts</code>, or <code>.tsx</code>.</li>
        <li>Make named imports match named exports. Bundless reports a missing named export as a syntax error.</li>
        <li>Retry after a temporary failure. Failed <code>window.import()</code> calls are removed from the cache.</li>
      </ul>

      <h2>A cross-origin source request fails</h2>
      <p>
        Bundless uses <code>fetch()</code> to read source. The source server must send CORS headers
        that permit the page origin. A script tag that can load a resource does not prove that
        JavaScript can read the same resource with <code>fetch()</code>.
      </p>

      <h2>Content Security Policy blocks the page</h2>
      <p>
        Bundless creates an inline module script and evaluates transformed application modules from
        <code>blob:</code> URLs. The policy must permit the runtime, generated inline script, module
        dependencies, and <code>blob:</code> modules. A strict nonce-only or hash-only policy can be
        incompatible because Bundless creates code in the browser. Use a build if you cannot permit
        this behavior.
      </p>

      <h2>Prefetch does not run the module</h2>
      <p>
        This is correct. <code>window.Bundless.prefetch()</code> only fetches source. Declarative
        prefetch JSON fetches and transforms source. Neither form evaluates a module. Use
        <code>window.import()</code> when the application must run it.
      </p>

      <h2>Preact mode differs from React</h2>
      <p>
        The <code>to="preact"</code> mode rewrites a limited set of React calls. It is not a complete
        compatibility layer. Check portals, context providers, refs, fragments, hooks, and form
        events. Use a direct Preact setup when the application depends on behavior that this rewrite
        does not cover.
      </p>

      <h2>Source maps or startup are too large</h2>
      <p>
        For Acorn or Meriyah, use <code>.min.js</code> or <code>.prod.js</code> to omit inline runtime
        source maps. Use <code>.dev.js</code> only when you need those maps. Babel and Sucrase keep
        their own inline source-map behavior. If parser download or browser transformation is too
        costly, move compilation to a build.
      </p>

      <Callout title="Check production limits before release">
        <p>
          Test CSP, CORS, browser support, startup work, cache headers, and pinned CDN versions.
          Bundless is useful for small browser-compiled pages. It does not replace a controlled
          production asset pipeline.
        </p>
      </Callout>

      <DemoLinks>
        <DemoLink href="/playground.html">Open playground</DemoLink>
        <DemoLink href="/migration.html" secondary>Move to Webpack</DemoLink>
      </DemoLinks>
    </div>
  );
}
