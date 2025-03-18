import { handleImports, processScripts } from './bundless.utils.js' 
import * as sucrase from 'https://cdn.jsdelivr.net/npm/sucrase@3.35.0/+esm';




function transformJSX(code, filePath) {
  // console.log('transformJSX:', {code, filePath});
  const result = sucrase.transform(
    code, {
      transforms: ['jsx', 'typescript'], 
      sourceMapOptions: { compiledFilename: 'input.js' },
      filePath: filePath
  });   


  
  const { code: transpiledCode, sourceMap } = result;   
  
  const sourceMapComment = `//# sourceMappingURL=data:application/json;base64,${btoa(JSON.stringify(sourceMap))}`;
  // console.log('transformJSX:', {sourceMap});
  return `${transpiledCode}\n${sourceMapComment}`;
}

async function transpileCode(code, basePath, filename) { 
  const processedCode = await handleImports(code, basePath, filename);  
  // console.log('transpileCode:', {basePath, filename});
  const transpiledCode = transformJSX(processedCode, basePath + filename);   
  return transpiledCode;
}

window.transpileCode = transpileCode;  

document.addEventListener("DOMContentLoaded", async () => {
  let scriptTag = document.querySelector('script[src*="bundless.sucrase"]'); 
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

  processScripts(scriptTags);
});
