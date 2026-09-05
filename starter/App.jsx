import React from "react";
import ReactDOM from "react-dom";
import Header from "./components/Header.jsx";

function App() {
  return (
    <main>
      <Header />
      <p>Edit any component, save, and reload.</p>
    </main>
  );
}

ReactDOM.render(<App />, document.getElementById("react-root"));
