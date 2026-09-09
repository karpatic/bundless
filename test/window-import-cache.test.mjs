import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { init as initModuleLexer, parse as parseModuleSyntax } from 'es-module-lexer';

await initModuleLexer;

const sourceWithImport = await readFile(new URL('../src/bundless.utils.js', import.meta.url), 'utf8');
const source = sourceWithImport.replace(
  /\nimport \{ init as initModuleLexer, parse as parseModuleSyntax \} from "es-module-lexer";\s*/,
  '\n'
);
const executableSource = source.replace(
  /\nexport \{[^}]+\};\s*$/,
  '\nreturn { handleImports, handleScriptTag, toPreact };'
);

if (executableSource === source) {
  throw new Error('Unable to load bundless.utils.js test harness.');
}

function createHarness({
  href = 'https://example.test/app/index.html',
  fetchImpl,
  transpileImpl,
} = {}) {
  const calls = {
    fetch: [],
    transpile: [],
    objectUrls: [],
    revokedUrls: [],
  };

  class TestBlob {
    constructor(parts) {
      this.source = parts.map(String).join('');
    }
  }

  class TestURL extends URL {}
  TestURL.createObjectURL = (blob) => {
    const url = `data:text/javascript;base64,${Buffer.from(blob.source).toString('base64')}#blob-${calls.objectUrls.length}`;
    calls.objectUrls.push(url);
    return url;
  };
  TestURL.revokeObjectURL = (url) => {
    calls.revokedUrls.push(url);
  };

  const window = {
    Bundless: {
      cache: true,
      transpileCode: async (...args) => {
        calls.transpile.push(args);
        if (transpileImpl) {
          return transpileImpl(...args);
        }
        return `export const loadedFrom = ${JSON.stringify(args[1] + args[2])};`;
      },
      transformModuleSyntax: async (code) => code,
    },
  };

  const document = {
    querySelector: () => null,
    createElement: () => ({}),
    body: {
      appendChild: () => {},
    },
  };
  const location = { href };
  const fetch = async (url) => {
    calls.fetch.push(url);
    if (fetchImpl) {
      return fetchImpl(url);
    }
    return {
      ok: true,
      text: async () => `export const source = ${JSON.stringify(url)};`,
    };
  };
  const testConsole = {
    error: () => {},
    log: () => {},
    warn: () => {},
    warning: () => {},
  };

  const install = new Function(
    'window',
    'document',
    'location',
    'fetch',
    'Blob',
    'URL',
    'console',
    'initModuleLexer',
    'parseModuleSyntax',
    executableSource
  );
  const exports = install(
    window,
    document,
    location,
    fetch,
    TestBlob,
    TestURL,
    testConsole,
    Promise.resolve(),
    parseModuleSyntax
  );

  return { ...exports, calls, window };
}

test('window.import shares one promise and module for the same normalized URL', async () => {
  let transpileCount = 0;
  const { calls, window } = createHarness({
    transpileImpl: () => `export const transpileCount = ${++transpileCount};`,
  });

  const relativeImport = window.import('./shared.js');
  const absoluteImport = window.import('https://example.test/app/shared.js');
  assert.equal(relativeImport, absoluteImport);

  const [relativeModule, absoluteModule] = await Promise.all([relativeImport, absoluteImport]);
  assert.equal(relativeModule, absoluteModule);
  assert.equal(relativeModule.transpileCount, 1);
  assert.deepEqual(calls.fetch, ['https://example.test/app/shared.js']);
  assert.equal(calls.transpile.length, 1);
  assert.equal(calls.objectUrls.length, 1);
  assert.equal(calls.revokedUrls.length, 1);

  const repeatedImport = window.import('/app/shared.js');
  assert.equal(repeatedImport, relativeImport);
  assert.equal(await repeatedImport, relativeModule);
  assert.equal(calls.fetch.length, 1);
});

