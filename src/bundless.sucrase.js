import { handleImports, handleScriptTag, hasBundlessPrefetchScriptTags, runWhenDocumentReady, startBundlessPrefetches, toPreact } from './bundless.utils.js'
import * as sucrase from './../rsc/sucrase/sucrase.esm.js';

window.Bundless = {
  ...window.Bundless,
  transformModuleSyntax,
  transpileCode,
  cache: true,
  to: 'react',
  prod: false,
};

function transformJSX(code, filePath, includeSourceMap = true) {
  // console.log('transformJSX:', {code, filePath});
  const result = sucrase.transform(
    code, {
      transforms: ['jsx', 'typescript'],
      ...(includeSourceMap ? { sourceMapOptions: { compiledFilename: 'input.js' } } : {}),
      filePath: filePath
  });
  return result;
}

async function transformModuleSyntax(code, basePath, filename) {
  return transformJSX(code, basePath + filename, false).code;
}

async function transpileCode(code, basePath, filename) {
  const { code: compiledCode, sourceMap } = transformJSX(code, basePath + filename);
  let transpiledCode = await handleImports(compiledCode, basePath, filename);
  if(window.Bundless.to === 'preact'){
    transpiledCode = toPreact(transpiledCode);
  }
  const sourceMapComment = `//# sourceMappingURL=data:application/json;base64,${btoa(JSON.stringify(sourceMap))}`;
  return `${transpiledCode}\n${sourceMapComment}`;
}

runWhenDocumentReady(async () => {
  let scriptTag = document.querySelector('script[src*="bundless.sucrase"]');
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
