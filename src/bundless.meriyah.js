import * as meriyah from "./../rsc/meriyah/meriyah.esm.js"; 
import { handleImports, handleScriptTag, toPreact } from './bundless.utils.js'
import { transformAST } from './bundless.utils.ast.transpiler.js';



window.Bundless = {
  transformAST,
  transpileCode,
  to: 'react',
  prod: false, 
}; 

let SMTools = {};
async function transformJSX(code, filePath) { 
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
  if (!window.Bundless.prod) { 

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
    const result = transformAST(ast, { 
      code, filePath, ...SMTools 
    });
  let { code: transpiledCode, map } = result;   
  if(window.Bundless.to === 'preact'){  
    transpiledCode = toPreact(transpiledCode);
  }
  if(window.Bundless.prod){
    return transpiledCode 
  }
  else{
    console.log('transformJSX:',  'map', result.map); 
    const sourceMapComment = `//# sourceMappingURL=data:application/json;base64,${btoa(JSON.stringify(map))}`; 
    return `${transpiledCode}\n${sourceMapComment}`; 
  } 
} 
 
async function transpileCode(code, basePath, filename) { 
  // console.log('Transpiler: Transpiling:', filename);
  const processedCode = await handleImports(code, basePath, filename);  
  // console.log('Processed code: ', processedCode);
  const transpiledCode = transformJSX(processedCode, basePath + filename);    
  return transpiledCode;
}

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
  for (let scriptTag of scriptTags) {
    await handleScriptTag(scriptTag);
  }
}); 