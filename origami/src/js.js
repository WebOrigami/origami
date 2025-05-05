/**
 * The complete set of support JavaScript globals and global-like values.
 *
 * See
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects.
 * That page lists some things like `TypedArrays` which are not globals so are
 * omitted here.
 */
export default {
  AggregateError,
  Array,
  ArrayBuffer,
  Atomics,
  BigInt,
  BigInt64Array,
  BigUint64Array,
  Boolean,
  DataView,
  Date,
  Error,
  EvalError,
  FinalizationRegistry,
  Float32Array,
  Float64Array,
  Function,
  Infinity,
  Int16Array,
  Int32Array,
  Int8Array,
  Intl,
  // @ts-ignore Iterator does exist despite what TypeScript thinks
  Iterator,
  JSON,
  Map,
  Math,
  NaN,
  Number,
  Object,
  Promise,
  Proxy,
  RangeError,
  ReferenceError,
  Reflect,
  RegExp,
  Set,
  SharedArrayBuffer,
  String,
  Symbol,
  SyntaxError,
  TypeError,
  URIError,
  Uint16Array,
  Uint32Array,
  Uint8Array,
  Uint8ClampedArray,
  WeakMap,
  WeakRef,
  WeakSet,
  decodeURI,
  decodeURIComponent,
  encodeURI,
  encodeURIComponent,
  eval,
  false: false, // treat like a global
  fetch: fetchWrapper, // special case
  globalThis,
  isFinite,
  isNaN,
  null: null, // treat like a global
  parseFloat,
  parseInt,
  true: true, // treat like a global
  undefined,
};

async function fetchWrapper(resource, options) {
  const response = await fetch(resource, options);
  return response.ok ? await response.arrayBuffer() : undefined;
}
