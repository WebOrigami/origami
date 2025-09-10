import DeferredTree from "./drivers/DeferredTree.js";
import FunctionTree from "./drivers/FunctionTree.js";
import MapTree from "./drivers/MapTree.js";
import SetTree from "./drivers/SetTree.js";
import { DeepObjectTree, ObjectTree } from "./internal.js";
import * as symbols from "./symbols.js";
import * as trailingSlash from "./trailingSlash.js";
import TraverseError from "./TraverseError.js";
import * as utilities from "./utilities.js";
import {
  castArrayLike,
  isPacked,
  isPlainObject,
  isUnpackable,
  toPlainValue,
} from "./utilities.js";

/**
 * Helper functions for working with async trees
 *
 * @typedef {import("../index.ts").PlainObject} PlainObject
 * @typedef {import("../index.ts").ReduceFn} ReduceFn
 * @typedef {import("../index.ts").Treelike} Treelike
 * @typedef {import("../index.ts").ValueKeyFn} ValueKeyFn
 * @typedef {import("@weborigami/types").AsyncMutableTree} AsyncMutableTree
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 */

/**
 * Apply the key/values pairs from the source tree to the target tree.
 *
 * If a key exists in both trees, and the values in both trees are
 * subtrees, then the subtrees will be merged recursively. Otherwise, the
 * value from the source tree will overwrite the value in the target tree.
 *
 * @param {AsyncMutableTree} target
 * @param {AsyncTree} source
 */
