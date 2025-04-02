import { Tree } from "./internal.js";
import * as symbols from "./symbols.js";
import * as trailingSlash from "./trailingSlash.js";

const textDecoder = new TextDecoder();
const TypedArray = Object.getPrototypeOf(Uint8Array);

/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */

/**
 * If the given object isn't treelike, throw an exception.
 *
 * @param {any} object
 * @param {string} operation
 * @param {number} [position]
 */
export function assertIsTreelike(object, operation, position = 0) {
  let message;
  if (!object) {
    message = `${operation}: The tree argument wasn't defined.`;
  } else if (object instanceof Promise) {
    // A common mistake
    message = `${operation}: The tree argument was a Promise. Did you mean to use await?`;
  } else if (!Tree.isTreelike) {
    message = `${operation}: The tree argument wasn't a treelike object.`;
  }
  if (message) {
    const error = new TypeError(message);
    /** @type {any} */ (error).position = position;
    throw error;
  }
}

/**
 * Return the value as an object. If the value is already an object it will be
 * returned as is. If the value is a primitive, it will be wrapped in an object:
 * a string will be wrapped in a String object, a number will be wrapped in a
 * Number object, and a boolean will be wrapped in a Boolean object.
 *
 * @param {any} value
 */
export function box(value) {
  switch (typeof value) {
    case "string":
      return new String(value);
    case "number":
      return new Number(value);
    case "boolean":
      return new Boolean(value);
    default:
      return value;
  }
}

/**
 * Create an array or plain object from the given keys and values.
 *
 * If the given plain object has only sequential integer keys, return the
 * values as an array. Otherwise, create a plain object with the keys and
 * values.
 *
 * @param {any[]} keys
 * @param {any[]} values
 */
export function castArrayLike(keys, values) {
  let isArrayLike = false;

  // Need at least one key to count as an array
  if (keys.length > 0) {
    // Assume it's an array
    isArrayLike = true;
    // Then check if all the keys are sequential integers
    let expectedIndex = 0;
    for (const key of keys) {
      const index = Number(key);
      if (key === "" || isNaN(index) || index !== expectedIndex) {
        // Not array-like
        isArrayLike = false;
        break;
      }
      expectedIndex++;
    }
  }

  return isArrayLike
    ? values
    : Object.fromEntries(keys.map((key, i) => [key, values[i]]));
}

/**
 * Return the Object prototype at the root of the object's prototype chain.
 *
 * This is used by functions like isPlainObject() to handle cases where the
 * `Object` at the root prototype chain is in a different realm.
 *
 * @param {any} object
 */
export function getRealmObjectPrototype(object) {
  if (Object.getPrototypeOf(object) === null) {
    // The object has no prototype.
    return null;
  }
  let proto = object;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return proto;
}

// Names of OS-generated files that should not be enumerated
export const hiddenFileNames = [".DS_Store"];

/**
 * Return true if the object is in a packed form (or can be readily packed into
 * a form) that can be given to fs.writeFile or response.write().
 *
 * @param {any} obj
 * @returns {obj is import("../index.ts").Packed}
 */
export function isPacked(obj) {
  return (
    typeof obj === "string" ||
    obj instanceof ArrayBuffer ||
    obj instanceof ReadableStream ||
    obj instanceof String ||
    obj instanceof TypedArray
  );
}

/**
 * Return true if the object is a plain JavaScript object created by `{}`,
 * `new Object()`, or `Object.create(null)`.
 *
 * This function also considers object-like things with no prototype (like a
 * `Module`) as plain objects.
 *
 * @param {any} obj
 * @returns {obj is import("../index.ts").PlainObject}
 */
export function isPlainObject(obj) {
  // From https://stackoverflow.com/q/51722354/76472
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  // We treat object-like things with no prototype (like a Module) as plain
  // objects.
  if (Object.getPrototypeOf(obj) === null) {
    return true;
  }

  // Do we inherit directly from Object in this realm?
  return Object.getPrototypeOf(obj) === getRealmObjectPrototype(obj);
}

/**
 * Return true if the value is a primitive JavaScript value.
 *
 * @param {any} value
 */
export function isPrimitive(value) {
  // Check for null first, since typeof null === "object".
  if (value === null) {
    return true;
  }
  const type = typeof value;
  return type !== "object" && type !== "function";
}

/**
 * Return true if the object is a string or object with a non-trival `toString`
 * method.
 *
 * @param {any} obj
 * @returns {obj is import("../index.ts").StringLike}
 */
export function isStringLike(obj) {
  if (typeof obj === "string") {
    return true;
  } else if (obj?.toString === undefined) {
    return false;
  } else if (obj.toString === getRealmObjectPrototype(obj)?.toString) {
    // The stupid Object.prototype.toString implementation always returns
    // "[object Object]", so if that's the only toString method the object has,
    // we return false.
    return false;
  } else {
    return true;
  }
}

export function isUnpackable(obj) {
  return (
    isPacked(obj) && typeof (/** @type {any} */ (obj).unpack) === "function"
  );
}

/**
 * Given a path like "/foo/bar/baz", return an array of keys like ["foo/",
 * "bar/", "baz"].
 *
 * Leading slashes are ignored. Consecutive slashes will be ignored. Trailing
 * slashes are preserved.
 *
 * @param {string} pathname
 */
