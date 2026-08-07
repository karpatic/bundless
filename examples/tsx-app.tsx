import React from "react";
import ReactDOM from "react-dom";

type MessageProps = {
  name: string;
};

function Message({ name }: MessageProps) {
  return (
    <main>
      <h1>Bundless TSX Demo</h1>
      <p id="tsx-result">Hello, {name}.</p>
    </main>
  );
}

ReactDOM.render(<Message name="TSX" />, document.getElementById("react-root"));
