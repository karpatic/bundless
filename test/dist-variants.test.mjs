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
    assert.equal(calls.objectUrls.length, calls.revokedUrls.length);
  });
}
