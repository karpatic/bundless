// transpile.js

// This transforms static import statements into dynamic import expressions
function transformStaticImportsToDynamic(importPath, importFileName, namedExports, defaultExport) {
  let dynamicImportCode = ''; 
  
  // Handle default export
  if (defaultExport) {
    dynamicImportCode += `const ${defaultExport} = await window.import('${importPath}${importFileName}').then(m => m.default); `;
  }
  
  // Handle named exports - FIXED to use window.import with full path including filename
  if (namedExports.length > 0) {
    dynamicImportCode += `const {${namedExports.join(", ")}} = await window.import('${importPath}${importFileName}'); `;
  }
  
  return dynamicImportCode;
}


// Ran On Start
async function handleScriptTag(scriptTag) {
  let jsxCode;
  if (scriptTag.src) {
    const response = await fetch(scriptTag.src);
    if (!response.ok) throw new Error(`Failed to load ${scriptTag.src}`);
    jsxCode = await response.text();
  } else {
    jsxCode = scriptTag.textContent;
  }
  const filename = scriptTag.src ? scriptTag.src.split("/").slice(-1)[0] : 'inline script'; 
  let pathTo = scriptTag.src
    ? scriptTag.src.split("/").slice(0, -1).join("/")
    : location.href.split("/").slice(0, -1).join("/");
  // add 
  if (pathTo && !filename.match(/^(http|\.|\/)/)) {
    pathTo += "/";
  } 

  const transpiledCode = await window.Bundless.transpileCode(jsxCode, pathTo, filename); 
  
  // Insert the transpiled code into a new script tag
  const script = document.createElement("script");
  script.type = "module";
  script.textContent = transpiledCode; 
  document.body.appendChild(script); 
} 

function isInImportMap(moduleName) {
  const scriptTag = document.querySelector('script[type="importmap"]');
  if (!scriptTag) return false;

  try {
    const importMap = JSON.parse(scriptTag.textContent);
    return importMap.imports && importMap.imports[moduleName];
  } catch (error) {
    console.warning("Bundless: Import map not found:", error);
    return false;
  }
}

let dynamicImportList = false; 
window.import = async function (path) {
  // Store previous value and set new one for this import
  const previousDynamicImportList = dynamicImportList;
  dynamicImportList = [];
  
  let basePath = path.split("/").slice(0, -1).join("/");
  let filename = path.split("/").slice(-1)[0];
  
  try {
    // console.log('fetching', path);
    const response = await fetch(path);
    if (!response.ok) {
      console.error(`Failed to load ${path}: ${response.statusText}`);
      throw new Error(`Failed to load ${path}`);
    }
    
    const code = await response.text(); 
    const transpiledCode = await window.Bundless.transpileCode(code, basePath+'/', filename);
    
    const blob = new Blob([transpiledCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    
    try {
      const module = await import(url);
      return module;
    } catch (error) {
      console.error(`Failed to import module from ${url}: ${error.message}`);
      
      // Add specific debugging for the destructuring error
      if (error.message.includes('Cannot destructure property')) {
        console.warn(`The module at ${path} doesn't export the expected properties. Check that all imports match their exports.`);
        // You could add code here to log the transpiled code for debugging
        // console.log("Transpiled code:", transpiledCode);
      }
      
      throw error;
    } finally {
      URL.revokeObjectURL(url); // Clean up the blob URL
    }
  } finally {
    // Always restore the previous value, even if an error occurred
    dynamicImportList = previousDynamicImportList;
  }
};


let handleImportLine = function (line, currentFilePath, fileName) {  
  line = line.replace(/\{/g, ' { ').replace(/\}/g, ' } '); // Brackets NEED spaces
  let importParts = line.trim().split(" ");
  // console.log('handleImportLine:', {currentFilePath, importParts}); 
  let importPath = importParts.at(-1).replaceAll(/['";]/g, "");

  // Gather class and variable names
  let namedExports = []; 
  let done, inBrackets, defaultExport = false; 
  let imported = importParts.map((part) => {
      part = part.trim().replaceAll(/['";]/g, "").replaceAll(",", "");
      if (done || ["import"].includes(part)) { return false; }  // Stop start and skip conditions
      if (["}", "from"].includes(part)) { done = true; return false; }
      if (part == "{") { inBrackets = true; return false; } 
      let list = dynamicImportList ? dynamicImportList : importList;
      if (list.includes(part)) { return false; }
      else { 
        list.push(part);
        if (inBrackets) { namedExports.push(part); }            // named export
        else { defaultExport = part; }                          // default export
        return part;
      }
    }).filter(Boolean); 
  if (imported.length == 0) return line;
 
  let alreadyLoaded = window[importParts[1]];
  if (alreadyLoaded) { return line; }

  const useImportMap = !line.includes("."); 
  if (useImportMap) {  const url = isInImportMap(importPath);
    if (url) { return line.replace( new RegExp(importPath + "(?!.*" + importPath + ")"), url ) } 
    else { console.log('Bundless: Import Error:', line); return line; }
  }
  
  let importFileName = importPath.split("/").slice(-1)[0];  
  importPath = importPath.split("/").slice(0, -1).join("/")+"/";

  const isRelativePath = importPath.startsWith(".");  
  if (isRelativePath) {      
    currentFilePath = currentFilePath.replace(/\/$/, "");
    let newPath = currentFilePath.split("/");
    // console.log('getPath:', newPath);
    for (let part of importPath.split("/") ) {
        if (part === "..") { if (newPath.length > 0) {
            newPath.pop();
        } } 
        else if (part !== ".") {
          newPath.push(part);
        }
    }
    
     
    // console.log('getPath:', {currentFilePath, importPath, newPath:newPath.join("/")}); 
    importPath = newPath.join("/");

  } else{ } 
  
  // check if .js
  const isJS = line.includes(".js") || line.includes(".ts");
  if (isJS) {
    let newLine = transformStaticImportsToDynamic(importPath, importFileName, namedExports, defaultExport);
    // console.log('handleImportLine: importPath:', {importPath, importFileName, newLine});
    return newLine;
  }

}

// Calls convertImports on static imports
const importList = []; 
async function handleImports(code, pathTo, filename) { 
  if (!code.includes("import")) {return code;}  
  // const commentedOut = line.trim().startsWith("//");
  // if (commentedOut) { transformedLines.push(line); return; }
  const transformedLines = code.split("\n").map(async (line) => line.trim().startsWith("import") ? handleImportLine(line, pathTo, filename) : line);
  let finalCode = (await Promise.all(transformedLines)).join("\n");
  // console.log('handleImports:', finalCode);
  return finalCode 
}

function toPreact(code){
  if(window.Bundless.to == 'preact'){
    let prefix;
    prefix = `import { h, render } from 'https://esm.sh/preact@10.5.13/es2022/preact.mjs';\n`;
    prefix += `import { useState, useEffect, useRef, useMemo } from 'https://esm.sh/preact@10.5.13/es2022/hooks.mjs';\n`; 
    code = code.replace(/React.createElement/g, "h");  
    code = code.replace(/ReactDOM.render/g, "render"); 
    code = code.replace(/React.useState/g, "useState"); 
    code = code.replace(/React.useEffect/g, "useEffect");
    code = code.replace(/React.useRef/g, "useRef");
    code = code.replace(/React.useMemo/g, "useMemo");
    code = code.replace(/React.Fragment/g, "");
    
    code = code.replace(/import React.*from ['"].*['"];?\n?/g, "");
    code = prefix + code;
  } 
  return code;
}

export {handleImports, handleScriptTag, toPreact};