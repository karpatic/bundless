import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { transformSync as babelTransform } from '@babel/core';
import babelPresetEnv from '@babel/preset-env';
import babelPresetReact from '@babel/preset-react';

const variants = [
  { file: 'bundless.acorn.dev.js', sourceMap: true },
  { file: 'bundless.acorn.min.js', sourceMap: false },
  { file: 'bundless.acorn.prod.js', sourceMap: false },
  { file: 'bundless.meriyah.dev.js', sourceMap: true },
  { file: 'bundless.meriyah.min.js', sourceMap: false },
  { file: 'bundless.meriyah.prod.js', sourceMap: false },
  { file: 'bundless.babel.min.js', sourceMap: true, babel: true },
  { file: 'bundless.sucrase.min.js', sourceMap: true, typescript: true },
];

function installBabelStandaloneShim() {
  globalThis.Babel = {
    transform(code, options) {
      const presets = options.presets.map((preset) => {
        const [name, presetOptions] = Array.isArray(preset) ? preset : [preset, undefined];
        if (name === 'react') return [babelPresetReact, presetOptions];
        if (name === 'env') return [babelPresetEnv, presetOptions];
        throw new Error(`Unexpected Babel standalone preset in test: ${name}`);
      });
      return babelTransform(code, {
        ...options,
        babelrc: false,
        configFile: false,
        presets,
      });
    },
  };
}

async function loadVariant({ file, babel }) {
  const source = await readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8');
  const calls = { fetch: [], objectUrls: [], revokedUrls: [] };
  const sources = new Map();

  class TestBlob {
    constructor(parts) {
      this.source = parts.map(String).join('');
    }
  }
  class TestURL extends URL {}
  TestURL.createObjectURL = (blob) => {
    const url = `data:text/javascript;base64,${Buffer.from(blob.source).toString('base64')}#${file}-module-${calls.objectUrls.length}`;
    calls.objectUrls.push(url);
    return url;
  };
  TestURL.revokeObjectURL = (url) => calls.revokedUrls.push(url);

  globalThis.window = {};
  globalThis.location = { href: 'https://example.test/app/index.html' };
  globalThis.document = {
    readyState: 'complete',
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({}),
    head: { appendChild() {} },
    body: { appendChild() {} },
  };
  globalThis.Blob = TestBlob;
  globalThis.URL = TestURL;
  globalThis.fetch = async (url) => {
    calls.fetch.push(url);
    if (!sources.has(url)) {
      return { ok: false, statusText: 'Not Found' };
    }
    const value = sources.get(url);
    if (typeof value === 'function') {
      return value();
    }
    return { ok: true, text: async () => value };
  };
  globalThis.React = {
    Fragment: Symbol('Fragment'),
    createElement: (tag, props, ...children) => ({ tag, props, children }),
  };
  globalThis.UI = { Button: Symbol('Button') };
  if (babel) installBabelStandaloneShim();

  const originalWarn = console.warn;
  console.warn = () => {};
  try {
    await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#artifact-${file}`);
  } finally {
    console.warn = originalWarn;
  }
  return { calls, sources, window: globalThis.window };
}


async function probeModuleSeams({ window, sources }, extension) {
  sources.set(`https://example.test/app/no-default.${extension}`, 'export const value = 17;');
  sources.set(`https://example.test/app/interop.${extension}`, `import fallback from './no-default.${extension}'; export const value = fallback.value;`);
  assert.equal((await window.import(`./interop.${extension}`)).value, 17);
  sources.set(`https://example.test/app/missing.${extension}`, `import { absent } from './no-default.${extension}'; export { absent };`);
  await assert.rejects(window.import(`./missing.${extension}`), /does not provide an export named absent/);
  sources.set(`https://example.test/app/missing-reexport.${extension}`, `export { absent } from './no-default.${extension}';`);
  await assert.rejects(window.import(`./missing-reexport.${extension}`), /does not provide an export named absent/);
  sources.set(`https://example.test/app/star-a.${extension}`, 'export const collision = 1; export const onlyA = 2;');
  sources.set(`https://example.test/app/star-b.${extension}`, 'export const collision = 3; export const onlyB = 4;');
  sources.set(`https://example.test/app/stars.${extension}`, `export * from './star-a.${extension}'; export * from './star-b.${extension}';`);
  const stars = await window.import(`./stars.${extension}`);
  assert.deepEqual(Object.keys(stars), ['onlyA', 'onlyB']);
  sources.set(`https://example.test/app/cycle-a.${extension}`, `export * from './cycle-b.${extension}';`);
  sources.set(`https://example.test/app/cycle-b.${extension}`, `export * from './cycle-a.${extension}';`);
  await assert.rejects(window.import(`./cycle-a.${extension}`), /export-star cycle/);
}

