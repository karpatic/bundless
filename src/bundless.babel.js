import { handleImports, analyzeModuleSyntax } from "./bundless.utils.lexer.js";
// Babel.transform, .availablePlugins, .availablePresets, .registerPlugin, .registerPreset, .packages.[generator,parser,template,traverse,types]
import { handleScriptTag, hasBundlessPrefetchScriptTags, runWhenDocumentReady, startBundlessPrefetches } from './bundless.utils.js'




window.Bundless = {
  ...window.Bundless,
  transformModuleSyntax,
  analyzeModule,
  transpileCode,
  to: 'react',
  cache: true,
  prod: false,
};

function transformJSX(code, filePath, includeSourceMap = true) {
  // console.log('transformJSX:', filePath );
  const result = Babel.transform(code, {
    presets: ['react', ['env', { modules: false }]],
    sourceMaps: includeSourceMap,
    sourceFileName: filePath,
    filename: filePath,
    filenameRelative: filePath
  });
  if (result.map) {
    result.map.file = 'input.js';
    delete result.map.sourcesContent;
  }
  return result;
}

async function transformModuleSyntax(code, pathTo, filename) {
  return transformJSX(code, pathTo + filename, false).code;
}

async function analyzeModule(code, basePath, filename) {
  return analyzeModuleSyntax(await transformModuleSyntax(code, basePath, filename), basePath + filename);
}

async function transpileCode(code, pathTo, filename) {
  const { code: compiledCode, map } = transformJSX(code, pathTo + filename);
  const transpiledCode = await handleImports(compiledCode, pathTo, filename);
  const sourceMapComment = `//# sourceMappingURL=data:application/json;base64,${btoa(JSON.stringify(map))}`;
  return `${transpiledCode}\n${sourceMapComment}`;
}

runWhenDocumentReady(async () => {
  let scriptTag = document.querySelector('script[src*="bundless.babel"]');
  // console.log('Transpiler: Script Tag:', scriptTag);
  if (!scriptTag) {
    console.warn('bundless not found.');
    return;
  }

  const hasPrefetchTags = hasBundlessPrefetchScriptTags();
  const scriptTags = document.querySelectorAll("script[type='text/jsx'], script[type='text/babel']");
  if (scriptTags.length === 0 && !hasPrefetchTags) {
    console.warn("No JSX scripts found.");
    return;
  }

  const runBundlessScripts = async () => {
    if (hasPrefetchTags) {
      startBundlessPrefetches();
    }
    for (let scriptTag of scriptTags) {
      await handleScriptTag(scriptTag);
    }
  };

  const hasBabel = document.querySelector('script[src*="babel-standalone"]');
  if(hasBabel){
    await runBundlessScripts();
  }
  else{
    const babelScript = document.createElement("script");
    babelScript.src = "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.22.9/babel.min.js";
    babelScript.onload = runBundlessScripts;
    document.head.appendChild(babelScript);
  }
});
