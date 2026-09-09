// import "./acorn-jsx.js";
import { Parser } from "../rsc/acorn/acorn.min.mjs";
import acornJsxPlugin from "../rsc/acorn/acorn.jsx.min.mjs";
import { transformAST } from './bundless.utils.ast.transpiler.js';
import { handleImports, handleScriptTag, hasBundlessPrefetchScriptTags, runWhenDocumentReady, startBundlessPrefetches, toPreact } from './bundless.utils.js'

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
  const acornWithJsx = Parser.extend(acornJsxPlugin());
  const ast = acornWithJsx.parse(code, {
    ecmaVersion: "latest",
    sourceType: "module",
    plugins: { jsx: true },
  });

  // Update source mapper settings for this specific file
  if (includeSourceMap && !window.Bundless.prod) {

    const loadSourceMapTools = async () => {
      // console.log('Loading Acorn');
      const { GenMapping, maybeAddSegment, toEncodedMap } = await import('../rsc/sucrase/gen-mapping.umd.js');
      const { initSourceMapper, setActiveMapper } = await import('./bundless.utils.ast.sourecmapper.js');
      SMTools = { GenMapping, maybeAddSegment, toEncodedMap, initSourceMapper, setActiveMapper };
      return SMTools
    };
    SMTools = await loadSourceMapTools();

    // console.log('~~~~ transformJSX:', 'filePath', filePath);
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

  return transformAST(ast, {
    code,
    filePath,
    ...(includeSourceMap ? SMTools : {}),
  });
}

async function transformModuleSyntax(code, pathTo, filename) {
  const result = await transformJSX(code, pathTo + filename, false);
  return result.code;
}

async function transpileCode(code, pathTo, filename) {
  const { code: compiledCode, map } = await transformJSX(code, pathTo + filename);
  let transpiledCode = await handleImports(compiledCode, pathTo, filename);
  if(window.Bundless.to === 'preact'){
    transpiledCode = toPreact(transpiledCode);
  }
  if(window.Bundless.prod){
    return transpiledCode;
  }
  else{
    const sourceMapComment = `//# sourceMappingURL=data:application/json;base64,${btoa(JSON.stringify(map))}`;
    return `${transpiledCode}\n${sourceMapComment}`;
  }
}

runWhenDocumentReady(async () => {
  let scriptTag = document.querySelector('script[src*="bundless.acorn"], script[src*="bundless.babel"]');
  // console.log('Transpiler: Script Tag:', scriptTag);
  if (!scriptTag) {
    console.warn('bundless not found.');
    return;
  }

  const attrs = scriptTag.attributes;
  if (attrs.to) {
    window.Bundless.to = attrs.to.value
  }

  if (attrs.cache && attrs.cache.value === "false") {
    window.Bundless.cache = false;
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
