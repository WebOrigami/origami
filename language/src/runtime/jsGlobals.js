import path from "node:path";

/**
 * The complete set of support JavaScript globals and global-like values.
 *
 * See
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects.
 * That page lists some things like `TypedArrays` which are not globals so are
 * omitted here.
 *
 * Also includes
 * Fetch API
 * URL API
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
  Headers,
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
  Request,
  Response,
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
  import: importWrapper, // not a function in JS but acts like one
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

/** @this {import("@weborigami/types").AsyncTree|null|undefined} */
async function importWrapper(modulePath) {
  // Walk up parent tree looking for a FileTree or other object with a `path`
  /** @type {any} */
  let current = this;
  while (current && !("path" in current)) {
    current = current.parent;
  }
  if (!current) {
    throw new TypeError(
      "Modules can only be imported from a folder or other object with a path property."
    );
  }
  const filePath = path.resolve(current.path, modulePath);
  return import(filePath);
}
