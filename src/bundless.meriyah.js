import * as meriyah from "./../rsc/meriyah/meriyah.esm.js";
import { handleImports, handleScriptTag, hasBundlessPrefetchScriptTags, runWhenDocumentReady, startBundlessPrefetches, toPreact } from './bundless.utils.js'
import { transformAST } from './bundless.utils.ast.transpiler.js';



window.Bundless = {
  ...window.Bundless,
  transformAST,
  transformModuleSyntax,
  transpileCode,
  cache: true,
  to: 'react',
  prod: false,
};

let SMTools = {};
async function transformJSX(code, filePath, includeSourceMap = true) {
  const ast = meriyah.parse(code, {
    module: true,
    jsx: true,
    webcompat: true,
    loc: true,
    ranges: true,
    raw: true,
    impliedStrict: true,
    onComment: (type, value, start, end) => {
      console.log(`Comment: ${type} - ${value} [${start}, ${end}]`);
    },
    onToken: (token) => {
      // console.log('Token:', token);
    }
  });

  // Update source mapper settings for this specific file
  if (includeSourceMap && !window.Bundless.prod) {

    const loadSourceMapTools = async () => {
      console.log('Loading Sucrase');
      const { GenMapping, maybeAddSegment, toEncodedMap } = await import('../rsc/sucrase/gen-mapping.umd.js');
      const { initSourceMapper, setActiveMapper } = await import('./bundless.utils.ast.sourecmapper.js');
      SMTools = { GenMapping, maybeAddSegment, toEncodedMap, initSourceMapper, setActiveMapper };
      return SMTools
    };
    SMTools = await loadSourceMapTools();

    console.log('~~~~ transformJSX:', 'filePath', filePath);
    const sourceMapper = SMTools.initSourceMapper({
      GenMapping: SMTools.GenMapping,
      maybeAddSegment: SMTools.maybeAddSegment,
      sourceFilename: filePath,
      sourceCode: code
    });

    SMTools.setActiveMapper(sourceMapper);
    SMTools.map = sourceMapper.map;
    SMTools.updatePosition = sourceMapper.updatePosition;
  }

  // return JSON.stringify(ast, null, 2);
  return transformAST(ast, {
    code,
    filePath,
    ...(includeSourceMap ? SMTools : {}),
  });
}

async function transformModuleSyntax(code, basePath, filename) {
  const result = await transformJSX(code, basePath + filename, false);
  return result.code;
}

async function transpileCode(code, basePath, filename) {
  const { code: compiledCode, map } = await transformJSX(code, basePath + filename);
  let transpiledCode = await handleImports(compiledCode, basePath, filename);
  if(window.Bundless.to === 'preact'){
    transpiledCode = toPreact(transpiledCode);
  }
  if(window.Bundless.prod){
    return transpiledCode;
  }
  const sourceMapComment = `//# sourceMappingURL=data:application/json;base64,${btoa(JSON.stringify(map))}`;
  return `${transpiledCode}\n${sourceMapComment}`;
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
