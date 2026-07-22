import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/bundless.utils.js', import.meta.url), 'utf8');
const executableSource = source.replace(
  /\nexport \{handleImports, handleScriptTag, toPreact\};\s*$/,
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

  const install = new Function('window', 'document', 'location', 'fetch', 'Blob', 'URL', 'console', executableSource);
  const exports = install(window, document, location, fetch, TestBlob, TestURL, testConsole);

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