export async function assign(target, source) {
  const targetTree = from(target);
  const sourceTree = from(source);
  if (!isAsyncMutableTree(targetTree)) {
    throw new TypeError("Target must be a mutable asynchronous tree");
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

/**
 * Removes all entries from the tree.
 *
 * @param {Treelike} treelike
 */
export async function clear(treelike) {
  const tree = from(treelike);
  if (!isAsyncMutableTree(tree)) {
    throw new TypeError("clear: can't clear a read-only tree.");
  }
  const keys = Array.from(await tree.keys());
  const promises = keys.map((key) => tree.set(key, undefined));
  await Promise.all(promises);
  return tree;
}

/**
 * Returns a new `Iterator` object that contains a two-member array of `[key,
 * value]` for each element in the specific node of the tree.
 *
 * @param {AsyncTree} tree
 */
export async function entries(tree) {
  const keys = Array.from(await tree.keys());
  const promises = keys.map(async (key) => [key, await tree.get(key)]);
  return Promise.all(promises);
}

/**
 * Calls callbackFn once for each key-value pair present in the specific node of
 * the tree.
 *
 * @param {AsyncTree} tree
 * @param {Function} callbackFn
 */
export async function forEach(tree, callbackFn) {
  const keys = Array.from(await tree.keys());
  const promises = keys.map(async (key) => {
    const value = await tree.get(key);
    return callbackFn(value, key);
  });
  await Promise.all(promises);
}

/**
 * Attempts to cast the indicated object to an async tree.
 *
 * If the object is a plain object, it will be converted to an ObjectTree. The
 * optional `deep` option can be set to `true` to convert a plain object to a
 * DeepObjectTree. The optional `parent` parameter will be used as the default
 * parent of the new tree.
 *
 * @param {Treelike | Object} object
 * @param {{ deep?: boolean, parent?: AsyncTree|null }} [options]
 * @returns {AsyncTree}
 */
export function from(object, options = {}) {
  const deep = options.deep ?? object[symbols.deep];
  let tree;
  if (isAsyncTree(object)) {
    // Argument already supports the tree interface.
    // @ts-ignore
    return object;
  } else if (typeof object === "function") {
    tree = new FunctionTree(object);
  } else if (object instanceof Map) {
    tree = new MapTree(object);
  } else if (object instanceof Set) {
    tree = new SetTree(object);
  } else if (isPlainObject(object) || object instanceof Array) {
    tree = deep ? new DeepObjectTree(object) : new ObjectTree(object);
  } else if (isUnpackable(object)) {
    async function AsyncFunction() {} // Sample async function
    tree =
      object.unpack instanceof AsyncFunction.constructor
        ? // Async unpack: return a deferred tree.
          new DeferredTree(object.unpack, { deep })
        : // Synchronous unpack: cast the result of unpack() to a tree.
          from(object.unpack());
  } else if (object && typeof object === "object") {
    // An instance of some class.
    tree = new ObjectTree(object);
  } else if (
    typeof object === "string" ||
    typeof object === "number" ||
    typeof object === "boolean"
  ) {
    // A primitive value; box it into an object and construct a tree.
    const boxed = utilities.box(object);
    tree = new ObjectTree(boxed);
  } else {
    throw new TypeError("Couldn't convert argument to an async tree");
  }

  if (!tree.parent && options.parent) {
    tree.parent = options.parent;
  }
  return tree;
}

/**
 * Returns a boolean indicating whether the specific node of the tree has a
 * value for the given `key`.
 *
 * @param {AsyncTree} tree
 * @param {any} key
 */
export async function has(tree, key) {
  const value = await tree.get(key);
  return value !== undefined;
}

/**
 * Return true if the indicated object is an async tree.
 *
 * @param {any} obj
 * @returns {obj is AsyncTree}
 */
export function isAsyncTree(obj) {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof obj.get === "function" &&
    typeof obj.keys === "function" &&
    // JavaScript Map look like trees but can't be extended the same way, so we
    // report false.
    !(obj instanceof Map)
  );
}

/**
 * Return true if the indicated object is an async mutable tree.
 *
 * @param {any} obj
 * @returns {obj is AsyncMutableTree}
 */
export function isAsyncMutableTree(obj) {
  return (
    isAsyncTree(obj) && typeof (/** @type {any} */ (obj).set) === "function"
  );
}

/**
 * Return true if the object can be traversed via the `traverse()` method. The
 * object must be either treelike or a packed object with an `unpack()` method.
 *
 * @param {any} object
 */
export function isTraversable(object) {
  return (
    isTreelike(object) ||
    (isPacked(object) && /** @type {any} */ (object).unpack instanceof Function)
  );
}

/**
 * Returns true if the indicated object can be directly treated as an
 * asynchronous tree. This includes:
 *
 * - An object that implements the AsyncTree interface (including
 *   AsyncTree instances)
 * - A function
 * - An `Array` instance
 * - A `Map` instance
 * - A `Set` instance
 * - A plain object
 *
 * Note: the `from()` method accepts any JavaScript object, but `isTreelike`
 * returns `false` for an object that isn't one of the above types.
 *
 * @param {any} obj
 * @returns {obj is Treelike}
 */
export function isTreelike(obj) {
  return (
    isAsyncTree(obj) ||
    obj instanceof Array ||
    obj instanceof Function ||
    obj instanceof Map ||
    obj instanceof Set ||
    isPlainObject(obj)
  );
}

/**
 * Return a new tree with deeply-mapped values of the original tree.
 *
 * @param {Treelike} treelike
 * @param {ValueKeyFn} valueFn
 */
export { default as map } from "./operations/map.js";

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
 * @param {ValueKeyFn|null} valueFn
 * @param {ReduceFn} reduceFn
 */
export async function mapReduce(treelike, valueFn, reduceFn) {
  const tree = from(treelike);

  // We're going to fire off all the get requests in parallel, as quickly as
  // the keys come in. We call the tree's `get` method for each key, but
  // *don't* wait for it yet.
  const keys = Array.from(await tree.keys());
  const promises = keys.map((key) =>
    tree.get(key).then((value) =>
      // If the value is a subtree, recurse.
      isAsyncTree(value)
        ? mapReduce(value, valueFn, reduceFn)
        : valueFn
        ? valueFn(value, key, tree)
        : value
    )
  );

  // Wait for all the promises to resolve. Because the promises were captured
  // in the same order as the keys, the values will also be in the same order.
  const values = await Promise.all(promises);

  // Reduce the values to a single result.
  return reduceFn(values, keys, tree);
}

/**
 * Returns slash-separated paths for all values in the tree.
 *
 * The `base` argument is prepended to all paths.
 *
 * If `assumeSlashes` is true, then keys are assumed to have trailing slashes to
 * indicate subtrees. The default value of this option is false.
 *
 * @param {Treelike} treelike
 * @param {{ assumeSlashes?: boolean, base?: string }} options
 */
export async function paths(treelike, options = {}) {
  const tree = from(treelike);
  const base = options.base ?? "";
  const assumeSlashes = options.assumeSlashes ?? false;
  const result = [];
  for (const key of await tree.keys()) {
    const separator = trailingSlash.has(base) ? "" : "/";
    const valuePath = base ? `${base}${separator}${key}` : key;
    let isSubtree;
    let value;
    if (assumeSlashes) {
      // Subtree needs to have a trailing slash
      isSubtree = trailingSlash.has(key);
      if (isSubtree) {
        // We'll need the value to recurse
        value = await tree.get(key);
      }
    } else {
      // Get value and check
      value = await tree.get(key);
    }
    if (value) {
      // If we got the value we can check if it's a subtree
      isSubtree = isAsyncTree(value);
    }
    if (isSubtree) {
      const subPaths = await paths(value, { assumeSlashes, base: valuePath });
      result.push(...subPaths);
    } else {
      result.push(valuePath);
    }
  }
  return result;
}

/**
 * Converts an asynchronous tree into a synchronous plain JavaScript object.
 *
 * The result's keys will be the tree's keys cast to strings. Any trailing
 * slashes in keys will be removed.
 *
 * Any tree value that is itself a tree will be recursively converted to a plain
 * object.
 *
 * If the tree is array-like (its keys are integers and fill the range
 * 0..length-1), then the result will be an array. The order of the keys will
 * determine the order of the values in the array -- but the numeric value of
 * the keys will be ignored.
 *
 * For example, a tree like `{ 1: "b", 0: "a", 2: "c" }` is array-like because
 * its keys are all integers and fill the range 0..2. The result will be the
 * array `["b", "a", "c" ]` because the tree has the keys in that order. The
 * specific values of the keys (0, 1, and 2) are ignored.
 *
 * @param {Treelike} treelike
 * @returns {Promise<PlainObject|Array>}
 */
export async function plain(treelike) {
  return mapReduce(treelike, toPlainValue, (values, keys, tree) => {
    // Special case for an empty tree: if based on array, return array.
    if (tree instanceof ObjectTree && keys.length === 0) {
      return /** @type {any} */ (tree).object instanceof Array ? [] : {};
    }
    // Normalize slashes in keys.
    keys = keys.map(trailingSlash.remove);
    return castArrayLike(keys, values);
  });
}

/**
 * Removes the value for the given key from the specific node of the tree.
 *
 * Note: The corresponding `Map` method is `delete`, not `remove`. However,
 * `delete` is a reserved word in JavaScript, so this uses `remove` instead.
 *
 * @param {AsyncMutableTree} tree
 * @param {any} key
 */
export async function remove(tree, key) {
  const exists = await has(tree, key);
  if (exists) {
    await tree.set(key, undefined);
    return true;
  } else {
    return false;
  }
}

/**
 * Walk up the `parent` chain to find the root of the tree.
 *
 * @param {AsyncTree} tree
 */
export function root(tree) {
  let current = from(tree);
  while (current.parent || current[symbols.parent]) {
    current = current.parent || current[symbols.parent];
  }
  return current;
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
 * @this {AsyncTree|null|undefined}
 * @param {Treelike} treelike
 * @param  {...any} keys
 */
export async function traverseOrThrow(treelike, ...keys) {
  // Start our traversal at the root of the tree.
  /** @type {any} */
  let value = treelike;
  let position = 0;

  // If traversal operation was called with a `this` context, use that as the
  // target for function calls.
  const target = this;

  // Process all the keys.
  const remainingKeys = keys.slice();
  let key;
  while (remainingKeys.length > 0) {
    if (value == null) {
      throw new TraverseError("A null or undefined value can't be traversed", {
        tree: treelike,
        keys,
        position,
      });
    }

    // If the value is packed and can be unpacked, unpack it.
    if (isUnpackable(value)) {
      value = await value.unpack();
    }

    if (value instanceof Function) {
      // Value is a function: call it with the remaining keys.
      const fn = value;
      // We'll take as many keys as the function's length, but at least one.
      let fnKeyCount = Math.max(fn.length, 1);
      const args = remainingKeys.splice(0, fnKeyCount);
      key = null;
      value = await fn.call(target, ...args);
    } else {
      // Cast value to a tree.
      const tree = from(value);
      // Get the next key.
      key = remainingKeys.shift();
      // Get the value for the key.
      value = await tree.get(key);
    }

    position++;
  }

  return value;
}

/**
 * Given a slash-separated path like "foo/bar", traverse the keys "foo/" and
 * "bar" and return the resulting value.
 *
 * @param {Treelike} tree
 * @param {string} path
 */
export async function traversePath(tree, path) {
  const keys = utilities.keysFromPath(path);
  return traverse(tree, ...keys);
}

/**
 * Return the values in the specific node of the tree.
 *
 * @param {Treelike} treelike
 */
export async function values(treelike) {
  const tree = from(treelike);
  const keys = Array.from(await tree.keys());
  const promises = keys.map(async (key) => tree.get(key));
  return Promise.all(promises);
}
