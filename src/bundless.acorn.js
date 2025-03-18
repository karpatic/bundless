// import "./acorn-jsx.js";
import { Parser } from "../rsc/acorn/acorn.min.mjs";
import acornJsxPlugin from "../rsc/acorn/acorn.jsx.min.mjs";
import { transformAST } from './bundless.utils.ast.transpiler.js';
import { handleImports, processScripts } from './bundless.utils.js'

window.Bundless = {
  transformAST,
  transpileCode,
  to: 'preact'
};

function transformJSX(code) {
  const acornWithJsx = Parser.extend(acornJsxPlugin()); 
  const ast = acornWithJsx.parse(code, {
    ecmaVersion: "latest",
    sourceType: "module",
    plugins: { jsx: true },
  }); 
  return transformAST(ast);
} 
 
async function transpileCode(code, pathTo, filename) {
  // console.log('Transpiler: Transpiling:', filename);
  const processedCode = await handleImports(code, pathTo, filename);  
  // console.log('Processed code: ', processedCode);
  const transpiledCode = transformJSX(processedCode);     
  return transpiledCode;
}

window.transpileCode = transpileCode;

document.addEventListener("DOMContentLoaded", async () => {
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

  const scriptTags = document.querySelectorAll("script[type='text/jsx'], script[type='text/babel']"); 
  if (scriptTags.length === 0) {
    console.warn("No JSX scripts found.");
    return;
  }
  processScripts(scriptTags);
});