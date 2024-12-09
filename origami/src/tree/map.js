import {
  cachedKeyFunctions,
  isPlainObject,
  keyFunctionsForExtensions,
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
  // The tree we're going to map
  const source = await getTreeArgument(this, arguments, treelike, "tree:map");
  // The tree in which the map operation happens
  const context = this;

  const options = extendedOptions(context, operation);
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
  const keyFn = options.key;
  const inverseKeyFn = options.inverseKey;

  if (extension && (keyFn || inverseKeyFn)) {
    throw new TypeError(
      `map: You can't specify extensions and also a key or inverseKey function`
    );
  }

  let extendedValueFn;
  if (valueFn) {
    const resolvedValueFn = toFunction(valueFn);
    // Have the value function run in this tree.
    extendedValueFn = resolvedValueFn.bind(context);
  }

  // Extend the key functions to run in this tree.
  let extendedKeyFn;
  let extendedInverseKeyFn;
  if (extension) {
    let { resultExtension, sourceExtension } = parseExtensions(extension);
    const keyFns = keyFunctionsForExtensions({
      resultExtension,
      sourceExtension,
    });
    extendedKeyFn = keyFns.key;
    extendedInverseKeyFn = keyFns.inverseKey;
  } else if (keyFn) {
    const resolvedKeyFn = toFunction(keyFn);
    async function keyWithValueFn(sourceKey, sourceTree) {
      const sourceValue = await sourceTree.get(sourceKey);
      const resultKey = await resolvedKeyFn(sourceValue, sourceKey, sourceTree);
      return resultKey;
    }
    const keyFns = cachedKeyFunctions(keyWithValueFn, deep);
    extendedKeyFn = keyFns.key;
    extendedInverseKeyFn = keyFns.inverseKey;
  } else {
    // Use sidecar keyFn/inverseKey functions if the valueFn defines them.
    extendedKeyFn = /** @type {any} */ (valueFn)?.key;
    extendedInverseKeyFn = /** @type {any} */ (valueFn)?.inverseKey;
  }

  return {
    deep,
    description,
    inverseKey: extendedInverseKeyFn,
    key: extendedKeyFn,
    needsSourceValue,
    value: extendedValueFn,
  };
}

/**
 * Given a string specifying an extension or a mapping of one extension to another,
 * return the source and result extensions.
 *
 * Syntax:
 *   foo
 *   foo→bar      Unicode Rightwards Arrow
 *   foo->bar     hyphen and greater-than sign
 *
 * @param {string} specifier
 */
function parseExtensions(specifier) {
  const lowercase = specifier?.toLowerCase() ?? "";
  const extensionRegex =
    /^((?<sourceExtension>\.?\S*)\s*(→|->)\s*(?<resultExtension>\.?\S*))|(?<extension>\.?\S*)$/;
  const match = lowercase.match(extensionRegex);
  if (!match) {
    // Shouldn't happen because the regex is exhaustive.
    throw new Error(`map: Invalid extension specifier "${specifier}".`);
  }
  // @ts-ignore
  const { extension, resultExtension, sourceExtension } = match.groups;
  if (extension) {
    // foo
    return {
      resultExtension: extension,
      sourceExtension: extension,
    };
  } else {
    // foo→bar
    return { resultExtension, sourceExtension };
  }
}
