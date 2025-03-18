/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.37.0.
 * Original file: /npm/lines-and-columns@1.2.4/build/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
var t={};!function(t){t.__esModule=!0,t.LinesAndColumns=void 0;var n="\n",e=function(){function t(t){this.string=t;for(var e=[0],s=0;s<t.length;)switch(t[s]){case n:s+=1,e.push(s);break;case"\r":t[s+=1]===n&&(s+=1),e.push(s);break;default:s++}this.offsets=e}return t.prototype.locationForIndex=function(t){if(t<0||t>this.string.length)return null;for(var n=0,e=this.offsets;e[n+1]<=t;)n++;return{line:n,column:t-e[n]}},t.prototype.indexForLocation=function(t){var n=t.line,e=t.column;return n<0||n>=this.offsets.length||e<0||e>this.lengthOfLine(n)?null:this.offsets[n]+e},t.prototype.lengthOfLine=function(t){var n=this.offsets[t];return(t===this.offsets.length-1?this.string.length:this.offsets[t+1])-n},t}();t.LinesAndColumns=e,t.default=e}(t);var n=t.LinesAndColumns,e=t.__esModule;export{n as LinesAndColumns,e as __esModule,t as default};
//# sourceMappingURL=/sm/16213d767e1f29f07db27ef3b4d93449232cfa345b7d4a9dccc2419393e3a3e5.map