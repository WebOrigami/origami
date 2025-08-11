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
  // @ts-ignore this exists despite what TypeScript thinks
  AsyncDisposableStack,
  Atomics,
  BigInt,
  BigInt64Array,
  BigUint64Array,
  Blob,
  Boolean,
  BroadcastChannel,
  Buffer,
  ByteLengthQueuingStrategy,
  CloseEvent,
  CompressionStream,
  CountQueuingStrategy,
  Crypto,
  CryptoKey,
  CustomEvent,
  DOMException,
  DataView,
  Date,
  DecompressionStream,
  // @ts-ignore this exists despite what TypeScript thinks
  DisposableStack,
  Error,
  EvalError,
  Event,
  EventTarget,
  File,
  FinalizationRegistry,
  // @ts-ignore this exists despite what TypeScript thinks
  Float16Array,
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
  // @ts-ignore this exists despite what TypeScript thinks
  Iterator,
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
  // @ts-ignore this exists despite what TypeScript thinks
  SuppressedError,
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
  // @ts-ignore this exists despite what TypeScript thinks
  URLPattern,
  URLSearchParams,
  Uint16Array,
  Uint32Array,
  Uint8Array,
  Uint8ClampedArray,
  WeakMap,
  WeakRef,
  WeakSet,
  WebAssembly,
  WebSocket,
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
  // fetch -- special case, see below
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
  fetch: fetchWrapper,
  import: importWrapper,
};

// Give access to our own custom globals as `globalThis`
Object.defineProperty(globals, "globalThis", {
  enumerable: true,
  value: globals,
});

export default globals;

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