export function keysFromPath(pathname) {
  // Split the path at each slash
  let keys = pathname.split("/");
  if (keys[0] === "") {
    // The path begins with a slash; drop that part.
    keys.shift();
  }
  if (keys.at(-1) === "") {
    // The path ends with a slash; drop that part.
    keys.pop();
  }
  // Drop any empty keys
  keys = keys.filter((key) => key !== "");
  // Add the trailing slash back to all keys but the last
  for (let i = 0; i < keys.length - 1; i++) {
    keys[i] += "/";
  }
  // Add trailing slash to last key if path ended with a slash
  if (keys.length > 0 && trailingSlash.has(pathname)) {
    keys[keys.length - 1] += "/";
  }
  return keys;
}

/**
 * Compare two strings using [natural sort
 * order](https://en.wikipedia.org/wiki/Natural_sort_order).
 */
export const naturalOrder = new Intl.Collator(undefined, {
  numeric: true,
}).compare;

/**
 * Return a slash-separated path for the given keys.
 *
 * This takes care to avoid adding consecutive slashes if they keys themselves
 * already have trailing slashes.
 *
 * @param {string[]} keys
 */
export function pathFromKeys(keys) {
  // Ensure there's a slash between all keys. If the last key has a trailing
  // slash, leave it there.
  const normalized = keys.map((key, index) =>
    index < keys.length - 1 ? trailingSlash.add(key) : key
  );
  return normalized.join("");
}

/**
 * Apply a series of functions to a value, passing the result of each function
 * to the next one.
 *
 * @param {any} start
 * @param  {...Function} fns
 */
export async function pipeline(start, ...fns) {
  return fns.reduce(async (acc, fn) => fn(await acc), start);
}

/**
 * If the child object doesn't have a parent yet, set it to the indicated
 * parent. If the child is an AsyncTree, set the `parent` property. Otherwise,
 * set the `symbols.parent` property.
 *
 * @param {*} child
 * @param {AsyncTree|null} parent
 */
export function setParent(child, parent) {
  if (Tree.isAsyncTree(child)) {
    // Value is a subtree; set its parent to this tree.
    if (!child.parent) {
      child.parent = parent;
    }
  } else if (Object.isExtensible(child) && !child[symbols.parent]) {
    // Add parent reference as a symbol to avoid polluting the object. This
    // reference will be used if the object is later used as a tree. We set
    // `enumerable` to false even thought this makes no practical difference
    // (symbols are never enumerated) because it can provide a hint in the
    // debugger that the property is for internal use.
    Object.defineProperty(child, symbols.parent, {
      configurable: true,
      enumerable: false,
      value: parent,
      writable: true,
    });
  }
}

/**
 * Convert the given input to the plainest possible JavaScript value. This
 * helper is intended for functions that want to accept an argument from the ori
 * CLI, which could a string, a stream of data, or some other kind of JavaScript
 * object.
 *
 * If the input is a function, it will be invoked and its result will be
 * processed.
 *
 * If the input is a promise, it will be resolved and its result will be
 * processed.
 *
 * If the input is treelike, it will be converted to a plain JavaScript object,
 * recursively traversing the tree and converting all values to plain types.
 *
 * If the input is stringlike, its text will be returned.
 *
 * If the input is a ArrayBuffer or typed array, it will be interpreted as UTF-8
 * text if it does not contain unprintable characters. If it does, it will be
 * returned as a base64-encoded string.
 *
 * If the input has a custom class instance, its public properties will be
 * returned as a plain object.
 *
 * @param {any} input
 * @returns {Promise<any>}
 */
export async function toPlainValue(input) {
  if (input instanceof Function) {
    // Invoke function
    input = input();
  }
  if (input instanceof Promise) {
    // Resolve promise
    input = await input;
  }

  if (isPrimitive(input) || input instanceof Date) {
    return input;
  } else if (Tree.isTreelike(input)) {
    const mapped = await Tree.map(input, (value) => toPlainValue(value));
    return Tree.plain(mapped);
  } else if (isStringLike(input)) {
    return toString(input);
  } else if (input instanceof ArrayBuffer || input instanceof TypedArray) {
    // Try to interpret the buffer as UTF-8 text, otherwise use base64.
    const text = toString(input);
    if (text !== null) {
      return text;
    } else {
      return toBase64(input);
    }
  } else {
    // Some other kind of class instance; return its public properties.
    const plain = {};
    for (const [key, value] of Object.entries(input)) {
      plain[key] = await toPlainValue(value);
    }
    return plain;
  }
}

function toBase64(object) {
  if (typeof Buffer !== "undefined") {
    // Node.js environment
    return Buffer.from(object).toString("base64");
  } else {
    // Browser environment
    let binary = "";
    const bytes = new Uint8Array(object);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

/**
 * Return a string form of the object, handling cases not generally handled by
 * the standard JavaScript `toString()` method:
 *
 * 1. If the object is an ArrayBuffer or TypedArray, decode the array as UTF-8.
 * 2. If the object is otherwise a plain JavaScript object with the useless
 *    default toString() method, return null instead of "[object Object]". In
 *    practice, it's generally more useful to have this method fail than to
 *    return a useless string.
 * 3. If the object is a defined primitive value, return the result of
 *    String(object).
 *
 * Otherwise return null.
 *
 * @param {any} object
 * @returns {string|null}
 */
export function toString(object) {
  if (object instanceof ArrayBuffer || object instanceof TypedArray) {
    // Treat the buffer as UTF-8 text.
    const decoded = textDecoder.decode(object);
    // If the result appears to contain non-printable characters, it's probably not a string.
    // https://stackoverflow.com/a/1677660/76472
    const hasNonPrintableCharacters = /[\x00-\x08\x0E-\x1F]/.test(decoded);
    return hasNonPrintableCharacters ? null : decoded;
  } else if (isStringLike(object) || (object !== null && isPrimitive(object))) {
    return String(object);
  } else {
    return null;
  }
}
