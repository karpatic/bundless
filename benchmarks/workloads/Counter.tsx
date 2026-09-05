import React from "react";
import ReactDOM from "react-dom";

type CounterProps = {
  initialCount: number;
};

function Counter({ initialCount }: CounterProps) {
  const [count, setCount] = React.useState(initialCount);

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

ReactDOM.render(<Counter initialCount={0} />, document.getElementById("benchmark-app"));
