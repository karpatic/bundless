const parameters = new URLSearchParams(location.search);
const runsPerExample = parameters.has("fast-smoke") ? 1 : 3;
const rowTimeoutMs = parameters.has("fast-smoke") ? 8000 : 12000;

const groups = [
  {
    id: "static",
    title: "Static document baselines",
    description: "Equivalent Hello World output through inline, external, classic, and module paths.",
  },
  {
    id: "counter",
    title: "Equivalent interactive counter",
    description: "Every demo renders a Count: 0 button and reports ready only after that output is in the DOM.",
  },
  {
    id: "legacy",
    title: "Existing built demo artifacts",
    description: "These older Webpack and Vite artifacts render different application content, so their medians are not ranked against the counter group.",
  },
];

const examples = [
  { group: "static", name: "HTML Inline", url: "/benchmarks/html.html", size: 1, jsx: false, ts: false, marker: "greeting" },
  { group: "static", name: "Script Inline", url: "/benchmarks/vanilla.html", size: 1, jsx: false, ts: false, marker: "greeting" },
  { group: "static", name: "Script Src", url: "/benchmarks/vanilla_src.html", size: 1, jsx: false, ts: false, marker: "greeting" },
  { group: "static", name: "Module Inline", url: "/benchmarks/module.html", size: 1, jsx: false, ts: false, marker: "greeting" },
  { group: "static", name: "Module Src", url: "/benchmarks/module_src.html", size: 1, jsx: false, ts: false, marker: "greeting" },
  { group: "static", name: "Module Import", url: "/benchmarks/module_import.html", size: 1, jsx: false, ts: false, marker: "greeting" },
  { group: "counter", name: "CDN + HTMX", url: "/benchmarks/htmx.html", size: 20, jsx: false, ts: false, marker: "counter", caption: "HTMX plus an inline counter handler." },
  { group: "counter", name: "CDN + Preact", url: "/benchmarks/preact.html", size: 6, jsx: false, ts: false, marker: "counter" },
  { group: "counter", name: "CDN + jQuery", url: "/benchmarks/jquery.html", size: 32, jsx: false, ts: false, marker: "counter" },
  { group: "counter", name: "CDN + React + Babel", url: "/benchmarks/babel.html", size: 500, jsx: true, ts: false, marker: "counter", caption: "JSX is compiled by Babel Standalone." },
  { group: "counter", name: "Bundless Acorn + Preact", url: "/benchmarks/bundless.html?runtime=acorn&target=preact", size: 40, jsx: true, ts: false, marker: "counter" },
  { group: "counter", name: "Bundless Meriyah + Preact", url: "/benchmarks/bundless.html?runtime=meriyah&target=preact", size: 45, jsx: true, ts: false, marker: "counter" },
  { group: "counter", name: "Bundless Babel + React", url: "/benchmarks/bundless.html?runtime=babel&target=react", size: 500, jsx: true, ts: false, marker: "counter", caption: "Broad Babel Standalone syntax coverage." },
  { group: "counter", name: "Bundless Meriyah + React", url: "/benchmarks/bundless.html?runtime=meriyah&target=react", size: 80, jsx: true, ts: false, marker: "counter" },
  { group: "counter", name: "Bundless Acorn + React", url: "/benchmarks/bundless.html?runtime=acorn&target=react", size: 75, jsx: true, ts: false, marker: "counter", recommended: "JSX default" },
  { group: "counter", name: "Bundless Sucrase + React", url: "/benchmarks/bundless.html?runtime=sucrase&target=react", size: 90, jsx: true, ts: false, marker: "counter" },
  { group: "counter", name: "Bundless Sucrase + TSX", url: "/benchmarks/bundless.html?runtime=sucrase&target=react&syntax=tsx", size: 90, jsx: true, ts: true, marker: "counter", recommended: "TSX path" },
  { group: "legacy", name: "Webpack + React", url: "/benchmarks/react.html", size: 40, jsx: true, ts: false, marker: "legacy", caption: "Prebuilt historical artifact." },
  { group: "legacy", name: "Vite + React", url: "/benchmarks/vite.html", size: 46, jsx: true, ts: true, marker: "legacy", caption: "Prebuilt historical artifact." },
];

if (parameters.has("verify-failure")) {
  examples[0] = { ...examples[0], url: "/benchmarks/failure.html", caption: "Intentional readiness failure for diagnostics verification." };
}

const results = new Map(examples.map((example) => [example.name, []]));
const rowElements = new Map();
let activeTask = null;
let activeTimeout = 0;
let completedRuns = 0;
let suiteSequence = 0;

