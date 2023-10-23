import DeferredTree from "./DeferredTree.js";
import * as Dictionary from "./Dictionary.js";
import FunctionTree from "./FunctionTree.js";
import MapTree from "./MapTree.js";
import ObjectTree from "./ObjectTree.js";
import SetTree from "./SetTree.js";
import defaultValueKey from "./defaultValueKey.js";

// Tree exports all dictionary helpers too.
export * from "./Dictionary.js";

/**
 * Helper functions for working with async trees
 *
 * These add to the set of helper functions defined in Dictionary.
 *
 * @typedef {import("../index").Treelike} Treelike
 * @typedef {import("../index").PlainObject} PlainObject
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/types").AsyncMutableDictionary} AsyncMutableDictionary
 * @typedef {import("@graphorigami/types").AsyncMutableTree} AsyncMutableTree
 */

/**
 * Apply the key/values pairs from the source tree to the target tree.
 *
 * If a key exists in both trees, and the values in both trees are
 * subtrees, then the subtrees will be merged recursively. Otherwise, the
 * value from the source tree will overwrite the value in the target tree.
 *
 * @param {AsyncMutableDictionary} target
 * @param {AsyncTree} source
 */
export async function assign(target, source) {
  const targetTree = from(target);
  const sourceTree = from(source);
  if (!Dictionary.isAsyncMutableDictionary(targetTree)) {
    throw new TypeError("Target must be a mutable asynchronous dictionary");
  }
  // Fire off requests to update all keys, then wait for all of them to finish.
  const keys = Array.from(await sourceTree.keys());
  const promises = keys.map(async (key) => {
    const sourceValue = await sourceTree.get(key);
    if (isAsyncTree(sourceValue)) {
      const targetValue = await targetTree.get(key);
      if (isAsyncMutableTree(targetValue)) {
        // Both source and target are trees; recurse.
        await assign(targetValue, sourceValue);
        return;
      }
    }
    // Copy the value from the source to the target.
    await /** @type {any} */ (targetTree).set(key, sourceValue);
  });
  await Promise.all(promises);
  return targetTree;
}

// If the given plain object has only sequential integer keys, return it as an
// array. Otherwise return it as is.
function castArrayLike(obj) {
  let hasKeys = false;
  let expectedIndex = 0;
  for (const key in obj) {
    hasKeys = true;
    const index = Number(key);
    if (key === "" || isNaN(index) || index !== expectedIndex) {
      // Not an array-like object.
      return obj;
    }
    expectedIndex++;
  }
  return hasKeys ? Object.values(obj) : obj;
}

/**
 * Attempts to cast the indicated object to an async tree.
 *
 * @param {Treelike | Object} obj
 * @returns {AsyncTree}
 */
export function from(obj) {
  if (Dictionary.isAsyncDictionary(obj)) {
    // Argument already supports the dictionary interface.
    // @ts-ignore
    return obj;
  } else if (typeof obj === "function") {
    return new FunctionTree(obj);
  } else if (obj instanceof Map) {
    return new MapTree(obj);
  } else if (obj instanceof Set) {
    return new SetTree(obj);
  } else if (obj && typeof obj === "object" && "unpack" in obj) {
    // Invoke unpack and convert the result to a tree.
    let result = obj.unpack();
    return result instanceof Promise ? new DeferredTree(result) : from(result);
  } else if (obj && typeof obj === "object") {
    // An instance of some class.
    return new ObjectTree(obj);
  } else {
    // A primitive value like a number or string.
    return new ObjectTree({
      [defaultValueKey]: obj,
    });
  }

  // throw new TypeError("Couldn't convert argument to an async tree");
}

/**
 * Return true if the indicated object is an async tree.
 *
 * @param {any} obj
 * @returns {obj is AsyncTree}
 */
export function isAsyncTree(obj) {
  return Dictionary.isAsyncDictionary(obj) && obj && "parent2" in obj;
}

