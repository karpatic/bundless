import React from "react";
import {
  Callout,
  CardGrid,
  DemoLink,
  DemoLinks,
  LinkCard,
  PageHeader,
  RuntimeTable,
} from "../App.jsx";

export default function UsagePage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Usage Docs" title="Write JSX first. Add a build later.">
        Bundless lets an HTML page load React and JSX without setting up a bundler first.
        Start with files on a small web server, then move to Webpack when the project needs a build step.
      </PageHeader>

      <CardGrid>
        <LinkCard href="/docs/getting-started.html" title="Getting Started">
          Add one JSX script and one Bundless runtime script.
        </LinkCard>
        <LinkCard href="/docs/guides/modules.html" title="Modules and Imports">
          Use import maps for packages and local imports for your own files.
        </LinkCard>
        <LinkCard href="/docs/guides/typescript.html" title="TypeScript and TSX">
          Switch to Sucrase when a page needs TypeScript syntax.
        </LinkCard>
        <LinkCard href="/docs/features/prefetch.html" title="Prefetch">
          Warm likely modules before a later <code>window.import()</code>.
        </LinkCard>
        <LinkCard href="/docs/reference/runtimes.html" title="Runtime Choices">
          Compare Acorn, Meriyah, Babel, and Sucrase.
        </LinkCard>
        <LinkCard href="/docs/troubleshooting.html" title="Troubleshooting">
          Fix common browser, CSP, source-map, and Preact issues.
        </LinkCard>
      </CardGrid>

      <Callout title="Small defaults">
        <p>
          Acorn is the small JSX default at 36Kb. Sucrase handles JSX plus TypeScript and TSX at 52Kb.
        </p>
      </Callout>

      <h2>Pick a path</h2>
      <p>
        Use Bundless for prototypes, small internal tools, docs, demos, and static pages where a
        file server is enough. Use Webpack later when you need production chunking, tighter policy
        control, or a normal build pipeline.
      </p>
      <DemoLinks>
        <DemoLink href="/playground.html">Open Playground</DemoLink>
        <DemoLink href="/examples/acorn.html" secondary>Open Acorn Demo</DemoLink>
        <DemoLink href="/migration.html" secondary>Read Migration Guide</DemoLink>
      </DemoLinks>

      <h2>Runtime overview</h2>
      <RuntimeTable />

      <h2>Runnable examples</h2>
      <p>
        The demos stay under <code>/examples/</code> and <code>/benchmarks/</code>. Docs link to
        those same pages instead of keeping duplicate copies.
      </p>
      <DemoLinks>
        <DemoLink href="/examples/prefetch.html">Prefetch Demo</DemoLink>
        <DemoLink href="/examples/tsx.html" secondary>TSX Demo</DemoLink>
        <DemoLink href="/benchmarks.html" secondary>Benchmarks</DemoLink>
      </DemoLinks>
    </div>
  );
}
