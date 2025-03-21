

import React from 'react';
console.log('Nested.js Retrieved');

import { test } from './../../subdirectory/test.js';  
console.log('Nested.js loaded');

function Child({ text }) {
  return (
    <div>
      <h2>{text}</h2> 
      <h2>Test: {test}</h2>
    </div>
  );
}

export { Child };