/**
 * Return true if the indicated object is an async mutable tree.
 *
 * @param {any} obj
 * @returns {obj is AsyncMutableTree}
 */
export function isAsyncMutableTree(obj) {
  return isAsyncTree(obj) && Dictionary.isAsyncMutableDictionary(obj);
}

/**
 * Returns true if the indicated object can be directly treated as an
 * asynchronous tree. This includes:
 *
 * - An object that implements the AsyncDictionary interface (including
 *   AsyncTree instances)
 * - An object that implements the `unpack()` method
 * - A function
 * - An `Array` instance
 * - A `Map` instance
 * - A `Set` instance
 * - A plain object
 *
 * Note: the `from()` method accepts any JavaScript object, but `isTreeable`
 * returns `false` for an object that isn't one of the above types.
 *
 * @param {any} obj
 */
export function isTreelike(obj) {
  return (
    Dictionary.isAsyncDictionary(obj) ||
    obj instanceof Function ||
    obj instanceof Array ||
    obj instanceof Set ||
    obj?.unpack instanceof Function ||
    Dictionary.isPlainObject(obj)
  );
}

/**
 * Return true if the indicated key produces or is expected to produce an
 * async tree.
 *
 * This defers to the tree's own isKeyForSubtree method. If not found, this
 * gets the value of that key and returns true if the value is an async
 * dictionary.
 */
export async function isKeyForSubtree(tree, key) {
  if (tree.isKeyForSubtree) {
    return tree.isKeyForSubtree(key);
  }
  const value = await tree.get(key);
  return isTreelike(value);
}

/**
 * Given a path like "/foo/bar/baz", return an array of keys like ["foo", "bar",
 * "baz"].
 *
 * Leading slashes are ignored. Consecutive slashes or a trailing slash will
 * be represented by the `defaultValueKey` symbol. Example: the keys for the path
 * "/foo//bar/" will be ["foo", defaultValueKey, "bar", defaultValueKey].
 *
 * @param {string} pathname
 */
export function keysFromPath(pathname) {
  const keys = pathname.split("/");
  if (keys[0] === "") {
    // The path begins with a slash; drop that part.
    keys.shift();
  }
  // Map empty strings to the default value key.
  const mapped =
    keys.length === 0
      ? [defaultValueKey]
      : keys.map((key) => (key === "" ? defaultValueKey : key));
  return mapped;
}

/**
 * Map the values of a tree.
 *
 * @param {Treelike} treelike
 * @param {Function} mapFn
 */
export async function map(treelike, mapFn) {
  const tree = from(treelike);
  const keys = Array.from(await tree.keys());

  // Prepopulate the result map with the keys so that the order of the results
  // will match the order of the keys.
  const result = new Map();
  keys.forEach((key) => result.set(key, undefined));

  // Get all the values in parallel, then wait for them all to resolve.
  const promises = keys.map((key) =>
    tree.get(key).then(async (value) => {
      // If the value is a subtree, recurse.
      const fn = Dictionary.isAsyncDictionary(value)
        ? map(value, mapFn)
        : mapFn(value, key);
      const mappedValue = await fn;
      result.set(key, mappedValue);
    })
  );
  await Promise.all(promises);
  return new MapTree(result);
}

/**
 * Map and reduce a tree.
 *
 * This is done in as parallel fashion as possible. Each of the tree's values
 * will be requested in an async call, then those results will be awaited
 * collectively. If a mapFn is provided, it will be invoked to convert each
 * value to a mapped value; otherwise, values will be used as is. When the
 * values have been obtained, all the values and keys will be passed to the
 * reduceFn, which should consolidate those into a single result.
 *
 * @param {Treelike} treelike
 * @param {Function|null} mapFn
 * @param {Function} reduceFn
 */
