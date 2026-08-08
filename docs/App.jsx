import React from "react";
import { docsSections, findNextPage, topNavItems } from "./content.js";

function isCurrentHref(href, page) {
  if (!page) {
    return false;
  }
  return href === page.href || href === page.canonicalHref;
}

function TopNav({ page }) {
  return (
    <header className="docs-topbar">
      <a className="docs-brand" href="/" aria-label="Bundless home">
        <span className="docs-brand-mark">B</span>
        <span>Bundless</span>
      </a>
      <nav className="docs-toplinks" aria-label="Main navigation">
        {topNavItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={isCurrentHref(item.href, page) ? "page" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <details className="docs-mobile-menu">
        <summary>Menu</summary>
        <nav className="docs-mobile-panel" aria-label="Mobile navigation">
          {topNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={isCurrentHref(item.href, page) ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </details>
    </header>
  );
}

function Sidebar({ page }) {
  return (
    <aside className="docs-sidebar" aria-label="Documentation navigation">
      <div className="docs-sidebar-inner">
        {docsSections.map((section) => (
          <section className="docs-sidebar-section" key={section.title}>
            <h2 className="docs-sidebar-heading">{section.title}</h2>
            <nav>
              {section.items.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  aria-current={page && page.id === item.id ? "page" : undefined}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </section>
        ))}
      </div>
    </aside>
  );
}

export function DocsShell({ page, children }) {
  const nextPage = page ? findNextPage(page.id) : null;

  return (
    <div className="docs-flow">
      <TopNav page={page} />
      <div className="docs-shell">
        <Sidebar page={page} />
        <main className="docs-main" id="main-content">
          <article className="docs-page">
            {children}
            {nextPage ? (
              <nav className="docs-next" aria-label="Next page">
                <a href={nextPage.href}>
                  <span>Next</span>
                  <strong>{nextPage.label}</strong>
                </a>
              </nav>
            ) : null}
            <p className="docs-footer-note">
              Bundless renders these docs from shared JSX modules in the browser.
            </p>
          </article>
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ kicker, title, children }) {
  return (
    <header className="docs-page-header">
      {kicker ? <p className="docs-kicker">{kicker}</p> : null}
      <h1>{title}</h1>
      {children ? <p className="docs-lead">{children}</p> : null}
    </header>
  );
}

export function CodeBlock({ code }) {
  return (
    <pre>
      <code>{code.trim()}</code>
    </pre>
  );
}

export function codeLines(lines) {
  return lines.join("\n");
}

export function Callout({ title, children }) {
  return (
    <div className="docs-callout">
      {title ? <strong>{title}</strong> : null}
      <div>{children}</div>
    </div>
  );
}

export function CardGrid({ children }) {
  return <div className="docs-card-grid">{children}</div>;
}

export function LinkCard({ href, title, children }) {
  return (
    <a className="docs-card" href={href}>
      <span className="docs-card-title">{title}</span>
      <span className="docs-card-desc">{children}</span>
    </a>
  );
}

export function DemoLinks({ children }) {
  return <div className="docs-demo-links">{children}</div>;
}

export function DemoLink({ href, children, secondary }) {
  const className = secondary ? "docs-button-link secondary" : "docs-button-link";
  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}

const sourceCache = new Map();

function fetchSource(url) {
  if (sourceCache.has(url)) {
    return sourceCache.get(url);
  }

  const sourcePromise = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText || "error"}`);
      }
      return response.text();
    })
    .catch((error) => {
      sourceCache.delete(url);
      throw error;
    });

  sourceCache.set(url, sourcePromise);
  return sourcePromise;
}

export function DemoDisclosure({ title, url }) {
  const [source, setSource] = React.useState("Loading source...");
  const [loaded, setLoaded] = React.useState(false);

  function handleToggle(event) {
    if (!event.currentTarget.open || loaded) {
      return;
    }

    setLoaded(true);
    fetchSource(url)
      .then((text) => {
        setSource(text);
      })
      .catch((error) => {
        setSource(`Could not load ${url}: ${error.message}. Serve the docs over HTTP so fetch() can read the example file.`);
      });
  }

  return (
    <details className="docs-example" onToggle={handleToggle}>
      <summary>{title}</summary>
      <div className="docs-example-view">
        <section>
          <h3>Source</h3>
          <pre>
            <code>{source}</code>
          </pre>
        </section>
        <section>
          <h3>Output</h3>
          <iframe title={`${title} output`} src={url}></iframe>
        </section>
      </div>
    </details>
  );
}

export function RuntimeTable() {
  return (
    <div className="docs-table-scroll">
      <table>
        <thead>
          <tr>
            <th>Runtime</th>
            <th>Pick it when</th>
            <th>Builds</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>Acorn</code></td>
            <td>You need the recommended JSX default.</td>
            <td><code>bundless.acorn.min.js</code>, <code>.prod.js</code>, and <code>.dev.js</code>.</td>
          </tr>
          <tr>
            <td><code>Meriyah</code></td>
            <td>You need the alternate JSX parser.</td>
            <td><code>bundless.meriyah.min.js</code>, <code>.prod.js</code>, and <code>.dev.js</code>.</td>
          </tr>
          <tr>
            <td><code>Babel</code></td>
            <td>You need Babel Standalone syntax support.</td>
            <td><code>bundless.babel.min.js</code>. It loads Babel Standalone if necessary.</td>
          </tr>
          <tr>
            <td><code>Sucrase</code></td>
            <td>You need JSX, TypeScript, or TSX.</td>
            <td><code>bundless.sucrase.min.js</code>.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Loading" title="Loading the page">
        Bundless is loading the shared documentation and page modules.
      </PageHeader>
    </div>
  );
}

export function ErrorPage({ message }) {
  return (
    <div className="docs-flow">
      <PageHeader kicker="Error" title="The page did not load">
        {message}
      </PageHeader>
      <p>Check that the file server runs from the project root. Then reload the page.</p>
    </div>
  );
}
