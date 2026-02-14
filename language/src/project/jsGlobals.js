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
const globals = {
  AbortController,
  AbortSignal,
  AggregateError,
  Array,
  ArrayBuffer,
  Atomics,
  BigInt,
  BigInt64Array,
  BigUint64Array,
  Blob,
  Boolean,
  BroadcastChannel,
  Buffer,
  ByteLengthQueuingStrategy,
  CompressionStream,
  CountQueuingStrategy,
  Crypto,
  CryptoKey,
  CustomEvent,
  DOMException,
  DataView,
  Date,
  DecompressionStream,
  DisposableStack: globalThis.DisposableStack,
  Error,
  EvalError,
  Event,
  EventTarget,
  File,
  FinalizationRegistry,
  Float16Array: globalThis.Float16Array,
  Float32Array,
  Float64Array,
  FormData,
  Function,
  Headers,
  Infinity,
  Int16Array,
  Int32Array,
  Int8Array,
  Intl,
  Iterator: globalThis.Iterator,
  JSON,
  Map,
  Math,
  MessageChannel,
  MessageEvent,
  MessagePort,
  NaN,
  Number,
  Object,
  Performance,
  PerformanceEntry,
  PerformanceMark,
  PerformanceMeasure,
  PerformanceObserver,
  PerformanceObserverEntryList,
  PerformanceResourceTiming,
  Promise,
  Proxy,
  RangeError,
  ReadableByteStreamController,
  ReadableStream,
  ReadableStreamBYOBReader,
  ReadableStreamBYOBRequest,
  ReadableStreamDefaultController,
  ReadableStreamDefaultReader,
  ReferenceError,
  Reflect,
  RegExp,
  Request,
  Response,
  Set,
  SharedArrayBuffer,
  String,
  SubtleCrypto,
  SuppressedError: globalThis.SuppressedError,
  Symbol,
  SyntaxError,
  TextDecoder,
  TextDecoderStream,
  TextEncoder,
  TextEncoderStream,
  TransformStream,
  TransformStreamDefaultController,
  TypeError,
  URIError,
  URL,
  URLPattern: globalThis.URLPattern,
  URLSearchParams,
  Uint16Array,
  Uint32Array,
  Uint8Array,
  Uint8ClampedArray,
  WeakMap,
  WeakRef,
  WeakSet,
  WebAssembly,
  WebSocket: globalThis.WebSocket,
  WritableStream,
  WritableStreamDefaultController,
  WritableStreamDefaultWriter,
  atob,
  btoa,
  clearImmediate,
  clearInterval,
  clearTimeout,
  console,
  crypto,
  decodeURI,
  decodeURIComponent,
  encodeURI,
  encodeURIComponent,
  escape,
  eval,
  fetch,
  globalThis,
  isFinite,
  isNaN,
  parseFloat,
  parseInt,
  performance,
  process,
  queueMicrotask,
  setImmediate,
  setInterval,
  setTimeout,
  structuredClone,
  undefined,
  unescape,

  // Treat these like globals
  false: false,
  null: null,
  true: true,

  // Special cases
  import: importWrapper,
};

// Give access to our own custom globals as `globalThis`
Object.defineProperty(globals, "globalThis", {
  enumerable: true,
  value: globals,
});

/**
 * @typedef {import("@weborigami/async-tree").AsyncMap} AsyncMap
 *
 * @this {AsyncMap|null|undefined}
 */
async function importWrapper(modulePath, options = {}) {
  // Walk up parent tree looking for a FileTree or other object with a `path`
  /** @type {any} */
  let current = this;
  while (current && !("path" in current)) {
    current = current.parent;
  }
  if (!current) {
    throw new TypeError(
      "Modules can only be imported from a folder or other object with a path property.",
    );
  }
  const filePath = path.resolve(current.path, modulePath);
  return import(filePath, options);
}
importWrapper.parentAsTarget = true;

export default globals;
