import React from "react";
import ReactDOM from "react-dom";

function Counter() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    window.benchmarkReady("#benchmark-app", "counter");
  }, []);

  return (
    <main>
      <h1>Counter</h1>
      <button data-counter type="button" onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </main>
  );
}

ReactDOM.render(<Counter />, document.getElementById("benchmark-app"));
