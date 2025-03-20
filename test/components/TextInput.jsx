
import React from 'react';
const TextInput = (props = { text, onChange }) => {
  return (
    <div>
      <p>You typed: {props.text}</p>
      <input
        type="text"
        value={props.text}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
};

export default TextInput;