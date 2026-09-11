import * as meriyah from "./../rsc/meriyah/meriyah.esm.js";
import { getModuleReplacements, handleScriptTag, hasBundlessPrefetchScriptTags, runWhenDocumentReady, startBundlessPrefetches, preactImports } from './bundless.utils.js'
import { transformAST, analyzeAST } from './bundless.utils.ast.transpiler.js';



window.Bundless = {
  ...window.Bundless,
  transformAST,
  transformModuleSyntax,
  analyzeModule,
  transpileCode,
  cache: true,
  to: 'react',
  prod: false,
};

function parseAST(code) {
  return meriyah.parse(code, {
    module: true,
    jsx: true,
    webcompat: true,
    loc: true,
    ranges: true,
    raw: true,
    impliedStrict: true,
  });
}

function analyzeModule(code) {
  return analyzeAST(parseAST(code));
}

async function transformModuleSyntax(code, basePath, filename) {
  return transformAST(parseAST(code), { code }).code;
}

async function transpileCode(code, basePath, filename) {
  const ast = parseAST(code);
  const replacements = await getModuleReplacements(code, basePath, filename, analyzeAST(ast));
  let debug = {};
  if (!window.Bundless.prod) {
    const { GenMapping, maybeAddSegment, toEncodedMap } = await import('../rsc/sucrase/gen-mapping.umd.js');
    const { initSourceMapper } = await import('./bundless.utils.ast.sourecmapper.js');
    debug = { ...initSourceMapper({ GenMapping, maybeAddSegment, sourceFilename: basePath + filename, sourceCode: code }), toEncodedMap };
  }
  const preact = window.Bundless.to === 'preact';
  const result = transformAST(ast, { code, replacements, preact, prefix: preact ? preactImports : '', ...debug });
  const transpiledCode = result.code;
  if (window.Bundless.prod) return transpiledCode;
  return `${transpiledCode}\n//# sourceMappingURL=data:application/json;base64,${btoa(JSON.stringify(result.map))}`;
}

runWhenDocumentReady(async () => {
  let scriptTag = document.querySelector('script[src*="bundless.meriyah"], script[src*="bundless.babel"]');
  // console.log('Transpiler: Script Tag:', scriptTag);
  if (!scriptTag) {
    console.warn('bundless not found.');
    return;
  }
  const attrs = scriptTag.attributes;
  if (attrs.to) {
    window.Bundless.to = attrs.to.value
  }

  const hasPrefetchTags = hasBundlessPrefetchScriptTags();
  if (hasPrefetchTags) {
    startBundlessPrefetches();
  }

  const scriptTags = document.querySelectorAll("script[type='text/jsx'], script[type='text/babel']");
  if (scriptTags.length === 0) {
    if (!hasPrefetchTags) {
      console.warn("No JSX scripts found.");
    }
    return;
  }
  for (let scriptTag of scriptTags) {
    await handleScriptTag(scriptTag);
  }
});
