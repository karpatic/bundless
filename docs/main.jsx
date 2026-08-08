import React from "react";
import ReactDOM from "react-dom";
import { DocsShell, ErrorPage, LoadingPage } from "./App.jsx";

function DocsApp() {
  const page = window.DOCS_PAGE || {
    id: "usage",
    href: "/usage.html",
    module: "/docs/pages/usage.jsx",
  };
  const [PageComponent, setPageComponent] = React.useState(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;

    window.import(page.module)
      .then((module) => {
        if (!cancelled) {
          setPageComponent(() => module.default);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message || String(loadError));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  let content = <LoadingPage />;
  if (error) {
    content = <ErrorPage message={error} />;
  } else if (PageComponent) {
    content = <PageComponent />;
  }

  return <DocsShell page={page}>{content}</DocsShell>;
}

ReactDOM.render(<DocsApp />, document.getElementById("docs-root"));
