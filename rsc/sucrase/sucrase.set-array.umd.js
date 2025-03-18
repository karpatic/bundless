/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/@jridgewell/set-array@1.1.2/dist/set-array.umd.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;var e={exports:{}};!function(e){e.get=void 0,e.put=void 0,e.pop=void 0;class o{constructor(){this._indexes={__proto__:null},this.array=[]}}e.get=(e,o)=>e._indexes[o],e.put=(o,t)=>{const r=e.get(o,t);if(void 0!==r)return r;const{array:s,_indexes:p}=o;return p[t]=s.push(t)-1},e.pop=e=>{const{array:o,_indexes:t}=e;0!==o.length&&(t[o.pop()]=void 0)},e.SetArray=o,Object.defineProperty(e,"__esModule",{value:!0})}(e.exports);var o=e.exports,t=e.exports.SetArray,r=e.exports.__esModule,s=e.exports.get,p=e.exports.pop,n=e.exports.put;export{t as SetArray,r as __esModule,o as default,s as get,p as pop,n as put};
//# sourceMappingURL=/sm/b16df594754d62f3a6db1e3dd29c861ffb00473499910384e492818a29c5639a.map