// Babel.transform, .availablePlugins, .availablePresets, .registerPlugin, .registerPreset, .packages.[generator,parser,template,traverse,types]
import { handleImports, handleScriptTag } from './bundless.utils.js'




window.Bundless = { 
  transpileCode,
  to: 'react',
  prod: false,
};

function transformJSX(code, filePath) {
  // console.log('transformJSX:', filePath );
  const result = Babel.transform(code, { 
    presets: ['react', ['env', { modules: false }]],
    sourceMaps: true,
    sourceFileName: filePath,
    filename: filePath,
    filenameRelative: filePath
  });
  let { code: transpiledCode, map  } = result; 
  map.file = 'input.js';
  delete map.sourcesContent;
  // delete map.sourceRoot;
  console.log('transformJSX:', map); 
  const sourceMapComment = `//# sourceMappingURL=data:application/json;base64,${btoa(JSON.stringify(map))}`; 
  return `${transpiledCode}\n${sourceMapComment}`;
}

async function transpileCode(code, pathTo, filename) { 
  const processedCode = await handleImports(code, pathTo, filename);  
  // console.log('transpileCode:', {pathTo, filename});
  const transpiledCode = transformJSX(processedCode, pathTo + filename);   
  return transpiledCode;
} 

document.addEventListener("DOMContentLoaded", async () => {
  let scriptTag = document.querySelector('script[src*="bundless.babel"]'); 
  // console.log('Transpiler: Script Tag:', scriptTag);
  if (!scriptTag) {
    console.warn('bundless not found.');
    return;
  }

  const scriptTags = document.querySelectorAll("script[type='text/jsx'], script[type='text/babel']"); 
  if (scriptTags.length === 0) {
    console.warn("No JSX scripts found.");
    return;
  }
 
  const hasBabel = document.querySelector('script[src*="babel-standalone"]');
  if(hasBabel){
    for (let scriptTag of scriptTags) {
      await handleScriptTag(scriptTag);
    }
  }
  else{ 
    const babelScript = document.createElement("script");
    babelScript.src = "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.22.9/babel.min.js";
    babelScript.onload = async () => {
      for (let scriptTag of scriptTags) {
        await handleScriptTag(scriptTag);
      }
    }
    document.head.appendChild(babelScript);
  } 
});