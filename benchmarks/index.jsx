import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";

const ROW_TIMEOUT_MS = new URLSearchParams(window.location.search).has("fast-smoke") ? 750 : 7000;

const examples = [
  { name: "HTML Inline", url: "/benchmarks/html.html", size: 1, caption: "", jsx: false, ts: false },
  { name: "Script Inline", url: "/benchmarks/vanilla.html", size: 1, caption: "", jsx: false, ts: false },
  { name: "Script Src", url: "/benchmarks/vanilla_src.html", size: 1, caption: "", jsx: false, ts: false },
  { name: "Module Inline", url: "/benchmarks/module.html", size: 1, caption: "", jsx: false, ts: false },
  { name: "Module Src", url: "/benchmarks/module_src.html", size: 1, caption: "", jsx: false, ts: false },
  { name: "Module Import", url: "/benchmarks/module_import.html", size: 1, caption: "", jsx: false, ts: false },
  { name: "Webpack + React", url: "/benchmarks/react.html", size: 40, caption: "Bundled with Babel.", jsx: true, ts: true, highlight: "muted" },
  { name: "Vite + React", url: "/benchmarks/vite.html", size: 46, caption: "Bundled with ESBuild.", jsx: true, ts: true },
  { name: "CDN + HTMX", url: "/benchmarks/htmx.html", size: 20, caption: "", jsx: false, ts: false },
  { name: "CDN + Preact", url: "/benchmarks/preact.html", size: 6, caption: "", jsx: false, ts: false, highlight: "muted" },
  { name: "CDN + JQuery", url: "/benchmarks/jquery.html", size: 32, caption: "", jsx: false, ts: false },
  { name: "CDN + React", url: "/benchmarks/babel.html", size: 500, caption: "Uses Babel Standalone.", jsx: false, ts: false },
  { name: "B.Acorn + Preact", url: "/examples/acorn_preact.html", size: 40, caption: "Recommended small JSX path.", jsx: true, ts: false, recommended: true, highlight: "recommended" },
  { name: "B.Meriyah + Preact", url: "/examples/meriyah_preact.html", size: 45, caption: "Alternate JSX parser.", jsx: true, ts: false, recommended: true },
  { name: "B.Babel + React", url: "/examples/babel.html", size: 500, caption: "Broad Babel Standalone syntax coverage.", jsx: true, ts: true },
  { name: "B.Meriyah + React", url: "/examples/meriyah.html", size: 80, caption: "Alternate React JSX parser.", jsx: true, ts: false, recommended: true },
  { name: "B.Acorn + React", url: "/examples/acorn.html", size: 75, caption: "Acorn JSX runtime with React.", jsx: true, ts: false },
  { name: "B.Sucrase + React", url: "/examples/sucrase.html", size: 90, caption: "JSX plus TypeScript syntax.", jsx: true, ts: true, recommended: true },
  { name: "B.Sucrase + TSX", url: "/examples/tsx.html", size: 90, caption: "TSX with the Sucrase runtime.", jsx: true, ts: true, recommended: true, highlight: "recommended" },
];

function SortLabel({ field, sortField, sortDirection }) {
  if (sortField !== field) {
    return null;
  }
  return <span className="benchmark-sort">{sortDirection}</span>;
}

function Capability({ value }) {
  return <span className={value ? "benchmark-yes" : "benchmark-no"}>{value ? "Yes" : "No"}</span>;
}

function LoadTimeCell({ item, maxTime }) {
  if (item.status === "pending") {
    return (
      <div className="benchmark-load">
        <span className="benchmark-spinner" aria-hidden="true"></span>
        <span>Running</span>
      </div>
    );
  }

  if (item.status !== "complete") {
    return <span className="benchmark-muted">{item.status === "timeout" ? "Timed out" : "Error"}</span>;
  }

  const width = maxTime > 0 ? `${Math.max(4, (item.loadTime / maxTime) * 100)}%` : "4%";

  return (
    <div className="benchmark-load">
      <span className="benchmark-time">{item.loadTime.toFixed(2)} ms</span>
      <div className="benchmark-meter" aria-hidden="true">
        <span style={{ width }}></span>
      </div>
    </div>
  );
}

function SizeCell({ size, maxSize }) {
  const width = maxSize > 0 ? `${Math.max(4, (size / maxSize) * 100)}%` : "4%";

  return (
    <div className="benchmark-load">
      <span className="benchmark-time">{size}Kb</span>
      <div className="benchmark-meter size" aria-hidden="true">
        <span style={{ width }}></span>
      </div>
    </div>
  );
}