test('window.import evicts failed imports so the next call retries', async () => {
  let fetchCount = 0;
  const { calls, window } = createHarness({
    fetchImpl: async () => {
      fetchCount += 1;
      if (fetchCount === 1) {
        return { ok: false, statusText: 'nope' };
      }
      return {
        ok: true,
        text: async () => 'export const ok = true;',
      };
    },
    transpileImpl: () => 'export const ok = true;',
  });

  const firstImport = window.import('./flaky.js');
  const concurrentImport = window.import('/app/flaky.js');
  assert.equal(firstImport, concurrentImport);

  await assert.rejects(firstImport, /Failed to load https:\/\/example\.test\/app\/flaky\.js/);
  assert.equal(calls.fetch.length, 1);

  const retriedImport = window.import('./flaky.js');
  assert.notEqual(retriedImport, firstImport);
  assert.equal((await retriedImport).ok, true);
  assert.equal(calls.fetch.length, 2);
  assert.equal(calls.transpile.length, 1);
});

test('window.import keeps cache-busted URLs as separate cache keys', async () => {
  const { calls, window } = createHarness({
    transpileImpl: (_code, _basePath, filename) => {
      return `export const filename = ${JSON.stringify(filename)};`;
    },
  });

  const firstBustedImport = window.import('./cacheable.js?cachebust=1');
  const secondBustedImport = window.import('./cacheable.js?cachebust=2');
  assert.notEqual(firstBustedImport, secondBustedImport);

  const [firstModule, secondModule] = await Promise.all([firstBustedImport, secondBustedImport]);
  assert.equal(firstModule.filename, 'cacheable.js?cachebust=1');
  assert.equal(secondModule.filename, 'cacheable.js?cachebust=2');
  assert.deepEqual(calls.fetch, [
    'https://example.test/app/cacheable.js?cachebust=1',
    'https://example.test/app/cacheable.js?cachebust=2',
  ]);
  assert.equal(calls.objectUrls.length, 2);

  const repeatedBustedImport = window.import('https://example.test/app/cacheable.js?cachebust=1');
  assert.equal(repeatedBustedImport, firstBustedImport);
  assert.equal(await repeatedBustedImport, firstModule);
  assert.equal(calls.fetch.length, 2);
});

