import { isPlainObject, map as mapTransform } from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";

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
  // The tree we're going to map
  const source = await getTreeArgument(
    this,
    arguments,
    treelike,
    "map",
    operation?.deep
  );

  const mapped = mapTransform(source, operation);
  return mapped;
}

/**
 * Return a function that transforms a tree of keys and values to a new tree of
 * keys and values.
 *
 * @param {ValueKeyFn|TreeMapOptions} operation
 */
function extendedOptions(operation) {
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
  } else if (operation === undefined) {
    /** @type {any} */
    const error = new TypeError(`map: The second parameter was undefined.`);
    error.position = 1;
    throw error;
  } else {
    throw new TypeError(
      `map: You must specify a value function or options dictionary as the second parameter.`
    );
  }

  const { deep, extension, needsSourceValue } = options;
  const description = options.description ?? `map ${extension ?? ""}`;
  let keyFn = options.key;
  let inverseKeyFn = options.inverseKey;

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
