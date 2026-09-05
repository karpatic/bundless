const initialFiles = {
  "App.jsx": `import React from "react";
import ReactDOM from "react-dom";
import Header from "./components/Header.jsx";

function App() {
  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <Header />
      <p>Edit any file, then run the app again.</p>
    </main>
  );
}

ReactDOM.render(<App />, document.getElementById("react-root"));`,
  "components/Header.jsx": `import React from "react";
import Button from "./Button.jsx";

export default function Header() {
  return (
    <header data-playground-ready="true">
      <p style={{ color: "#16845a", fontWeight: 700 }}>App → Header → Button</p>
      <h1>Three files. Zero bundle.</h1>
      <Button />
    </header>
  );
}`,
  "components/Button.jsx": `import React from "react";

export default function Button() {
  const [count, setCount] = React.useState(0);

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}`,
};

let files = { ...initialFiles };
let activeFile = "App.jsx";
let runSequence = 0;
let runTimeout = 0;

if (new URLSearchParams(location.search).has("verify-error")) {
  files["components/Header.jsx"] = 'import React from "react";\nexport default function Header() { return <h1>Broken; }';
}

const editor = document.getElementById("jsx-code");
const transpiledEditor = document.getElementById("transpiled-code");
const tabs = document.getElementById("playground-file-tabs");
const activePath = document.getElementById("active-file-path");
const transpiledPath = document.getElementById("transpiled-file-path");
const frame = document.getElementById("output-frame");
const status = document.getElementById("playground-status");
const runButton = document.getElementById("run-jsx");
const resetButton = document.getElementById("reset-playground");

function setStatus(kind, title, detail) {
  status.dataset.status = kind;
  status.querySelector("strong").textContent = title;
  status.querySelector("span").textContent = detail;
}

function renderTabs() {
  tabs.replaceChildren();
  Object.keys(files).forEach((filename) => {
    const button = document.createElement("button");
    button.type = "button";
    button.role = "tab";
    button.textContent = filename.split("/").pop();
    button.title = filename;
    button.dataset.filename = filename;
    button.setAttribute("aria-selected", String(filename === activeFile));
    button.addEventListener("click", () => selectFile(filename));
    tabs.appendChild(button);
  });
}

function selectFile(filename) {
  files[activeFile] = editor.value;
  activeFile = filename;
  editor.value = files[activeFile];
  activePath.textContent = activeFile;
  transpiledPath.textContent = activeFile;
  renderTabs();
}

function serializeForInlineScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function createPreviewDocument(runId) {
  const virtualFiles = {};
  Object.entries(files).forEach(([filename, source]) => {
    virtualFiles[`/__bundless_playground__/${filename}`] = source;
  });

  const serializedFiles = serializeForInlineScript(virtualFiles);
  const serializedRunId = serializeForInlineScript(runId);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@17.0.2/es2022/react.mjs",
        "react-dom": "https://esm.sh/react-dom@17.0.2/es2022/react-dom.mjs"
      }
    }
  <\/script>
  <style>
    body { margin: 0; color: #17211d; }
    button { background: #17211d; border: 0; border-radius: 7px; color: white; cursor: pointer; font: inherit; padding: .7rem 1rem; }
  </style>
</head>
<body>
  <div id="react-root"></div>
  <script>
    const playgroundFiles = ${serializedFiles};
    const playgroundRunId = ${serializedRunId};
    const nativeFetch = window.fetch.bind(window);
    const send = (status, detail) => parent.postMessage({
      protocol: "bundless-playground-v1",
      runId: playgroundRunId,
      status,
      detail: String(detail || "")
    }, "*");

    window.fetch = (input, init) => {
      const requestUrl = new URL(typeof input === "string" ? input : input.url, location.href);
      if (Object.prototype.hasOwnProperty.call(playgroundFiles, requestUrl.pathname)) {
        return Promise.resolve(new Response(playgroundFiles[requestUrl.pathname], {
          status: 200,
          headers: { "Content-Type": "text/javascript; charset=utf-8" }
        }));
      }
      return nativeFetch(input, init);
    };

    window.addEventListener("error", (event) => {
      const resource = event.target && (event.target.src || event.target.href);
      send("error", resource ? "Failed to load " + resource : event.message || "Runtime error");
    }, true);
    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason;
      send("error", reason && reason.message ? reason.message : reason || "Unhandled promise rejection");
    });

    const root = document.getElementById("react-root");
    const observer = new MutationObserver(() => {
      if (root.childNodes.length > 0) {
        observer.disconnect();
        requestAnimationFrame(() => send("ready", root.textContent.trim()));
      }
    });
    observer.observe(root, { childList: true, subtree: true });
  <\/script>
  <script src="./__bundless_playground__/App.jsx" type="text/jsx"><\/script>
  <script src="./dist/bundless.sucrase.min.js" type="module"><\/script>
</body>
</html>`;
}

async function runPlayground() {
  files[activeFile] = editor.value;
  runSequence += 1;
  const runId = `run-${runSequence}`;
  window.clearTimeout(runTimeout);
  runButton.disabled = true;
  setStatus("running", "Compiling", `Checking ${activeFile} and starting the three-file app…`);

  try {
    if (!window.Bundless || typeof window.Bundless.transpileCode !== "function") {
      throw new Error("The Bundless Sucrase runtime did not load.");
    }

    const activeSegments = activeFile.split("/");
    const activeFilename = activeSegments.pop();
    const activeDirectory = activeSegments.length ? `${activeSegments.join("/")}/` : "";
    const virtualBase = new URL(`./__bundless_playground__/${activeDirectory}`, location.href).href;
    transpiledEditor.value = await window.Bundless.transpileCode(
      files[activeFile],
      virtualBase,
      activeFilename
    );
    transpiledPath.textContent = activeFile;
    frame.srcdoc = createPreviewDocument(runId);
    runTimeout = window.setTimeout(() => {
      runButton.disabled = false;
      setStatus("error", "Preview timed out", "No rendered application signal arrived within 10 seconds.");
    }, 10000);
  } catch (error) {
    runButton.disabled = false;
    transpiledEditor.value = "";
    setStatus("error", "Compile error", error && error.message ? error.message : String(error));
  }
}

window.addEventListener("message", (event) => {
  if ((event.origin !== location.origin && event.origin !== "null") || event.source !== frame.contentWindow) {
    return;
  }
  const message = event.data;
  if (!message || message.protocol !== "bundless-playground-v1" || message.runId !== `run-${runSequence}`) {
    return;
  }

  window.clearTimeout(runTimeout);
  runButton.disabled = false;
  if (message.status === "ready") {
    setStatus("success", "App rendered", "App.jsx → Header.jsx → Button.jsx compiled and rendered successfully.");
  } else {
    setStatus("error", "Runtime error", message.detail || "The preview failed before rendering.");
  }
});

editor.addEventListener("input", () => {
  files[activeFile] = editor.value;
});
runButton.addEventListener("click", runPlayground);
resetButton.addEventListener("click", () => {
  files = { ...initialFiles };
  activeFile = "App.jsx";
  editor.value = files[activeFile];
  activePath.textContent = activeFile;
  transpiledPath.textContent = activeFile;
  transpiledEditor.value = "";
  renderTabs();
  runPlayground();
});

editor.value = files[activeFile];
renderTabs();
runPlayground();
