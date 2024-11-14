import {
  cachedKeyFunctions,
  isPlainObject,
  keyFunctionsForExtensions,
  mapFn,
} from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import { toFunction } from "../common/utilities.js";

/**
 * Return a function that transforms a tree of keys and values to a new tree of
 * keys and values.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {import("./map.js").TreeMapOptions} TreeMapOptions
 *
 * @this {AsyncTree|null}
 * @param {ValueKeyFn|TreeMapOptions} operation
 */
export default function mapFnBuiltin(operation) {
  assertTreeIsDefined(this, "map");
  const tree = this;

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
      throw new TypeError(`@mapFn: The value function is not defined.`);
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
      `@mapFn: You must specify a value function or options dictionary as the first parameter.`
    );
  }

  const { deep, extension, needsSourceValue } = options;
  const description = options.description ?? `@mapFn ${extension ?? ""}`;
  const keyFn = options.key;
  const inverseKeyFn = options.inverseKey;

  if (extension && (keyFn || inverseKeyFn)) {
    throw new TypeError(
      `@mapFn: You can't specify extensions and also a key or inverseKey function`
    );
  }

  let extendedValueFn;
  if (valueFn) {
    const resolvedValueFn = toFunction(valueFn);
    // Have the value function run in this tree.
    extendedValueFn = resolvedValueFn.bind(tree);
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
    async function scopedKeyFn(sourceKey, sourceTree) {
      const sourceValue = await sourceTree.get(sourceKey);
      // The key function will be given the source tree, but will run with the
      // scope of this tree.
      const resultKey = await resolvedKeyFn.call(
        tree,
        sourceValue,
        sourceKey,
        sourceTree
      );
      return resultKey;
    }
    const keyFns = cachedKeyFunctions(scopedKeyFn, deep);
    extendedKeyFn = keyFns.key;
    extendedInverseKeyFn = keyFns.inverseKey;
  } else {
    // Use sidecar keyFn/inverseKey functions if the valueFn defines them.
    extendedKeyFn = /** @type {any} */ (valueFn)?.key;
    extendedInverseKeyFn = /** @type {any} */ (valueFn)?.inverseKey;
  }

  const fn = mapFn({
    deep,
    description,
    inverseKey: extendedInverseKeyFn,
    key: extendedKeyFn,
    needsSourceValue,
    value: extendedValueFn,
  });

  return (treelike) => {
    const mapped = fn(treelike);
    mapped.parent = tree;
    return mapped;
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
    /^(\.?(?<sourceExtension>\S*)\s*(→|->)\s*\.?(?<resultExtension>\S*))|(\.?(?<extension>\S*))$/;
  const match = lowercase.match(extensionRegex);
  if (!match) {
    // Shouldn't happen because the regex is exhaustive.
    throw new Error(`@mapFn: Invalid extension specifier "${specifier}".`);
  }
  // @ts-ignore
  const { extension, resultExtension, sourceExtension } = match.groups;
  if (sourceExtension || resultExtension) {
    // foo→bar
    return { resultExtension, sourceExtension };
  } else {
    // foo
    return {
      resultExtension: specifier,
      sourceExtension: specifier,
    };
  }
}