async function probeASTRanges({ window, sources }, variant) {
  sources.set('https://example.test/app/quoted.js?v=q', `const value = 23; export { value as "a,b as c", value as "default" };`);
  sources.set('https://example.test/app/quoted-barrel.js', `
    export /* keep clause comments legal */ { "a,b as c" as "renamed value" } from './quoted.js?v=q';
    export * as "quoted namespace" from './quoted.js?v=q';
  `);
  sources.set('https://example.test/app/range.jsx?v=entry', `
    import /* declaration comments */ fallback, { "a,b as c" /* alias */ as quoted } from './quoted.js?v=q';
    import { "renamed value" as renamed, "quoted namespace" as ns } from './quoted-barrel.js';
    function empty() { return
      { unreachable: true };
    }
    function compact() {return<div data-value={quoted}/>}
    const literal = "import('./fake.jsx') <Fake />";
    const template = \`raw import('./fake.jsx') \${<i/>}\`;
    const nested = await import((await import('./quoted.js?v=q'), './quoted.js?v=q')${variant.file.includes('acorn') ? ',' : ''});
    const inJSX = <div>{(await import('./quoted.js?v=q')).default}</div>;
    const jsxInImport = await import((<span/>, './quoted.js?v=q'));
    export const { alpha, nested: { beta = 4 }, ...rest } = { alpha: 1, nested: {}, gamma: 3 };
    export const result = { fallback, quoted, renamed, ns, empty: empty(), view: compact(), literal, template,
      nested: nested.default, child: inJSX.children[0], jsxInImport: jsxInImport.default };
  `);
  const mod = await window.import('./range.jsx?v=entry');
  assert.equal(mod.result.quoted, 23);
  assert.equal(mod.result.fallback, 23);
  assert.equal(mod.result.renamed, 23);
  assert.equal(mod.result.ns['a,b as c'], 23);
  assert.equal(mod.result.empty, undefined);
  assert.equal(mod.result.view.tag, 'div');
  assert.equal(mod.result.literal, "import('./fake.jsx') <Fake />");
  assert.equal(mod.result.template, "raw import('./fake.jsx') [object Object]");
  assert.deepEqual([mod.result.nested, mod.result.child, mod.result.jsxInImport], [23, 23, 23]);
  sources.set('https://example.test/app/destructured-barrel.js', "export * from './range.jsx?v=entry';");
  const barrel = await window.import('./destructured-barrel.js');
  assert.deepEqual([barrel.alpha, barrel.beta, barrel.rest.gamma], [1, 4, 3]);

  const nativeCalls = [];
  window.Bundless.nativeImport = async specifier => { nativeCalls.push(specifier); return { specifier }; };
  const source = "const next = './native.mjs?v=2'; export const value = await import(next);";
  const output = await window.Bundless.transpileCode(source, 'https://example.test/app/nested/', 'route.jsx?v=1');
  await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}#${variant.file}-native`);
  assert.deepEqual(nativeCalls, ['https://example.test/app/nested/native.mjs?v=2']);
  const nativeLiteral = await window.Bundless.transpileCode("import x from './it\\'s.json';", 'https://example.test/app/', 'json.jsx');
  assert.match(nativeLiteral, /"https:\/\/example.test\/app\/it's.json"/);

  // Map the final generated positions, including rewritten imports and nested JSX.
  const mapSource = "import { value } from './no-default.js';\r\nconst view = <div>{value}</div>;\r\nexport const sentinel = (1 + 2) * 3; // 🐉\r\n";
  for (const preact of [false, true]) {
    window.Bundless.to = preact ? 'preact' : 'react';
    const outputs = await Promise.all([0, 1].map(i => window.Bundless.transpileCode(mapSource,
      'https://example.test/app/', `mapping-${i}.jsx?v=1`)));
    for (const [i, generated] of outputs.entries()) {
      assert.equal(generated.includes('sourceMappingURL='), variant.sourceMap);
      if (!variant.sourceMap) continue;
      const map = JSON.parse(Buffer.from(generated.split('base64,').at(-1), 'base64').toString());
      const { TraceMap, originalPositionFor } = await import('@jridgewell/trace-mapping');
      const trace = new TraceMap(map);
      const offset = generated.indexOf('sentinel');
      const before = generated.slice(0, offset).split('\n');
      const original = originalPositionFor(trace, { line: before.length, column: before.at(-1).length });
      assert.deepEqual(original, { source: `https://example.test/app/mapping-${i}.jsx?v=1`, line: 3, column: 13, name: null });
      const expressionOffset = generated.indexOf('(value)');
      const expressionBefore = generated.slice(0, expressionOffset + 1).split('\n');
      const expressionOriginal = originalPositionFor(trace, { line: expressionBefore.length, column: expressionBefore.at(-1).length });
      assert.equal(expressionOriginal.line, 2);
      assert.equal(expressionOriginal.column, 19);
    }
  }
  window.Bundless.to = 'react';
}