function compareValues(a, b, field) {
  if (a.status === "pending" && field === "loadTime") {
    return 1;
  }
  if (b.status === "pending" && field === "loadTime") {
    return -1;
  }
  if (a[field] === null) {
    return 1;
  }
  if (b[field] === null) {
    return -1;
  }

  if (typeof a[field] === "boolean") {
    return a[field] === b[field] ? 0 : a[field] ? -1 : 1;
  }

  if (typeof a[field] === "number") {
    return a[field] - b[field];
  }

  return String(a[field]).localeCompare(String(b[field]));
}

function BenchmarksPage() {
  const iframeRef = useRef(null);
  const [loadTimes, setLoadTimes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortField, setSortField] = useState("loadTime");
  const [sortDirection, setSortDirection] = useState("asc");
  const [preview, setPreview] = useState({
    open: false,
    name: "",
    url: "",
    source: "",
  });

  useEffect(() => {
    if (currentIndex >= examples.length) {
      if (iframeRef.current) {
        iframeRef.current.removeAttribute("src");
      }
      return undefined;
    }

    const example = examples[currentIndex];
    const iframe = iframeRef.current;
    const startTime = performance.now();
    let finished = false;
    let timeoutId = 0;

    function finish(status) {
      if (finished) {
        return;
      }

      finished = true;
      window.clearTimeout(timeoutId);

      const loadTime = status === "complete" ? Math.max(0, performance.now() - startTime) : null;
      setLoadTimes((previous) => {
        if (previous.some((result) => result.name === example.name)) {
          return previous;
        }
        return previous.concat({
          name: example.name,
          loadTime,
          size: example.size,
          status,
        });
      });
      setCurrentIndex((previous) => previous + 1);
    }

    if (!iframe) {
      finish("error");
      return undefined;
    }

    timeoutId = window.setTimeout(() => finish("timeout"), ROW_TIMEOUT_MS);
    iframe.onload = () => finish("complete");
    iframe.onerror = () => finish("error");
    iframe.src = example.url;

    return () => {
      window.clearTimeout(timeoutId);
      iframe.onload = null;
      iframe.onerror = null;
    };
  }, [currentIndex]);

  const tableData = useMemo(() => {
    const rows = examples.map((example) => {
      const result = loadTimes.find((item) => item.name === example.name);
      return {
        ...example,
        loadTime: result ? result.loadTime : null,
        status: result ? result.status : "pending",
      };
    });

    return rows.sort((a, b) => {
      const comparison = compareValues(a, b, sortField);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [loadTimes, sortDirection, sortField]);

  const completedRows = loadTimes.length;
  const complete = completedRows >= examples.length;
  const successfulTimes = tableData
    .filter((item) => item.status === "complete" && typeof item.loadTime === "number")
    .map((item) => item.loadTime);
  const maxTime = successfulTimes.length ? Math.max(...successfulTimes) : 100;
  const maxSize = Math.max(...examples.map((item) => item.size));

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  }

  function handleSourceClick(event, item) {
    event.preventDefault();
    setPreview({
      open: true,
      name: item.name,
      url: item.url,
      source: "Loading source...",
    });

    fetch(item.url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText || "error"}`);
        }
        return response.text();
      })
      .then((source) => {
        setPreview((current) => (
          current.url === item.url ? { ...current, source } : current
        ));
      })
      .catch((error) => {
        setPreview((current) => (
          current.url === item.url
            ? { ...current, source: `Could not load ${item.url}: ${error.message}` }
            : current
        ));
      });
  }

  function closePreview() {
    setPreview((current) => ({ ...current, open: false }));
  }

  function openPreviewDemo() {
    window.open(preview.url, "_blank", "noopener");
  }

  return (
    <div className="benchmark-app">
      <header className="docs-topbar benchmark-topbar">
        <a className="docs-brand" href="/" aria-label="Bundless home">
          <span className="docs-brand-mark">B</span>
          <span>Bundless</span>
        </a>
        <nav className="docs-toplinks" aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/usage.html">Usage Docs</a>
          <a href="/migration.html">Migration</a>
          <a href="/playground.html">Playground</a>
          <a href="/benchmarks.html" aria-current="page">Benchmarks</a>
          <a href="https://github.com/karpatic/bundless">GitHub</a>
        </nav>
        <details className="docs-mobile-menu">
          <summary>Menu</summary>
          <nav className="docs-mobile-panel" aria-label="Mobile navigation">
            <a href="/">Home</a>
            <a href="/usage.html">Usage Docs</a>
            <a href="/migration.html">Migration</a>
            <a href="/playground.html">Playground</a>
            <a href="/benchmarks.html" aria-current="page">Benchmarks</a>
            <a href="https://github.com/karpatic/bundless">GitHub</a>
          </nav>
        </details>
      </header>

      <main className="benchmark-page">
        <section className="benchmark-hero">
          <p className="docs-kicker">Benchmarks</p>
          <h1>Bundless Benchmarks</h1>
          <p>
            This page measures how long this browser takes to load small Hello World pages.
            It runs one hidden demo at a time, then keeps the completed rows sortable.
          </p>
          <div className="benchmark-status" id="benchmark-status" data-status={complete ? "complete" : "running"}>
            <span>{complete ? "Complete" : "Running"}</span>
            <strong>{completedRows} / {examples.length}</strong>
          </div>
        </section>

        <section className="benchmark-note">
          <p>
            <strong>B.Acorn + Preact</strong> means Bundless Acorn transpiles React-style JSX toward
            Preact. Treat these numbers as a quick local comparison, not a lab result.
          </p>
          <div className="docs-demo-links">
            <a className="docs-button-link" href="/playground.html">Open Playground</a>
            <a className="docs-button-link secondary" href="/usage.html">Read Usage Docs</a>
          </div>
        </section>

        <section className="benchmark-table-wrap" aria-label="Benchmark results">
          <table className="benchmark-table">
            <thead>
              <tr>
                <th>
                  <button type="button" onClick={() => handleSort("name")}>
                    Build Method <SortLabel field="name" sortField={sortField} sortDirection={sortDirection} />
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => handleSort("loadTime")}>
                    Load Time <SortLabel field="loadTime" sortField={sortField} sortDirection={sortDirection} />
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => handleSort("size")}>
                    Size <SortLabel field="size" sortField={sortField} sortDirection={sortDirection} />
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => handleSort("jsx")}>
                    JSX <SortLabel field="jsx" sortField={sortField} sortDirection={sortDirection} />
                  </button>
                </th>
                <th>
                  <button type="button" onClick={() => handleSort("ts")}>
                    TS <SortLabel field="ts" sortField={sortField} sortDirection={sortDirection} />
                  </button>
                </th>
                <th>Demo</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item) => (
                <tr className={item.highlight ? `benchmark-row-${item.highlight}` : ""} data-status={item.status} key={item.name}>
                  <td>
                    <strong>{item.name}</strong>
                    {item.recommended ? <span className="benchmark-pill">Recommended</span> : null}
                    {item.caption ? <span className="benchmark-caption">{item.caption}</span> : null}
                  </td>
                  <td><LoadTimeCell item={item} maxTime={maxTime} /></td>
                  <td><SizeCell size={item.size} maxSize={maxSize} /></td>
                  <td><Capability value={item.jsx} /></td>
                  <td><Capability value={item.ts} /></td>
                  <td>
                    <div className="benchmark-actions">
                      <button type="button" onClick={(event) => handleSourceClick(event, item)}>Source</button>
                      <a href={item.url} target="_blank" rel="noopener">Open</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {preview.open ? (
          <div className="benchmark-modal" role="dialog" aria-modal="true" aria-label={`Source preview for ${preview.name}`} onClick={closePreview}>
            <section className="benchmark-modal-panel" onClick={(event) => event.stopPropagation()}>
              <header>
                <div>
                  <p className="docs-kicker">Source Preview</p>
                  <h2>{preview.name}</h2>
                  <a href={preview.url}>{preview.url}</a>
                </div>
                <button type="button" onClick={closePreview}>Close</button>
              </header>
              <pre><code>{preview.source}</code></pre>
              <footer>
                <button type="button" onClick={openPreviewDemo}>Open Demo</button>
              </footer>
            </section>
          </div>
        ) : null}

        <iframe
          ref={iframeRef}
          id="benchmark-frame"
          title="Benchmark runner"
          hidden
        ></iframe>
      </main>
    </div>
  );
}

const rootElement = document.getElementById("react-root");
ReactDOM.render(<BenchmarksPage />, rootElement);