test('handleImports rewrites multiline local JSX imports through window.import', async () => {
  const { handleImports } = createHarness();
  const source = [
    'import DefaultView, {',
    '  namedValue,',
    '  originalName as localName,',
    "} from './views/panel.jsx?mode=edit#section';",
    "import * as helpers from '../helpers.tsx';",
    "import './setup.js';",
  ].join('\n');

  const transformed = await handleImports(source, 'https://example.test/app/', 'entry.jsx');

  assert.match(transformed, /window\.import\("https:\/\/example\.test\/app\/views\/panel\.jsx\?mode=edit#section"\)/);
  assert.match(transformed, /const DefaultView =/);
  assert.match(transformed, /const namedValue =/);
  assert.match(transformed, /const localName =/);
  assert.match(transformed, /const helpers = await window\.import\("https:\/\/example\.test\/helpers\.tsx"\)/);
  assert.match(transformed, /await window\.import\("https:\/\/example\.test\/app\/setup\.js"\)/);
  assert.doesNotMatch(transformed, /from ['"]\.\/views\/panel\.jsx/);
});

test('handleImports preserves bare imports and routes relative dynamic imports with their caller URL', async () => {
  const { handleImports } = createHarness();
  const source = [
    "import React from 'react';",
    "import styles from './panel.css';",
    "const lazy = import('./lazy.jsx');",
    "const nativeModule = import('./native.mjs?mode=controller');",
    "const computed = import(nextModule);",
  ].join('\n');

  const transformed = await handleImports(source, 'https://example.test/app/', 'entry.jsx');

  assert.match(transformed, /import React from 'react'/);
  assert.match(transformed, /import styles from 'https:\/\/example\.test\/app\/panel\.css'/);
  assert.match(transformed, /window\.Bundless\.importFrom\('\.\/lazy\.jsx', "https:\/\/example\.test\/app\/entry\.jsx"\)/);
  assert.match(transformed, /window\.Bundless\.importFrom\('\.\/native\.mjs\?mode=controller', "https:\/\/example\.test\/app\/entry\.jsx"\)/);
  assert.match(transformed, /window\.Bundless\.importFrom\(nextModule, "https:\/\/example\.test\/app\/entry\.jsx"\)/);
});

test('importFrom routes source modules through the cache and native modules from the original caller', async () => {
  const { window } = createHarness();
  const calls = [];
  window.import = (specifier) => {
    calls.push(['custom', specifier]);
    return Promise.resolve({ specifier });
  };
  window.Bundless.nativeImport = (specifier) => {
    calls.push(['native', specifier]);
    return Promise.resolve({ specifier });
  };

  await window.Bundless.importFrom('./view.tsx?v=2', 'https://example.test/app/entry.jsx');
  await window.Bundless.importFrom('./controller.mjs?v=3', 'https://example.test/app/entry.jsx');
  await window.Bundless.importFrom('mapped-package', 'https://example.test/app/entry.jsx');

  assert.deepEqual(calls, [
    ['custom', 'https://example.test/app/view.tsx?v=2'],
    ['native', 'https://example.test/app/controller.mjs?v=3'],
    ['native', 'mapped-package'],
  ]);
});

test('window.import evaluates named, namespace, default, and star re-exports with query URLs', async () => {
  const sources = new Map([
    ['https://example.test/app/dep.js?v=opening-ramp', [
      'export const getKeyStartPlacement = 8;',
      'export const getKeyToothSupport = 13;',
      'export const getKeyToothDiameterAtRadius = 34;',
      'export default 21;',
    ].join('\n')],
    ['https://example.test/app/extra.js?v=star', 'export const starValue = 55;'],
    ['https://example.test/app/barrel.js?v=entry', [
      "export { getKeyStartPlacement, getKeyToothSupport, getKeyToothDiameterAtRadius, default as defaultPlacement } from './dep.js?v=opening-ramp';",
      "export * as placement from './dep.js?v=opening-ramp';",
      "export * from './extra.js?v=star';",
    ].join('\n')],
  ]);
  const harness = createHarness({
    fetchImpl: async (url) => ({
      ok: sources.has(url),
      statusText: sources.has(url) ? 'OK' : 'Not Found',
      text: async () => sources.get(url),
    }),
  });
  harness.window.Bundless.transpileCode = (code, basePath, filename) =>
    harness.handleImports(code, basePath, filename);

  const previousWindow = globalThis.window;
  globalThis.window = harness.window;
  try {
    const module = await harness.window.import('./barrel.js?v=entry');

    assert.equal(module.getKeyStartPlacement, 8);
    assert.equal(module.getKeyToothSupport, 13);
    assert.equal(module.getKeyToothDiameterAtRadius, 34);
    assert.equal(module.defaultPlacement, 21);
    assert.equal(module.placement.getKeyToothSupport, 13);
    assert.equal(module.starValue, 55);
    assert.deepEqual(harness.calls.fetch.sort(), [...sources.keys()].sort());
  } finally {
    globalThis.window = previousWindow;
  }
});

test('handleImports rejects caller-relative dynamic import attributes explicitly', async () => {
  const { handleImports } = createHarness();
  await assert.rejects(
    handleImports(
      "const data = import('./data.js', { with: { type: 'json' } });",
      'https://example.test/app/',
      'entry.jsx'
    ),
    /cannot route caller-relative dynamic imports with import attributes/
  );
});

test('toPreact keeps fragments as an explicit Preact binding', () => {
  const { toPreact, window } = createHarness();
  window.Bundless.to = 'preact';

  const transformed = toPreact('React.createElement(React.Fragment, null, "child")');

  assert.match(transformed, /import \{ Fragment, h, render \} from/);
  assert.match(transformed, /h\(Fragment, null, "child"\)/);
});
