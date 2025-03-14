// Babel.transform, .availablePlugins, .availablePresets, .registerPlugin, .registerPreset, .packages.[generator,parser,template,traverse,types]
import { handleImports } from './bundless-utils.js'

async function transpileCode(code, basePath, filename) { 
  // console.log('Transpiler: Transpiling:', code);
  const processedCode = await handleImports(code, basePath, filename);  
  // console.log('Processed code: ', processedCode);
  console.log('transpileCode...', filename);

  const transpiledCode = Babel.transform(
    processedCode, 
    { presets: ['react', ['env', { modules: false }]] }
  ).code; 

  // console.log('Transpiled code: ', transpiledCode); 
  return transpiledCode;
}
window.transpileCode = transpileCode; 

async function transpileJSX() {  
    let scriptTag = document.querySelector('script[src*="bundless.babel"]'); 
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

    const hasBabel = document.querySelector('script[src*="babel-standalone"]');
    if(hasBabel){
      processScripts(scriptTags); 
    }
    else{ 
      const babelScript = document.createElement("script");
      babelScript.src = "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.22.9/babel.min.js";
      babelScript.onload = () => processScripts(scriptTags);
      document.head.appendChild(babelScript);
    } 
}
document.addEventListener("DOMContentLoaded", async () => {
  await transpileJSX();
}); 