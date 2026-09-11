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
    ranges: true,
    raw: true,
  })],
];

function transpile(parse, code, debug) {
  return transformAST(parse(code), { ...debug, code }).code;
}

function execute(code, globals = {}) {
  const sandbox = { ...globals };
  new Function('globalThis', 'window', 'React', 'UI', code)(
    sandbox,
    globals.window,
    globals.React,
    globals.UI,
  );
  return sandbox;
}

async function executeAsync(code, globals = {}) {
  const sandbox = { ...globals };
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  await new AsyncFunction('globalThis', 'window', 'React', 'UI', code)(
    sandbox,
    globals.window,
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

  test(`${parserName}: assignment expressions retain operand grouping`, () => {
    const output = transpile(parse, `
      let assigned = 0;
      const value = (assigned = 1) + 2;
      globalThis.result = { assigned, value };
    `);

    assert.deepEqual(execute(output).result, { assigned: 1, value: 3 });
  });

  test(`${parserName}: unary expressions remain valid exponentiation operands`, () => {
    const output = transpile(parse, `
      globalThis.result = (-2) ** 2;
    `);

    assert.equal(execute(output).result, 4);
  });

  test(`${parserName}: parenthesized optional chains retain their boundary`, () => {
    const output = transpile(parse, `
      const missing = null;
      let threw = false;
      try {
        (missing?.value).nested;
      } catch {
        threw = true;
      }
      globalThis.result = threw;
    `);

    assert.equal(execute(output).result, true);
  });

  test(`${parserName}: arrow functions retain call and member boundaries`, () => {
    const output = transpile(parse, `
      const value = ((number) => number + 1)(2);
      const arity = ((number) => number + 1).length;
      globalThis.result = { value, arity };
    `);

    assert.deepEqual(execute(output).result, { value: 3, arity: 1 });
  });

  test(`${parserName}: await and called constructors retain operand boundaries`, async () => {
    const output = transpile(parse, `
      function factory() {
        return Date;
      }
      const value = (await Promise.resolve({ value: 9 })).value;
      const timestamp = new (factory())(0).getTime();
      globalThis.result = { value, timestamp };
    `);

    assert.deepEqual((await executeAsync(output)).result, { value: 9, timestamp: 0 });
  });

  test(`${parserName}: update and object expressions retain member boundaries`, () => {
    const output = transpile(parse, `
      let count = 0;
      const text = (++count).toString();
      ({ value: globalThis.objectValue = 9 }).value;
      globalThis.result = { count, text, objectValue: globalThis.objectValue };
    `);

    assert.deepEqual(execute(output).result, { count: 1, text: '1', objectValue: 9 });
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

  test(`${parserName}: dynamic import syntax survives JSX compilation for loader routing`, () => {
    const output = transpile(
      parse,
      `
        const nonliteralRelative = "./runtime-relative.jsx";
        globalThis.result = [
          import("./lazy.jsx?mode=test"),
          import("webmidi"),
          import("https://cdn.example/module.js"),
          import(nonliteralRelative),
        ];
      `,
      { filePath: 'https://example.test/app/entry.jsx' },
    );
    assert.match(output, /import\("\.\/lazy\.jsx\?mode=test"\)/);
    assert.match(output, /import\("webmidi"\)/);
    assert.match(output, /import\("https:\/\/cdn\.example\/module\.js"\)/);
    assert.match(output, /import\(nonliteralRelative\)/);
  });

  test(`${parserName}: ordinary syntax outside the old emitter is copied verbatim`, () => {
    const source = 'class Preserved { method() { return (1 + 2) * 3; } }';
    assert.equal(transpile(parse, source), source);
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
  test(`${parserName}: ASI, comments, strings and templates retain original source`, () => {
    const source = `
      function empty() { return
        { unreachable: true };
      }
      // import('./fake.jsx'); <Fake />
      const text = "export * from './fake.js'; <Fake />";
      const template = \`raw <Fake /> \${(1 + 2) * 3}\`;
      globalThis.result = [empty(), text, template];
    `;
    assert.equal(transpile(parse, source), source);
    assert.deepEqual(execute(transpile(parse, source)).result, [
      undefined, "export * from './fake.js'; <Fake />", 'raw <Fake /> 9',
    ]);
  });

  test(`${parserName}: nested JSX expressions, entities and sequence arguments survive ranges`, () => {
    const React = { createElement: (tag, props, ...children) => ({ tag, props, children }) };
    const output = transpile(parse, `
      globalThis.result = <div title="A &amp; B" data-value={(0, { default: 3 })}>
        A &amp; B
        {true ? <span>{((x) => <b>{x}</b>)(2)}</span> : null}
        {\`prefix \${<i />}\`}
        { /* omitted */ }
      </div>;
    `);
    const result = execute(output, { React }).result;
    // Meriyah leaves attribute entities literal; both parsers decode JSX text.
    const entityText = parserName === 'Meriyah' ? 'A &amp; B' : 'A & B';
    assert.equal(result.props.title, entityText);
    assert.deepEqual(result.props['data-value'], { default: 3 });
    assert.equal(result.children[0], 'A & B');
    assert.equal(result.children[1].children[0].children[0], 2);
    assert.equal(result.children[2], 'prefix [object Object]');
  });

  test(`${parserName}: compact JSX retains keyword token boundaries`, () => {
    const React = { createElement: (tag, props, ...children) => ({ tag, props, children }) };
    const output = transpile(parse, 'function view(){return<div/>} globalThis.result = [view(), typeof<div/>];');
    const result = execute(output, { React }).result;
    assert.equal(result[0].tag, 'div');
    assert.equal(result[1], 'object');
  });

  test(`${parserName}: Preact edits preserve fragments and literal React text`, () => {
    const source = 'const text = "React.useState"; const view = <React.Fragment>{React.useState(1)}</React.Fragment>;';
    const output = transpile(parse, source, { preact: true });
    assert.match(output, /h\(Fragment/);
    assert.match(output, /\(useState\(1\)\)/);
    assert.match(output, /"React.useState"/);
  });

}