export async function mapReduce(treelike, mapFn, reduceFn) {
  const tree = from(treelike);

  // We're going to fire off all the get requests in parallel, as quickly as
  // the keys come in. We call the tree's `get` method for each key, but
  // *don't* wait for it yet.
  const keys = Array.from(await tree.keys());
  const promises = keys.map((key) =>
    tree.get(key).then((value) =>
      // If the value is a subtree, recurse.
      Dictionary.isAsyncDictionary(value)
        ? mapReduce(value, mapFn, reduceFn)
        : mapFn
        ? mapFn(value, key)
        : value
    )
  );

  // Wait for all the promises to resolve. Because the promises were captured
  // in the same order as the keys, the values will also be in the same order.
  const values = await Promise.all(promises);

  // Reduce the values to a single result.
  return reduceFn(values, keys);
}

/**
 * Converts an asynchronous tree into a synchronous plain JavaScript object.
 *
 * The result's keys will be the tree's keys cast to strings. Any tree value
 * that is itself a tree will be similarly converted to a plain object.
 *
 * @param {Treelike} treelike
 * @returns {Promise<PlainObject|Array>}
 */
export async function plain(treelike) {
  return mapReduce(treelike, null, (values, keys) => {
    const obj = {};
    for (let i = 0; i < keys.length; i++) {
      obj[keys[i]] = values[i];
    }
    return castArrayLike(obj);
  });
}

/**
 * Returns a function that invokes the tree's `get` method.
 *
 * @param {Treelike} treelike
 * @returns {Function}
 */
export function toFunction(treelike) {
  const tree = from(treelike);
  return tree.get.bind(tree);
}

/**
 * Return the value at the corresponding path of keys.
 *
 * @this {any}
 * @param {Treelike} treelike
 * @param {...any} keys
 */
export async function traverse(treelike, ...keys) {
  try {
    // Await the result here so that, if the path doesn't exist, the catch
    // block below will catch the exception.
    return await traverseOrThrow.call(this, treelike, ...keys);
  } catch (/** @type {any} */ error) {
    if (error instanceof TraverseError) {
      return undefined;
    } else {
      throw error;
    }
  }
}

/**
 * Return the value at the corresponding path of keys. Throw if any interior
 * step of the path doesn't lead to a result.
 *
 * @this {any}
 * @param {Treelike} treelike
 * @param  {...any} keys
 */
export async function traverseOrThrow(treelike, ...keys) {
  // Start our traversal at the root of the tree.
  /** @type {any} */
  let value = treelike;

  // Process each key in turn.
  // If the value is ever undefined, short-circuit the traversal.
  const remainingKeys = keys.slice();
  while (remainingKeys.length > 0) {
    if (value === undefined) {
      const keyStrings = keys.map((key) => String(key));
      throw new TraverseError(
        `Couldn't traverse the path: ${keyStrings.join("/")}`,
        value,
        keys
      );
    }

    if (typeof value.unpack === "function") {
      value = await value.unpack();
    }

    // If the traversal operation was given a context, and the value we need to
    // traverse is a function, bind the function to the context.
    if (this && typeof value === "function") {
      value = value.bind(this);
    }

    // If someone is trying to traverse this thing, they mean to treat it as a
    // tree. If it's not already a tree, cast it to one.
    const tree = from(value);

    // If the tree supports the traverse() method, pass the remaining keys
    // all at once.
    if (tree.traverse) {
      value = await tree.traverse(...remainingKeys);
      break;
    }

    // Otherwise, process the next key.
    const key = remainingKeys.shift();
    value = await tree.get(key);

    // The default value is the tree itself.
    if (value === undefined && key === defaultValueKey) {
      value = tree;
    }
  }
  return value;
}

/**
 * Given a slash-separated path like "foo/bar", traverse the keys "foo" and
 * "bar" and return the resulting value.
 *
 * @param {Treelike} tree
 * @param {string} path
 */
export async function traversePath(tree, path) {
  const keys = keysFromPath(path);
  return traverse(tree, ...keys);
}

// Error class thrown by traverseOrThrow()
class TraverseError extends ReferenceError {
  constructor(message, tree, keys) {
    super(message);
    this.tree = tree;
    this.name = "TraverseError";
    this.keys = keys;
  }
}
