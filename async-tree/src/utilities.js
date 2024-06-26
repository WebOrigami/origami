import { Tree } from "./internal.js";

const textDecoder = new TextDecoder();
const TypedArray = Object.getPrototypeOf(Uint8Array);

/**
 * If the given plain object has only sequential integer keys, return it as an
 * array. Otherwise return it as is.
 *
 * @param {any} object
 */
export function castArrayLike(object) {
  let hasKeys = false;
  let expectedIndex = 0;
  for (const key in object) {
    hasKeys = true;
    const index = Number(key);
    if (key === "" || isNaN(index) || index !== expectedIndex) {
      // Not an array-like object.
      return object;
    }
    expectedIndex++;
  }
  return hasKeys ? Object.values(object) : object;
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
 * @param {any} object
 * @returns {object is import("../index.ts").Packed}
 */
export function isPacked(object) {
  return (
    typeof object === "string" ||
    object instanceof ArrayBuffer ||
    object instanceof ReadableStream ||
    object instanceof String ||
    object instanceof TypedArray
  );
}

/**
 * Return true if the object is a plain JavaScript object created by `{}`,
 * `new Object()`, or `Object.create(null)`.
 *
 * This function also considers object-like things with no prototype (like a
 * `Module`) as plain objects.
 *
 * @param {any} object
 * @returns {object is import("../index.ts").PlainObject}
 */
export function isPlainObject(object) {
  // From https://stackoverflow.com/q/51722354/76472
  if (typeof object !== "object" || object === null) {
    return false;
  }

  // We treat object-like things with no prototype (like a Module) as plain
  // objects.
  if (Object.getPrototypeOf(object) === null) {
    return true;
  }

  // Do we inherit directly from Object in this realm?
  return Object.getPrototypeOf(object) === getRealmObjectPrototype(object);
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
 * @param {any} object
 * @returns {obj is import("../index.ts").StringLike}
 */
export function isStringLike(object) {
  if (typeof object === "string") {
    return true;
  } else if (object?.toString === undefined) {
    return false;
  } else if (object.toString === getRealmObjectPrototype(object)?.toString) {
    // The stupid Object.prototype.toString implementation always returns
    // "[object Object]", so if that's the only toString method the object has,
    // we return false.
    return false;
  } else {
    return true;
  }
}

export function isUnpackable(object) {
  return (
    isPacked(object) &&
    typeof (/** @type {any} */ (object).unpack) === "function"
  );
}

/**
 * Given a path like "/foo/bar/baz", return an array of keys like ["foo", "bar",
 * "baz"].
 *
 * Leading slashes are ignored. Consecutive slashes or a trailing slash will be
 * represented by the empty string.
 *
 * @param {string} pathname
 */
export function keysFromPath(pathname) {
  const keys = pathname.split("/");
  if (keys[0] === "") {
    // The path begins with a slash; drop that part.
    keys.shift();
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
 * text.
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
  } else {
    // Some other kind of class instance; return its public properties.
    const plain = {};
    for (const [key, value] of Object.entries(input)) {
      plain[key] = await toPlainValue(value);
    }
    return plain;
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
