import { transformJSX } from './bundless.acorn.transpiler.js';
import { handleImports } from './bundless-utils.js'

async function transpileCode(code, basePath, filename) { 
  // console.log('Transpiler: Transpiling:', filename);
  const processedCode = await handleImports(code, basePath, filename);  
  // console.log('Processed code: ', processedCode);
  const transpiledCode = transformJSX(processedCode);   
  // console.log('Transpiled code: ', transpiledCode); 
  return transpiledCode;
}
window.transpileCode = transpileCode;

async function transpileJSX() {  
    let scriptTag = document.querySelector('script[src*="bundless.acorn"], script[src*="bundless.babel"]');
    console.log('Transpiler: Script Tag:', scriptTag);
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
} 

document.addEventListener("DOMContentLoaded", async () => {
  await transpileJSX();
});