function navigation() {
  return `<header class="docs-topbar benchmark-topbar">
    <a class="docs-brand" href="/" aria-label="Bundless home"><span class="docs-brand-mark">B</span><span>Bundless</span></a>
    <nav class="docs-toplinks" aria-label="Main navigation">
      <a href="/">Home</a><a href="/usage.html">Usage</a><a href="/playground.html">Playground</a>
      <a href="/benchmarks.html" aria-current="page">Benchmarks</a><a href="/migration.html">Migration</a>
      <a href="https://github.com/karpatic/bundless">GitHub</a>
    </nav>
    <details class="docs-mobile-menu"><summary>Menu</summary><nav class="docs-mobile-panel" aria-label="Mobile navigation">
      <a href="/">Home</a><a href="/usage.html">Usage</a><a href="/playground.html">Playground</a>
      <a href="/benchmarks.html" aria-current="page">Benchmarks</a><a href="/migration.html">Migration</a>
      <a href="https://github.com/karpatic/bundless">GitHub</a>
    </nav></details>
  </header>`;
}

function capability(value) {
  return `<span class="${value ? "benchmark-yes" : "benchmark-no"}">${value ? "Yes" : "No"}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function rowMarkup(example) {
  const recommendation = example.recommended ? `<span class="benchmark-pill">${example.recommended}</span>` : "";
  const caption = example.caption ? `<span class="benchmark-caption">${example.caption}</span>` : "";
  return `<tr data-status="pending" data-example="${example.name}">
    <td><strong>${example.name}</strong>${recommendation}${caption}</td>
    <td data-result><div class="benchmark-load"><span class="benchmark-spinner" aria-hidden="true"></span><span>Queued</span></div></td>
    <td><div class="benchmark-load"><span class="benchmark-time">${example.size} kB est.</span><div class="benchmark-meter size" aria-hidden="true"><span style="width:${Math.max(4, example.size / 5)}%"></span></div></div></td>
    <td>${capability(example.jsx)}</td><td>${capability(example.ts)}</td>
    <td><div class="benchmark-actions"><button type="button" data-source="${example.name}">Source</button><a href="${example.url}" target="_blank" rel="noopener">Open</a></div></td>
  </tr>`;
}

function renderPage() {
  const groupMarkup = groups.map((group) => {
    const rows = examples.filter((example) => example.group === group.id).map(rowMarkup).join("");
    return `<section class="benchmark-group" aria-labelledby="benchmark-${group.id}">
      <header><h2 id="benchmark-${group.id}">${group.title}</h2><p>${group.description}</p></header>
      <div class="benchmark-table-wrap"><table class="benchmark-table"><thead><tr>
        <th>Build method</th><th>Median app-ready</th><th>Est. payload</th><th>JSX source</th><th>TS syntax</th><th>Demo</th>
      </tr></thead><tbody>${rows}</tbody></table></div>
    </section>`;
  }).join("");

  document.getElementById("benchmark-root").innerHTML = `${navigation()}
    <main class="benchmark-page">
      <section class="benchmark-hero">
        <div><p class="docs-kicker">Benchmarks</p><h1>Rendered-app startup checks</h1>
          <p>Each page must prove that its application output rendered. Load events alone do not count.</p></div>
        <div class="benchmark-status" id="benchmark-status" data-status="running"><span>Running</span><strong>0 / ${examples.length * runsPerExample}</strong></div>
      </section>
      <section class="benchmark-note benchmark-methodology">
        <div><h2>Methodology</h2>
          <p>${runsPerExample} run${runsPerExample === 1 ? "" : "s"} per demo in randomized order. The table reports the median validated app-ready time. Each HTML navigation gets a unique query, while stable subresource URLs may use the browser’s normal HTTP cache; later runs are therefore warm-cache influenced. The runner itself is plain JavaScript and does not preload React, Preact, or Bundless.</p>
          <p>Payload values are labeled historical estimates: decimal kB (1 kB = 1,000 bytes) of compressed production JavaScript expected by that demo, excluding HTML, application data, the shared readiness probe, and any bytes already cached. They predate the browser footprint refactor and are not current runtime sizes or live transfer measurements. See the <a href="/docs/reference/runtimes.html">runtime reference</a> for current local artifact scope.</p></div>
        <div class="docs-demo-links"><button class="docs-button-link" id="run-benchmarks" type="button">Run again</button><a class="docs-button-link secondary" href="/playground.html">Open playground</a></div>
      </section>
      ${groupMarkup}
      <iframe id="benchmark-frame" title="Benchmark runner" hidden></iframe>
      <div class="benchmark-modal" id="benchmark-modal" role="dialog" aria-modal="true" aria-label="Source preview" hidden>
        <section class="benchmark-modal-panel"><header><div><p class="docs-kicker">Source preview</p><h2 id="benchmark-modal-title"></h2><a id="benchmark-modal-link"></a></div><button type="button" id="benchmark-modal-close">Close</button></header>
        <pre><code id="benchmark-modal-source"></code></pre><footer><button type="button" id="benchmark-modal-open">Open demo</button></footer></section>
      </div>
    </main>`;

  examples.forEach((example) => {
    rowElements.set(example.name, document.querySelector(`[data-example="${CSS.escape(example.name)}"]`));
  });
  document.getElementById("run-benchmarks").addEventListener("click", startSuite);
  document.querySelectorAll("[data-source]").forEach((button) => button.addEventListener("click", () => openSource(button.dataset.source)));
  document.getElementById("benchmark-modal-close").addEventListener("click", closeSource);
  document.getElementById("benchmark-modal").addEventListener("click", (event) => {
    if (event.target.id === "benchmark-modal") closeSource();
  });
}

function shuffle(items) {
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function median(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function renderResult(example) {
  const attempts = results.get(example.name);
  const row = rowElements.get(example.name);
  const successes = attempts.filter((attempt) => attempt.status === "ready");
  const failures = attempts.filter((attempt) => attempt.status !== "ready");
  const resultCell = row.querySelector("[data-result]");
  const running = activeTask && activeTask.example.name === example.name;
  row.dataset.status = running ? "pending" : failures.length ? (successes.length ? "partial" : "error") : successes.length === runsPerExample ? "complete" : "pending";

  if (running) {
    resultCell.innerHTML = `<div class="benchmark-load"><span class="benchmark-spinner" aria-hidden="true"></span><span>Run ${attempts.length + 1} / ${runsPerExample}</span></div>`;
    return;
  }
  if (!attempts.length) {
    resultCell.innerHTML = '<span class="benchmark-muted">Queued</span>';
    return;
  }

  const failureText = failures.length ? ` · ${failures.length} ${failures[0].status}${failures[0].message ? `: ${escapeHtml(failures[0].message)}` : ""}` : "";
  if (!successes.length) {
    resultCell.innerHTML = `<span class="benchmark-error-text">${attempts.length}/${runsPerExample} failed${failureText}</span>`;
    return;
  }
  const value = median(successes.map((attempt) => attempt.duration));
  resultCell.innerHTML = `<div class="benchmark-load"><span class="benchmark-time">${value.toFixed(1)} ms median</span><span class="benchmark-caption">${successes.length}/${runsPerExample} ready${failureText}</span></div>`;
}

function updateProgress(done) {
  const total = examples.length * runsPerExample;
  const element = document.getElementById("benchmark-status");
  element.dataset.status = done ? "complete" : "running";
  element.querySelector("span").textContent = done ? "Complete" : "Running";
  element.querySelector("strong").textContent = `${completedRuns} / ${total}`;
}

function appendRunQuery(url, token) {
  const next = new URL(url, location.href);
  next.searchParams.set("benchmarkRun", token);
  return next.href;
}

async function startSuite() {
  suiteSequence += 1;
  completedRuns = 0;
  activeTask = null;
  window.clearTimeout(activeTimeout);
  results.forEach((attempts) => attempts.splice(0));
  examples.forEach(renderResult);
  updateProgress(false);
  document.getElementById("run-benchmarks").disabled = true;

  const tasks = shuffle(examples.flatMap((example) => Array.from({ length: runsPerExample }, (_, runIndex) => ({ example, runIndex }))));
  for (const task of tasks) {
    await runTask(task, suiteSequence);
  }
  activeTask = null;
  updateProgress(true);
  document.getElementById("run-benchmarks").disabled = false;
}

function runTask(task, sequence) {
  return new Promise((resolve) => {
    const frame = document.getElementById("benchmark-frame");
    const token = `${sequence}-${task.runIndex}-${Math.random().toString(36).slice(2)}`;
    activeTask = { ...task, token, startedAt: performance.now(), resolve };
    renderResult(task.example);
    activeTimeout = window.setTimeout(() => finishTask("timeout", "No validated app-ready signal."), rowTimeoutMs);
    frame.src = appendRunQuery(task.example.url, token);
  });
}

function finishTask(status, message) {
  if (!activeTask) return;
  window.clearTimeout(activeTimeout);
  const task = activeTask;
  activeTask = null;
  results.get(task.example.name).push({
    status,
    message: message || "",
    duration: status === "ready" ? performance.now() - task.startedAt : null,
  });
  completedRuns += 1;
  renderResult(task.example);
  updateProgress(false);
  task.resolve();
}

window.addEventListener("message", (event) => {
  const frame = document.getElementById("benchmark-frame");
  const message = event.data;
  if (!activeTask || event.origin !== location.origin || event.source !== frame.contentWindow) return;
  if (!message || message.protocol !== "bundless-benchmark-v1" || message.runToken !== activeTask.token) return;
  if (message.status === "ready" && message.valid === true && message.marker === activeTask.example.marker) {
    finishTask("ready", "");
    return;
  }
  finishTask("error", message.message || "Application readiness validation failed.");
});

async function openSource(name) {
  const example = examples.find((item) => item.name === name);
  const modal = document.getElementById("benchmark-modal");
  const title = document.getElementById("benchmark-modal-title");
  const link = document.getElementById("benchmark-modal-link");
  const source = document.getElementById("benchmark-modal-source");
  title.textContent = example.name;
  link.href = example.url;
  link.textContent = example.url;
  source.textContent = "Loading source…";
  modal.hidden = false;
  document.getElementById("benchmark-modal-open").onclick = () => window.open(example.url, "_blank", "noopener");
  try {
    const response = await fetch(example.url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    source.textContent = await response.text();
  } catch (error) {
    source.textContent = `Could not load ${example.url}: ${error.message}`;
  }
}

function closeSource() {
  document.getElementById("benchmark-modal").hidden = true;
}

renderPage();
startSuite();
