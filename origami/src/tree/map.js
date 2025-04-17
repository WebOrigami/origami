import {
  isPlainObject,
  isUnpackable,
  map as mapTransform,
} from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";
import { toFunction } from "../common/utilities.js";

/**
 * Map a hierarchical tree of keys and values to a new tree of keys and values.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {import("./map.js").TreeMapOptions} TreeMapOptions
 *
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {ValueKeyFn|TreeMapOptions} operation
 */
export default async function map(treelike, operation) {
  if (isUnpackable(operation)) {
    operation = await operation.unpack();
  }
  // The tree in which the map operation happens
  const context = this;
  const options = extendedOptions(context, operation);

  // The tree we're going to map
  const source = await getTreeArgument(
    this,
    arguments,
    treelike,
    "tree:map",
    options?.deep
  );

  const mapped = mapTransform(source, options);
  mapped.parent = context;
  return mapped;
}

/**
 * Return a function that transforms a tree of keys and values to a new tree of
 * keys and values.
 *
 * @param {AsyncTree|null} context
 * @param {ValueKeyFn|TreeMapOptions} operation
 */
function extendedOptions(context, operation) {
  // Identify whether the map instructions take the form of a value function or
  // a dictionary of options.
  /** @type {TreeMapOptions} */
  let options;
  /** @type {ValueKeyFn|undefined} */
  let valueFn;
  if (isPlainObject(operation)) {
    // @ts-ignore
    options = operation;
    if (`value` in options && !options.value) {
      throw new TypeError(`map: The value function is not defined.`);
    }
    valueFn = options?.value;
  } else if (
    typeof operation === "function" ||
    typeof (/** @type {any} */ (operation)?.unpack) === "function"
  ) {
    valueFn = operation;
    options = {};
  } else {
    throw new TypeError(
      `map: You must specify a value function or options dictionary as the first parameter.`
    );
  }

  const { deep, extension, needsSourceValue } = options;
  const description = options.description ?? `map ${extension ?? ""}`;
  let keyFn = options.key;
  let inverseKeyFn = options.inverseKey;

  if (valueFn) {
    // @ts-ignore
    valueFn = toFunction(valueFn);
    // By default, run the value function in the context of this tree so that
    // Origami builtins can be used as value functions.
    // @ts-ignore
    const bound = valueFn.bind(context);
    // Transfer sidecar functions
    // @ts-ignore
    Object.assign(bound, valueFn);
    valueFn = bound;
  }

  if (!extension) {
    if (keyFn) {
      // Extend the key function to include a value parameter
      keyFn = extendKeyFn(keyFn);
    }
  }

  return {
    deep,
    description,
    extension,
    inverseKey: inverseKeyFn,
    key: keyFn,
    needsSourceValue,
    value: valueFn,
  };
}

// Extend the key function to include a value parameter
function extendKeyFn(keyFn) {
  keyFn = toFunction(keyFn);
  return async function keyWithValueFn(sourceKey, sourceTree) {
    const sourceValue = await sourceTree.get(sourceKey);
    const resultKey = await keyFn(sourceValue, sourceKey, sourceTree);
    return resultKey;
  };
}
