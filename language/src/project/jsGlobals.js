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
const globals = bindStaticMethodsForGlobals({
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
});

// Give access to our own custom globals as `globalThis`
Object.defineProperty(globals, "globalThis", {
  enumerable: true,
  value: globals,
});

async function fetchWrapper(resource, options) {
  console.warn(
    "Warning: A plain `fetch` reference will eventually call the standard JavaScript fetch() function. For Origami's fetch behavior, update your code to call Origami.fetch()."
  );
  const response = await fetch(resource, options);
  return response.ok ? await response.arrayBuffer() : undefined;
}

/**
 * @typedef {import("@weborigami/async-tree").AsyncMap} AsyncMap
 *
 * @this {AsyncMap|null|undefined}
 */
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
importWrapper.containerAsTarget = true;

/**
 * Some JavaScript globals like Promise have static methods like Promise.all
 * verify that the call target is the class. This creates an issue because the
 * Origami evaluate() function calls all functions with the evaluation context
 * -- the tree in which the code is running -- as the call target.
 *
 * This function works around the problem. If the indicated object has no static
 * methods, it's returned as is. If it does have static methods, this returns an
 * extension of the object that overrides the static methods with ones that are
 * bound to the object.
 */
function bindStaticMethods(obj) {
  if (typeof obj !== "function" && (typeof obj !== "object" || obj === null)) {
    // Something like `NaN` or `null`
    return obj;
  }

  const staticMethodDescriptors = Object.entries(
    Object.getOwnPropertyDescriptors(obj)
  )
    .filter(([key, descriptor]) => descriptor.value instanceof Function)
    .map(([key, descriptor]) => [
      key,
      {
        ...descriptor,
        value: descriptor.value.bind(obj),
      },
    ]);
  if (staticMethodDescriptors.length === 0) {
    // No static methods
    return obj;
  }

  let extended;
  if (typeof obj === "object" || !obj.prototype) {
    // A regular object or an oddball like Proxy with no prototype
    extended = Object.create(obj);
  } else {
    // A function, possibly a constructor called with or without `new`
    /** @this {any} */
    extended = function (...args) {
      const calledWithNew = this instanceof extended;
      return calledWithNew ? new obj(...args) : obj(...args);
    };
  }

  Object.defineProperties(
    extended,
    Object.fromEntries(staticMethodDescriptors)
  );

  return extended;
}

function bindStaticMethodsForGlobals(objects) {
  const entries = Object.entries(objects);
  const bound = entries.map(([key, value]) => [key, bindStaticMethods(value)]);
  return Object.fromEntries(bound);
}

export default globals;
