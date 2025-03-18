/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/@jridgewell/sourcemap-codec@1.4.15/dist/sourcemap-codec.umd.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
var t="undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},r=[],e=[],n="undefined"!=typeof Uint8Array?Uint8Array:Array,o=!1;function i(){o=!0;for(var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",n=0;n<64;++n)r[n]=t[n],e[t.charCodeAt(n)]=n;e["-".charCodeAt(0)]=62,e["_".charCodeAt(0)]=63}function f(t,e,n){for(var o,i,f=[],u=e;u<n;u+=3)o=(t[u]<<16)+(t[u+1]<<8)+t[u+2],f.push(r[(i=o)>>18&63]+r[i>>12&63]+r[i>>6&63]+r[63&i]);return f.join("")}function u(t){var e;o||i();for(var n=t.length,u=n%3,s="",h=[],a=16383,c=0,l=n-u;c<l;c+=a)h.push(f(t,c,c+a>l?l:c+a));return 1===u?(e=t[n-1],s+=r[e>>2],s+=r[e<<4&63],s+="=="):2===u&&(e=(t[n-2]<<8)+t[n-1],s+=r[e>>10],s+=r[e>>4&63],s+=r[e<<2&63],s+="="),h.push(s),h.join("")}function s(t,r,e,n,o){var i,f,u=8*o-n-1,s=(1<<u)-1,h=s>>1,a=-7,c=e?o-1:0,l=e?-1:1,p=t[r+c];for(c+=l,i=p&(1<<-a)-1,p>>=-a,a+=u;a>0;i=256*i+t[r+c],c+=l,a-=8);for(f=i&(1<<-a)-1,i>>=-a,a+=n;a>0;f=256*f+t[r+c],c+=l,a-=8);if(0===i)i=1-h;else{if(i===s)return f?NaN:1/0*(p?-1:1);f+=Math.pow(2,n),i-=h}return(p?-1:1)*f*Math.pow(2,i-n)}function h(t,r,e,n,o,i){var f,u,s,h=8*i-o-1,a=(1<<h)-1,c=a>>1,l=23===o?Math.pow(2,-24)-Math.pow(2,-77):0,p=n?0:i-1,g=n?1:-1,y=r<0||0===r&&1/r<0?1:0;for(r=Math.abs(r),isNaN(r)||r===1/0?(u=isNaN(r)?1:0,f=a):(f=Math.floor(Math.log(r)/Math.LN2),r*(s=Math.pow(2,-f))<1&&(f--,s*=2),(r+=f+c>=1?l/s:l*Math.pow(2,1-c))*s>=2&&(f++,s/=2),f+c>=a?(u=0,f=a):f+c>=1?(u=(r*s-1)*Math.pow(2,o),f+=c):(u=r*Math.pow(2,c-1)*Math.pow(2,o),f=0));o>=8;t[e+p]=255&u,p+=g,u/=256,o-=8);for(f=f<<o|u,h+=o;h>0;t[e+p]=255&f,p+=g,f/=256,h-=8);t[e+p-g]|=128*y}var a={}.toString,c=Array.isArray||function(t){return"[object Array]"==a.call(t)};function l(){return g.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function p(t,r){if(l()<r)throw new RangeError("Invalid typed array length");return g.TYPED_ARRAY_SUPPORT?(t=new Uint8Array(r)).__proto__=g.prototype:(null===t&&(t=new g(r)),t.length=r),t}function g(t,r,e){if(!(g.TYPED_ARRAY_SUPPORT||this instanceof g))return new g(t,r,e);if("number"==typeof t){if("string"==typeof r)throw new Error("If encoding is specified then the first argument must be a string");return w(this,t)}return y(this,t,r,e)}function y(t,r,e,n){if("number"==typeof r)throw new TypeError('"value" argument must not be a number');return"undefined"!=typeof ArrayBuffer&&r instanceof ArrayBuffer?function(t,r,e,n){if(r.byteLength,e<0||r.byteLength<e)throw new RangeError("'offset' is out of bounds");if(r.byteLength<e+(n||0))throw new RangeError("'length' is out of bounds");r=void 0===e&&void 0===n?new Uint8Array(r):void 0===n?new Uint8Array(r,e):new Uint8Array(r,e,n);g.TYPED_ARRAY_SUPPORT?(t=r).__proto__=g.prototype:t=v(t,r);return t}(t,r,e,n):"string"==typeof r?function(t,r,e){"string"==typeof e&&""!==e||(e="utf8");if(!g.isEncoding(e))throw new TypeError('"encoding" must be a valid string encoding');var n=0|b(r,e);t=p(t,n);var o=t.write(r,e);o!==n&&(t=t.slice(0,o));return t}(t,r,e):function(t,r){if(E(r)){var e=0|A(r.length);return 0===(t=p(t,e)).length||r.copy(t,0,0,e),t}if(r){if("undefined"!=typeof ArrayBuffer&&r.buffer instanceof ArrayBuffer||"length"in r)return"number"!=typeof r.length||(n=r.length)!=n?p(t,0):v(t,r);if("Buffer"===r.type&&c(r.data))return v(t,r.data)}var n;throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}(t,r)}function d(t){if("number"!=typeof t)throw new TypeError('"size" argument must be a number');if(t<0)throw new RangeError('"size" argument must not be negative')}function w(t,r){if(d(r),t=p(t,r<0?0:0|A(r)),!g.TYPED_ARRAY_SUPPORT)for(var e=0;e<r;++e)t[e]=0;return t}function v(t,r){var e=r.length<0?0:0|A(r.length);t=p(t,e);for(var n=0;n<e;n+=1)t[n]=255&r[n];return t}function A(t){if(t>=l())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+l().toString(16)+" bytes");return 0|t}function E(t){return!(null==t||!t._isBuffer)}function b(t,r){if(E(t))return t.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(t)||t instanceof ArrayBuffer))return t.byteLength;"string"!=typeof t&&(t=""+t);var e=t.length;if(0===e)return 0;for(var n=!1;;)switch(r){case"ascii":case"latin1":case"binary":return e;case"utf8":case"utf-8":case void 0:return G(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*e;case"hex":return e>>>1;case"base64":return H(t).length;default:if(n)return G(t).length;r=(""+r).toLowerCase(),n=!0}}function R(t,r,e){var n=!1;if((void 0===r||r<0)&&(r=0),r>this.length)return"";if((void 0===e||e>this.length)&&(e=this.length),e<=0)return"";if((e>>>=0)<=(r>>>=0))return"";for(t||(t="utf8");;)switch(t){case"hex":return D(this,r,e);case"utf8":case"utf-8":return O(this,r,e);case"ascii":return M(this,r,e);case"latin1":case"binary":return x(this,r,e);case"base64":return C(this,r,e);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return k(this,r,e);default:if(n)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),n=!0}}function m(t,r,e){var n=t[r];t[r]=t[e],t[e]=n}function _(t,r,e,n,o){if(0===t.length)return-1;if("string"==typeof e?(n=e,e=0):e>2147483647?e=2147483647:e<-2147483648&&(e=-2147483648),e=+e,isNaN(e)&&(e=o?0:t.length-1),e<0&&(e=t.length+e),e>=t.length){if(o)return-1;e=t.length-1}else if(e<0){if(!o)return-1;e=0}if("string"==typeof r&&(r=g.from(r,n)),E(r))return 0===r.length?-1:P(t,r,e,n,o);if("number"==typeof r)return r&=255,g.TYPED_ARRAY_SUPPORT&&"function"==typeof Uint8Array.prototype.indexOf?o?Uint8Array.prototype.indexOf.call(t,r,e):Uint8Array.prototype.lastIndexOf.call(t,r,e):P(t,[r],e,n,o);throw new TypeError("val must be string, number or Buffer")}function P(t,r,e,n,o){var i,f=1,u=t.length,s=r.length;if(void 0!==n&&("ucs2"===(n=String(n).toLowerCase())||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(t.length<2||r.length<2)return-1;f=2,u/=2,s/=2,e/=2}function h(t,r){return 1===f?t[r]:t.readUInt16BE(r*f)}if(o){var a=-1;for(i=e;i<u;i++)if(h(t,i)===h(r,-1===a?0:i-a)){if(-1===a&&(a=i),i-a+1===s)return a*f}else-1!==a&&(i-=i-a),a=-1}else for(e+s>u&&(e=u-s),i=e;i>=0;i--){for(var c=!0,l=0;l<s;l++)if(h(t,i+l)!==h(r,l)){c=!1;break}if(c)return i}return-1}function T(t,r,e,n){e=Number(e)||0;var o=t.length-e;n?(n=Number(n))>o&&(n=o):n=o;var i=r.length;if(i%2!=0)throw new TypeError("Invalid hex string");n>i/2&&(n=i/2);for(var f=0;f<n;++f){var u=parseInt(r.substr(2*f,2),16);if(isNaN(u))return f;t[e+f]=u}return f}function U(t,r,e,n){return K(G(r,t.length-e),t,e,n)}function B(t,r,e,n){return K(function(t){for(var r=[],e=0;e<t.length;++e)r.push(255&t.charCodeAt(e));return r}(r),t,e,n)}function S(t,r,e,n){return B(t,r,e,n)}function Y(t,r,e,n){return K(H(r),t,e,n)}function I(t,r,e,n){return K(function(t,r){for(var e,n,o,i=[],f=0;f<t.length&&!((r-=2)<0);++f)n=(e=t.charCodeAt(f))>>8,o=e%256,i.push(o),i.push(n);return i}(r,t.length-e),t,e,n)}function C(t,r,e){return 0===r&&e===t.length?u(t):u(t.slice(r,e))}function O(t,r,e){e=Math.min(t.length,e);for(var n=[],o=r;o<e;){var i,f,u,s,h=t[o],a=null,c=h>239?4:h>223?3:h>191?2:1;if(o+c<=e)switch(c){case 1:h<128&&(a=h);break;case 2:128==(192&(i=t[o+1]))&&(s=(31&h)<<6|63&i)>127&&(a=s);break;case 3:i=t[o+1],f=t[o+2],128==(192&i)&&128==(192&f)&&(s=(15&h)<<12|(63&i)<<6|63&f)>2047&&(s<55296||s>57343)&&(a=s);break;case 4:i=t[o+1],f=t[o+2],u=t[o+3],128==(192&i)&&128==(192&f)&&128==(192&u)&&(s=(15&h)<<18|(63&i)<<12|(63&f)<<6|63&u)>65535&&s<1114112&&(a=s)}null===a?(a=65533,c=1):a>65535&&(a-=65536,n.push(a>>>10&1023|55296),a=56320|1023&a),n.push(a),o+=c}return function(t){var r=t.length;if(r<=L)return String.fromCharCode.apply(String,t);var e="",n=0;for(;n<r;)e+=String.fromCharCode.apply(String,t.slice(n,n+=L));return e}(n)}g.TYPED_ARRAY_SUPPORT=void 0===t.TYPED_ARRAY_SUPPORT||t.TYPED_ARRAY_SUPPORT,l(),g.poolSize=8192,g._augment=function(t){return t.__proto__=g.prototype,t},g.from=function(t,r,e){return y(null,t,r,e)},g.TYPED_ARRAY_SUPPORT&&(g.prototype.__proto__=Uint8Array.prototype,g.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&g[Symbol.species]),g.alloc=function(t,r,e){return function(t,r,e,n){return d(r),r<=0?p(t,r):void 0!==e?"string"==typeof n?p(t,r).fill(e,n):p(t,r).fill(e):p(t,r)}(null,t,r,e)},g.allocUnsafe=function(t){return w(null,t)},g.allocUnsafeSlow=function(t){return w(null,t)},g.isBuffer=function(t){return null!=t&&(!!t._isBuffer||Q(t)||function(t){return"function"==typeof t.readFloatLE&&"function"==typeof t.slice&&Q(t.slice(0,0))}(t))},g.compare=function(t,r){if(!E(t)||!E(r))throw new TypeError("Arguments must be Buffers");if(t===r)return 0;for(var e=t.length,n=r.length,o=0,i=Math.min(e,n);o<i;++o)if(t[o]!==r[o]){e=t[o],n=r[o];break}return e<n?-1:n<e?1:0},g.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},g.concat=function(t,r){if(!c(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return g.alloc(0);var e;if(void 0===r)for(r=0,e=0;e<t.length;++e)r+=t[e].length;var n=g.allocUnsafe(r),o=0;for(e=0;e<t.length;++e){var i=t[e];if(!E(i))throw new TypeError('"list" argument must be an Array of Buffers');i.copy(n,o),o+=i.length}return n},g.byteLength=b,g.prototype._isBuffer=!0,g.prototype.swap16=function(){var t=this.length;if(t%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var r=0;r<t;r+=2)m(this,r,r+1);return this},g.prototype.swap32=function(){var t=this.length;if(t%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var r=0;r<t;r+=4)m(this,r,r+3),m(this,r+1,r+2);return this},g.prototype.swap64=function(){var t=this.length;if(t%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var r=0;r<t;r+=8)m(this,r,r+7),m(this,r+1,r+6),m(this,r+2,r+5),m(this,r+3,r+4);return this},g.prototype.toString=function(){var t=0|this.length;return 0===t?"":0===arguments.length?O(this,0,t):R.apply(this,arguments)},g.prototype.equals=function(t){if(!E(t))throw new TypeError("Argument must be a Buffer");return this===t||0===g.compare(this,t)},g.prototype.inspect=function(){var t="";return this.length>0&&(t=this.toString("hex",0,50).match(/.{2}/g).join(" "),this.length>50&&(t+=" ... ")),"<Buffer "+t+">"},g.prototype.compare=function(t,r,e,n,o){if(!E(t))throw new TypeError("Argument must be a Buffer");if(void 0===r&&(r=0),void 0===e&&(e=t?t.length:0),void 0===n&&(n=0),void 0===o&&(o=this.length),r<0||e>t.length||n<0||o>this.length)throw new RangeError("out of range index");if(n>=o&&r>=e)return 0;if(n>=o)return-1;if(r>=e)return 1;if(this===t)return 0;for(var i=(o>>>=0)-(n>>>=0),f=(e>>>=0)-(r>>>=0),u=Math.min(i,f),s=this.slice(n,o),h=t.slice(r,e),a=0;a<u;++a)if(s[a]!==h[a]){i=s[a],f=h[a];break}return i<f?-1:f<i?1:0},g.prototype.includes=function(t,r,e){return-1!==this.indexOf(t,r,e)},g.prototype.indexOf=function(t,r,e){return _(this,t,r,e,!0)},g.prototype.lastIndexOf=function(t,r,e){return _(this,t,r,e,!1)},g.prototype.write=function(t,r,e,n){if(void 0===r)n="utf8",e=this.length,r=0;else if(void 0===e&&"string"==typeof r)n=r,e=this.length,r=0;else{if(!isFinite(r))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");r|=0,isFinite(e)?(e|=0,void 0===n&&(n="utf8")):(n=e,e=void 0)}var o=this.length-r;if((void 0===e||e>o)&&(e=o),t.length>0&&(e<0||r<0)||r>this.length)throw new RangeError("Attempt to write outside buffer bounds");n||(n="utf8");for(var i=!1;;)switch(n){case"hex":return T(this,t,r,e);case"utf8":case"utf-8":return U(this,t,r,e);case"ascii":return B(this,t,r,e);case"latin1":case"binary":return S(this,t,r,e);case"base64":return Y(this,t,r,e);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return I(this,t,r,e);default:if(i)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),i=!0}},g.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var L=4096;function M(t,r,e){var n="";e=Math.min(t.length,e);for(var o=r;o<e;++o)n+=String.fromCharCode(127&t[o]);return n}function x(t,r,e){var n="";e=Math.min(t.length,e);for(var o=r;o<e;++o)n+=String.fromCharCode(t[o]);return n}function D(t,r,e){var n=t.length;(!r||r<0)&&(r=0),(!e||e<0||e>n)&&(e=n);for(var o="",i=r;i<e;++i)o+=Z(t[i]);return o}function k(t,r,e){for(var n=t.slice(r,e),o="",i=0;i<n.length;i+=2)o+=String.fromCharCode(n[i]+256*n[i+1]);return o}function N(t,r,e){if(t%1!=0||t<0)throw new RangeError("offset is not uint");if(t+r>e)throw new RangeError("Trying to access beyond buffer length")}function z(t,r,e,n,o,i){if(!E(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>o||r<i)throw new RangeError('"value" argument is out of bounds');if(e+n>t.length)throw new RangeError("Index out of range")}function F(t,r,e,n){r<0&&(r=65535+r+1);for(var o=0,i=Math.min(t.length-e,2);o<i;++o)t[e+o]=(r&255<<8*(n?o:1-o))>>>8*(n?o:1-o)}function j(t,r,e,n){r<0&&(r=4294967295+r+1);for(var o=0,i=Math.min(t.length-e,4);o<i;++o)t[e+o]=r>>>8*(n?o:3-o)&255}function V(t,r,e,n,o,i){if(e+n>t.length)throw new RangeError("Index out of range");if(e<0)throw new RangeError("Index out of range")}function q(t,r,e,n,o){return o||V(t,0,e,4),h(t,r,e,n,23,4),e+4}function J(t,r,e,n,o){return o||V(t,0,e,8),h(t,r,e,n,52,8),e+8}g.prototype.slice=function(t,r){var e,n=this.length;if((t=~~t)<0?(t+=n)<0&&(t=0):t>n&&(t=n),(r=void 0===r?n:~~r)<0?(r+=n)<0&&(r=0):r>n&&(r=n),r<t&&(r=t),g.TYPED_ARRAY_SUPPORT)(e=this.subarray(t,r)).__proto__=g.prototype;else{var o=r-t;e=new g(o,void 0);for(var i=0;i<o;++i)e[i]=this[i+t]}return e},g.prototype.readUIntLE=function(t,r,e){t|=0,r|=0,e||N(t,r,this.length);for(var n=this[t],o=1,i=0;++i<r&&(o*=256);)n+=this[t+i]*o;return n},g.prototype.readUIntBE=function(t,r,e){t|=0,r|=0,e||N(t,r,this.length);for(var n=this[t+--r],o=1;r>0&&(o*=256);)n+=this[t+--r]*o;return n},g.prototype.readUInt8=function(t,r){return r||N(t,1,this.length),this[t]},g.prototype.readUInt16LE=function(t,r){return r||N(t,2,this.length),this[t]|this[t+1]<<8},g.prototype.readUInt16BE=function(t,r){return r||N(t,2,this.length),this[t]<<8|this[t+1]},g.prototype.readUInt32LE=function(t,r){return r||N(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},g.prototype.readUInt32BE=function(t,r){return r||N(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},g.prototype.readIntLE=function(t,r,e){t|=0,r|=0,e||N(t,r,this.length);for(var n=this[t],o=1,i=0;++i<r&&(o*=256);)n+=this[t+i]*o;return n>=(o*=128)&&(n-=Math.pow(2,8*r)),n},g.prototype.readIntBE=function(t,r,e){t|=0,r|=0,e||N(t,r,this.length);for(var n=r,o=1,i=this[t+--n];n>0&&(o*=256);)i+=this[t+--n]*o;return i>=(o*=128)&&(i-=Math.pow(2,8*r)),i},g.prototype.readInt8=function(t,r){return r||N(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},g.prototype.readInt16LE=function(t,r){r||N(t,2,this.length);var e=this[t]|this[t+1]<<8;return 32768&e?4294901760|e:e},g.prototype.readInt16BE=function(t,r){r||N(t,2,this.length);var e=this[t+1]|this[t]<<8;return 32768&e?4294901760|e:e},g.prototype.readInt32LE=function(t,r){return r||N(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},g.prototype.readInt32BE=function(t,r){return r||N(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},g.prototype.readFloatLE=function(t,r){return r||N(t,4,this.length),s(this,t,!0,23,4)},g.prototype.readFloatBE=function(t,r){return r||N(t,4,this.length),s(this,t,!1,23,4)},g.prototype.readDoubleLE=function(t,r){return r||N(t,8,this.length),s(this,t,!0,52,8)},g.prototype.readDoubleBE=function(t,r){return r||N(t,8,this.length),s(this,t,!1,52,8)},g.prototype.writeUIntLE=function(t,r,e,n){(t=+t,r|=0,e|=0,n)||z(this,t,r,e,Math.pow(2,8*e)-1,0);var o=1,i=0;for(this[r]=255&t;++i<e&&(o*=256);)this[r+i]=t/o&255;return r+e},g.prototype.writeUIntBE=function(t,r,e,n){(t=+t,r|=0,e|=0,n)||z(this,t,r,e,Math.pow(2,8*e)-1,0);var o=e-1,i=1;for(this[r+o]=255&t;--o>=0&&(i*=256);)this[r+o]=t/i&255;return r+e},g.prototype.writeUInt8=function(t,r,e){return t=+t,r|=0,e||z(this,t,r,1,255,0),g.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),this[r]=255&t,r+1},g.prototype.writeUInt16LE=function(t,r,e){return t=+t,r|=0,e||z(this,t,r,2,65535,0),g.TYPED_ARRAY_SUPPORT?(this[r]=255&t,this[r+1]=t>>>8):F(this,t,r,!0),r+2},g.prototype.writeUInt16BE=function(t,r,e){return t=+t,r|=0,e||z(this,t,r,2,65535,0),g.TYPED_ARRAY_SUPPORT?(this[r]=t>>>8,this[r+1]=255&t):F(this,t,r,!1),r+2},g.prototype.writeUInt32LE=function(t,r,e){return t=+t,r|=0,e||z(this,t,r,4,4294967295,0),g.TYPED_ARRAY_SUPPORT?(this[r+3]=t>>>24,this[r+2]=t>>>16,this[r+1]=t>>>8,this[r]=255&t):j(this,t,r,!0),r+4},g.prototype.writeUInt32BE=function(t,r,e){return t=+t,r|=0,e||z(this,t,r,4,4294967295,0),g.TYPED_ARRAY_SUPPORT?(this[r]=t>>>24,this[r+1]=t>>>16,this[r+2]=t>>>8,this[r+3]=255&t):j(this,t,r,!1),r+4},g.prototype.writeIntLE=function(t,r,e,n){if(t=+t,r|=0,!n){var o=Math.pow(2,8*e-1);z(this,t,r,e,o-1,-o)}var i=0,f=1,u=0;for(this[r]=255&t;++i<e&&(f*=256);)t<0&&0===u&&0!==this[r+i-1]&&(u=1),this[r+i]=(t/f>>0)-u&255;return r+e},g.prototype.writeIntBE=function(t,r,e,n){if(t=+t,r|=0,!n){var o=Math.pow(2,8*e-1);z(this,t,r,e,o-1,-o)}var i=e-1,f=1,u=0;for(this[r+i]=255&t;--i>=0&&(f*=256);)t<0&&0===u&&0!==this[r+i+1]&&(u=1),this[r+i]=(t/f>>0)-u&255;return r+e},g.prototype.writeInt8=function(t,r,e){return t=+t,r|=0,e||z(this,t,r,1,127,-128),g.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),t<0&&(t=255+t+1),this[r]=255&t,r+1},g.prototype.writeInt16LE=function(t,r,e){return t=+t,r|=0,e||z(this,t,r,2,32767,-32768),g.TYPED_ARRAY_SUPPORT?(this[r]=255&t,this[r+1]=t>>>8):F(this,t,r,!0),r+2},g.prototype.writeInt16BE=function(t,r,e){return t=+t,r|=0,e||z(this,t,r,2,32767,-32768),g.TYPED_ARRAY_SUPPORT?(this[r]=t>>>8,this[r+1]=255&t):F(this,t,r,!1),r+2},g.prototype.writeInt32LE=function(t,r,e){return t=+t,r|=0,e||z(this,t,r,4,2147483647,-2147483648),g.TYPED_ARRAY_SUPPORT?(this[r]=255&t,this[r+1]=t>>>8,this[r+2]=t>>>16,this[r+3]=t>>>24):j(this,t,r,!0),r+4},g.prototype.writeInt32BE=function(t,r,e){return t=+t,r|=0,e||z(this,t,r,4,2147483647,-2147483648),t<0&&(t=4294967295+t+1),g.TYPED_ARRAY_SUPPORT?(this[r]=t>>>24,this[r+1]=t>>>16,this[r+2]=t>>>8,this[r+3]=255&t):j(this,t,r,!1),r+4},g.prototype.writeFloatLE=function(t,r,e){return q(this,t,r,!0,e)},g.prototype.writeFloatBE=function(t,r,e){return q(this,t,r,!1,e)},g.prototype.writeDoubleLE=function(t,r,e){return J(this,t,r,!0,e)},g.prototype.writeDoubleBE=function(t,r,e){return J(this,t,r,!1,e)},g.prototype.copy=function(t,r,e,n){if(e||(e=0),n||0===n||(n=this.length),r>=t.length&&(r=t.length),r||(r=0),n>0&&n<e&&(n=e),n===e)return 0;if(0===t.length||0===this.length)return 0;if(r<0)throw new RangeError("targetStart out of bounds");if(e<0||e>=this.length)throw new RangeError("sourceStart out of bounds");if(n<0)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),t.length-r<n-e&&(n=t.length-r+e);var o,i=n-e;if(this===t&&e<r&&r<n)for(o=i-1;o>=0;--o)t[o+r]=this[o+e];else if(i<1e3||!g.TYPED_ARRAY_SUPPORT)for(o=0;o<i;++o)t[o+r]=this[o+e];else Uint8Array.prototype.set.call(t,this.subarray(e,e+i),r);return i},g.prototype.fill=function(t,r,e,n){if("string"==typeof t){if("string"==typeof r?(n=r,r=0,e=this.length):"string"==typeof e&&(n=e,e=this.length),1===t.length){var o=t.charCodeAt(0);o<256&&(t=o)}if(void 0!==n&&"string"!=typeof n)throw new TypeError("encoding must be a string");if("string"==typeof n&&!g.isEncoding(n))throw new TypeError("Unknown encoding: "+n)}else"number"==typeof t&&(t&=255);if(r<0||this.length<r||this.length<e)throw new RangeError("Out of range index");if(e<=r)return this;var i;if(r>>>=0,e=void 0===e?this.length:e>>>0,t||(t=0),"number"==typeof t)for(i=r;i<e;++i)this[i]=t;else{var f=E(t)?t:G(new g(t,n).toString()),u=f.length;for(i=0;i<e-r;++i)this[i+r]=f[i%u]}return this};var W=/[^+\/0-9A-Za-z-_]/g;function Z(t){return t<16?"0"+t.toString(16):t.toString(16)}function G(t,r){var e;r=r||1/0;for(var n=t.length,o=null,i=[],f=0;f<n;++f){if((e=t.charCodeAt(f))>55295&&e<57344){if(!o){if(e>56319){(r-=3)>-1&&i.push(239,191,189);continue}if(f+1===n){(r-=3)>-1&&i.push(239,191,189);continue}o=e;continue}if(e<56320){(r-=3)>-1&&i.push(239,191,189),o=e;continue}e=65536+(o-55296<<10|e-56320)}else o&&(r-=3)>-1&&i.push(239,191,189);if(o=null,e<128){if((r-=1)<0)break;i.push(e)}else if(e<2048){if((r-=2)<0)break;i.push(e>>6|192,63&e|128)}else if(e<65536){if((r-=3)<0)break;i.push(e>>12|224,e>>6&63|128,63&e|128)}else{if(!(e<1114112))throw new Error("Invalid code point");if((r-=4)<0)break;i.push(e>>18|240,e>>12&63|128,e>>6&63|128,63&e|128)}}return i}function H(t){return function(t){var r,f,u,s,h,a;o||i();var c=t.length;if(c%4>0)throw new Error("Invalid string. Length must be a multiple of 4");h="="===t[c-2]?2:"="===t[c-1]?1:0,a=new n(3*c/4-h),u=h>0?c-4:c;var l=0;for(r=0,f=0;r<u;r+=4,f+=3)s=e[t.charCodeAt(r)]<<18|e[t.charCodeAt(r+1)]<<12|e[t.charCodeAt(r+2)]<<6|e[t.charCodeAt(r+3)],a[l++]=s>>16&255,a[l++]=s>>8&255,a[l++]=255&s;return 2===h?(s=e[t.charCodeAt(r)]<<2|e[t.charCodeAt(r+1)]>>4,a[l++]=255&s):1===h&&(s=e[t.charCodeAt(r)]<<10|e[t.charCodeAt(r+1)]<<4|e[t.charCodeAt(r+2)]>>2,a[l++]=s>>8&255,a[l++]=255&s),a}(function(t){if((t=function(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}(t).replace(W,"")).length<2)return"";for(;t.length%4!=0;)t+="=";return t}(t))}function K(t,r,e,n){for(var o=0;o<n&&!(o+e>=r.length||o>=t.length);++o)r[o+e]=t[o];return o}function Q(t){return!!t.constructor&&"function"==typeof t.constructor.isBuffer&&t.constructor.isBuffer(t)}"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;var X={exports:{}};!function(t){const r=",".charCodeAt(0),e=";".charCodeAt(0),n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",o=new Uint8Array(64),i=new Uint8Array(128);for(let t=0;t<n.length;t++){const r=n.charCodeAt(t);o[t]=r,i[r]=t}const f="undefined"!=typeof TextDecoder?new TextDecoder:void 0!==g?{decode:t=>g.from(t.buffer,t.byteOffset,t.byteLength).toString()}:{decode(t){let r="";for(let e=0;e<t.length;e++)r+=String.fromCharCode(t[e]);return r}};function u(t){const r=new Int32Array(5),e=[];let n=0;do{const o=s(t,n),i=[];let f=!0,u=0;r[0]=0;for(let e=n;e<o;e++){let n;e=h(t,e,r,0);const s=r[0];s<u&&(f=!1),u=s,a(t,e,o)?(e=h(t,e,r,1),e=h(t,e,r,2),e=h(t,e,r,3),a(t,e,o)?(e=h(t,e,r,4),n=[s,r[1],r[2],r[3],r[4]]):n=[s,r[1],r[2],r[3]]):n=[s],i.push(n)}f||c(i),e.push(i),n=o+1}while(n<=t.length);return e}function s(t,r){const e=t.indexOf(";",r);return-1===e?t.length:e}function h(t,r,e,n){let o=0,f=0,u=0;do{const e=t.charCodeAt(r++);u=i[e],o|=(31&u)<<f,f+=5}while(32&u);const s=1&o;return o>>>=1,s&&(o=-2147483648|-o),e[n]+=o,r}function a(t,e,n){return!(e>=n)&&t.charCodeAt(e)!==r}function c(t){t.sort(l)}function l(t,r){return t[0]-r[0]}function p(t){const n=new Int32Array(5),o=16384,i=o-36,u=new Uint8Array(o),s=u.subarray(0,i);let h=0,a="";for(let c=0;c<t.length;c++){const l=t[c];if(c>0&&(h===o&&(a+=f.decode(u),h=0),u[h++]=e),0!==l.length){n[0]=0;for(let t=0;t<l.length;t++){const e=l[t];h>i&&(a+=f.decode(s),u.copyWithin(0,i,h),h-=i),t>0&&(u[h++]=r),h=y(u,h,n,e,0),1!==e.length&&(h=y(u,h,n,e,1),h=y(u,h,n,e,2),h=y(u,h,n,e,3),4!==e.length&&(h=y(u,h,n,e,4)))}}}return a+f.decode(u.subarray(0,h))}function y(t,r,e,n,i){const f=n[i];let u=f-e[i];e[i]=f,u=u<0?-u<<1|1:u<<1;do{let e=31&u;u>>>=5,u>0&&(e|=32),t[r++]=o[e]}while(u>0);return r}t.decode=u,t.encode=p,Object.defineProperty(t,"__esModule",{value:!0})}(X.exports);var $=X.exports,tt=X.exports.__esModule,rt=X.exports.decode,et=X.exports.encode;export{tt as __esModule,rt as decode,$ as default,et as encode};
//# sourceMappingURL=/sm/ab5a40dcbdbc772a4b505ff780d142ed7d85532dedc09709d98ecbdb1f3c679c.map