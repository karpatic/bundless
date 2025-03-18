import * as meriyah from "./../rsc/meriyah/meriyah.esm.js"; 
import { handleImports, processScripts } from './bundless.utils.js'
import { transformAST } from './bundless.utils.ast.transpiler.js';



window.Bundless = {
  transformAST,
  transpileCode,
  to: 'preact'
};

function transformJSX(code) { 
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
  // return JSON.stringify(ast, null, 2);
    return transformAST(ast);
} 
 
async function transpileCode(code, basePath, filename) { 
  // console.log('Transpiler: Transpiling:', filename);
  const processedCode = await handleImports(code, basePath, filename);  
  // console.log('Processed code: ', processedCode);
  const transpiledCode = transformJSX(processedCode);    
  return transpiledCode;
}

window.transpileCode = transpileCode;

document.addEventListener("DOMContentLoaded", async () => {
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
  
  const scriptTags = document.querySelectorAll("script[type='text/jsx'], script[type='text/babel']"); 
  if (scriptTags.length === 0) {
    console.warn("No JSX scripts found.");
    return;
  }
  processScripts(scriptTags);
});