(function () {
  const parameters = new URLSearchParams(location.search);
  const runToken = parameters.get("benchmarkRun") || "standalone";
  let finished = false;

  function send(status, detail) {
    if (finished && status === "ready") {
      return;
    }
    if (status === "ready") {
      finished = true;
    }
    parent.postMessage({
      protocol: "bundless-benchmark-v1",
      runToken,
      status,
      ...detail,
    }, location.origin);
  }

  window.benchmarkReady = function (selector, marker) {
    requestAnimationFrame(function () {
      const root = document.querySelector(selector);
      const text = root ? root.textContent.trim() : "";
      const counter = root && root.querySelector("button[data-counter]");
      const valid = Boolean(
        root &&
        text &&
        (marker !== "counter" || (counter && /Count:\s*0/.test(counter.textContent)))
      );
      if (!valid) {
        send("error", { marker, message: `Rendered output failed validation for ${selector}.` });
        return;
      }
      send("ready", { marker, text, valid: true });
    });
  };

  window.benchmarkWaitFor = function (selector, marker) {
    const root = document.querySelector(selector);
    if (!root) {
      send("error", { marker, message: `Missing benchmark root ${selector}.` });
      return;
    }
    if (root.textContent.trim()) {
      window.benchmarkReady(selector, marker);
      return;
    }
    const observer = new MutationObserver(function () {
      if (root.textContent.trim()) {
        observer.disconnect();
        window.benchmarkReady(selector, marker);
      }
    });
    observer.observe(root, { childList: true, subtree: true });
  };

  window.addEventListener("error", function (event) {
    const resource = event.target && (event.target.src || event.target.href);
    send("error", {
      marker: "error",
      message: resource ? `Failed to load ${resource}.` : event.message || "Runtime error.",
    });
  }, true);

  window.addEventListener("unhandledrejection", function (event) {
    const reason = event.reason;
    send("error", {
      marker: "error",
      message: reason && reason.message ? reason.message : String(reason || "Unhandled promise rejection."),
    });
  });
})();