for (const variant of variants) {
  test(`${variant.file}: built artifact executes module graphs and loader invariants`, async () => {
    const { calls, sources, window } = await loadVariant(variant);
    const scriptExtension = variant.typescript ? 'tsx' : 'jsx';
    const moduleExtension = variant.typescript ? 'ts' : 'js';
    const entryOne = `https://example.test/app/entry.${scriptExtension}?v=1`;
    const entryTwo = `https://example.test/app/entry.${scriptExtension}?v=2`;
    const barrel = `https://example.test/app/barrel.${moduleExtension}?v=barrel`;
    const values = `https://example.test/app/values.${moduleExtension}?v=values`;
    const extra = `https://example.test/app/extra.${moduleExtension}?v=extra`;
    const entrySource = [
      `import { start, fallback, values, diameter } from './barrel.${moduleExtension}?v=barrel';`,
      variant.typescript ? 'const key: string = "gain";' : 'const key = "gain";',
      'export const result = await Promise.resolve(values).then(async (items) => {',
      '  let state = { gain: 0 };',
      '  for await (const value of items) { state = { ...state, [key]: state[key] + value }; }',
      '  let transitions = 0; while (transitions < 2) transitions++;',
      '  return { start, fallback, diameter, state, transitions, view: <React.Fragment><UI.Button value={state[key]} /></React.Fragment> };',
      '});',
    ].join('\n');
    sources.set(entryOne, entrySource);
    sources.set(entryTwo, entrySource);
    sources.set(barrel, [
      `export { start, default as fallback } from './values.${moduleExtension}?v=values';`,
      `export * as valuesModule from './values.${moduleExtension}?v=values';`,
      `export * from './extra.${moduleExtension}?v=extra';`,
      `import { values } from './values.${moduleExtension}?v=values';`,
      'export { values };',
    ].join('\n'));
    sources.set(values, 'export const start = 8; export const values = [1, 2, 3]; export default 13;');
    sources.set(extra, 'export const diameter = 21;');

    const first = window.import(`./entry.${scriptExtension}?v=1`);
    const concurrent = window.import(entryOne);
    assert.equal(first, concurrent);
    const firstModule = await first;
    assert.equal(await concurrent, firstModule);
    assert.deepEqual(firstModule.result.state, { gain: 6 });
    assert.equal(firstModule.result.start, 8);
    assert.equal(firstModule.result.fallback, 13);
    assert.equal(firstModule.result.diameter, 21);
    assert.equal(firstModule.result.transitions, 2);
    assert.equal(firstModule.result.view.tag, React.Fragment);
    assert.equal(firstModule.result.view.children[0].tag, UI.Button);

    const secondModule = await window.import(`./entry.${scriptExtension}?v=2`);
    assert.notEqual(secondModule, firstModule);
    assert.equal(calls.fetch.filter((url) => url === entryOne).length, 1);
    assert.equal(calls.fetch.filter((url) => url === entryTwo).length, 1);
    assert.equal(calls.fetch.filter((url) => url === values).length, 1);

    let flakyAttempts = 0;
    const flakyUrl = `https://example.test/app/flaky.${scriptExtension}?v=retry`;
    sources.set(flakyUrl, () => {
      flakyAttempts += 1;
      return flakyAttempts === 1
        ? { ok: false, statusText: 'Temporary failure' }
        : { ok: true, text: async () => 'export const recovered = true;' };
    });
    await assert.rejects(window.import(`./flaky.${scriptExtension}?v=retry`), /Failed to load/);
    assert.equal((await window.import(`./flaky.${scriptExtension}?v=retry`)).recovered, true);
    assert.equal(flakyAttempts, 2);

    const dynamicOutput = await window.Bundless.transpileCode(
      "const next = './lazy.jsx?v=lazy'; const source = import(next); const native = import('./controller.mjs?v=midi'); const mapped = import('mapped-package');",
      'https://example.test/app/',
      `dynamic.${scriptExtension}`
    );
    assert.match(dynamicOutput, /Bundless\.importFrom\(next, ["']https:\/\/example\.test\/app\/dynamic\.(?:jsx|tsx)["']\)/);
    assert.match(dynamicOutput, /Bundless\.importFrom\(['"]\.\/controller\.mjs\?v=midi['"], ["']https:\/\/example\.test\/app\/dynamic\.(?:jsx|tsx)["']\)/);
    assert.match(dynamicOutput, /import\(['"]mapped-package['"]\)/);
    assert.equal(dynamicOutput.includes('sourceMappingURL='), variant.sourceMap);
    await probeModuleSeams({ window, sources }, moduleExtension);
    if (/acorn|meriyah/.test(variant.file)) await probeASTRanges({ window, sources }, variant);
    assert.equal(calls.objectUrls.length, calls.revokedUrls.length);
  });
}
