import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { Parser } from '../rsc/acorn/acorn.min.mjs';
import acornJsxPlugin from '../rsc/acorn/acorn.jsx.min.mjs';

async function importSourceModule(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}

const [{ transformAST }, meriyah] = await Promise.all([
  importSourceModule('../src/bundless.utils.ast.transpiler.js'),
  importSourceModule('../rsc/meriyah/meriyah.esm.js'),
]);

const acornParser = Parser.extend(acornJsxPlugin());
const parsers = [
  ['Acorn', (code) => acornParser.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  })],
  ['Meriyah', (code) => meriyah.parse(code, {
    jsx: true,
    module: true,
    raw: true,
  })],
];

function transpile(parse, code, debug) {
  return transformAST(parse(code), debug).code;
}

function execute(code, globals = {}) {
  const sandbox = { ...globals };
  new Function('globalThis', 'React', 'UI', code)(
    sandbox,
    globals.React,
    globals.UI,
  );
  return sandbox;
}

for (const [parserName, parse] of parsers) {
  test(`${parserName}: grouped expressions preserve runtime semantics`, () => {
    const output = transpile(parse, `
      const arithmetic = (1 + 2) * 3;
      const logical = (true || false) && false;
      const conditional = (true ? 1 : 2) + 3;
      const exponent = (2 ** 3) ** 2;
      globalThis.result = { arithmetic, logical, conditional, exponent };
    `);

    assert.deepEqual(execute(output).result, {
      arithmetic: 9,
      logical: false,
      conditional: 4,
      exponent: 64,
    });
  });

  test(`${parserName}: shorthand fragments and member JSX tags render`, () => {
    const React = {
      Fragment: Symbol('Fragment'),
      createElement: (tag, props, ...children) => ({ tag, props, children }),
    };
    const UI = { Button: Symbol('Button') };
    const output = transpile(parse, `
      const Shorthand = () => <>
        <span>A</span>
        <span>B</span>
      </>;
      globalThis.result = [
        Shorthand(),
        <React.Fragment><UI.Button /></React.Fragment>,
      ];
    `);
    const { result } = execute(output, { React, UI });

    assert.equal(result[0].tag, React.Fragment);
    assert.deepEqual(result[0].children.map((child) => child.children[0]), ['A', 'B']);
    assert.equal(result[1].tag, React.Fragment);
    assert.equal(result[1].children[0].tag, UI.Button);
  });

  test(`${parserName}: computed, quoted, and optional computed properties work`, () => {
    const output = transpile(parse, `
      const key = 'gain';
      const directory = {};
      globalThis.result = {
        object: { [key]: 3, 'aria-label': 'volume' },
        optional: directory.fileIds?.[0] ?? 'safe',
      };
    `);

    assert.deepEqual(execute(output).result, {
      object: { gain: 3, 'aria-label': 'volume' },
      optional: 'safe',
    });
  });

  test(`${parserName}: for-of and while loop bodies execute`, () => {
    const output = transpile(parse, `
      let total = 0;
      for (const [first, second] of [[1, 2], [3, 4]]) {
        total += first + second;
      }
      let count = 0;
      while (count < 3) {
        count++;
      }
      globalThis.result = { total, count };
    `);

    assert.deepEqual(execute(output).result, { total: 10, count: 3 });
  });

  test(`${parserName}: destructured callback parameters retain bindings`, () => {
    const output = transpile(parse, `
      const objectResult = [{ id: undefined, extra: 3 }]
        .map(({ id: itemId = 2, ...rest }) => itemId + rest.extra)[0];
      const arrayResult = [[3, 4]].map(([first, second]) => first + second)[0];
      globalThis.result = { objectResult, arrayResult };
    `);

    assert.deepEqual(execute(output).result, { objectResult: 5, arrayResult: 7 });
  });

  test(`${parserName}: dynamic imports keep the custom/native boundary`, () => {
    const localOutput = transpile(
      parse,
      'globalThis.result = import("./lazy.jsx?mode=test");',
      { filePath: 'https://example.test/app/entry.jsx' },
    );
    const packageOutput = transpile(parse, 'globalThis.result = import("webmidi");');
    const remoteOutput = transpile(parse, 'globalThis.result = import("https://cdn.example/module.js");');

    assert.match(localOutput, /window\.import\("https:\/\/example\.test\/app\/lazy\.jsx\?mode=test"\)/);
    assert.match(packageOutput, /window\.Bundless\.nativeImport\("webmidi"\)/);
    assert.match(remoteOutput, /window\.Bundless\.nativeImport\("https:\/\/cdn\.example\/module\.js"\)/);
  });

  test(`${parserName}: throw preserves an existing new expression`, () => {
    const output = transpile(parse, `
      function fail() {
        throw new Error('boom');
      }
      fail();
    `);

    assert.throws(() => execute(output), { name: 'Error', message: 'boom' });
    assert.doesNotMatch(output, /throw new new/);
  });
}
