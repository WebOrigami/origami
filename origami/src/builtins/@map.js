import {
  cachedKeyFunctions,
  isPlainObject,
  keyFunctionsForExtensions,
  map,
} from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import addValueKeyToScope from "../common/addValueKeyToScope.js";
import { toFunction } from "../common/utilities.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Map a hierarchical tree of keys and values to a new tree of keys and values.
 *
 * @typedef {import("@weborigami/async-tree").KeyFn} KeyFn
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {import("@weborigami/async-tree").TreeTransform} TreeTransform
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @typedef {{ deep?: boolean, description?: string, extension?: string,
 * extensions?: string, inverseKey?: KeyFn, key?: ValueKeyFn, keyMap?:
 * ValueKeyFn, needsSourceValue?: boolean, value?: ValueKeyFn, valueMap?:
 * ValueKeyFn }} MapOptionsDictionary
 *
 * @typedef {ValueKeyFn|MapOptionsDictionary} OptionsOrValueFn
 *
 * @overload
 * @param {Treelike} source
 * @param {OptionsOrValueFn} instructions
 * @returns {AsyncTree}
 *
 * @overload
 * @param {OptionsOrValueFn} instructions
 * @returns {TreeTransform}
 *
 * @this {AsyncTree|null}
 * @param {Treelike|OptionsOrValueFn} param1
 * @param {OptionsOrValueFn} [param2]
 */
export default function treeMap(param1, param2) {
  assertScopeIsDefined(this, "map");

  // Identify whether the map instructions are in the first parameter or the
  // second. If present, identify the function to apply to values.

  /** @type {Treelike|undefined} */
  let source;
  /** @type {OptionsOrValueFn} */
  let instructions;
  /** @type {ValueKeyFn|undefined} */
  let valueFn;

  if (arguments.length === 0) {
    throw new TypeError(
      `@map: You must give @map a function or a dictionary of options.`
    );
  } else if (!param1) {
    throw new TypeError(`@map: The first argument was undefined.`);
  } else if (arguments.length === 1) {
    // One argument
    // @ts-ignore
    instructions = param1;
  } else if (param2 === undefined) {
    throw new TypeError(`@map: The second argument was undefined.`);
  } else {
    // Two arguments
    source = param1;
    instructions = param2;
  }

  // Identify whether the map instructions take the form of a value function or
  // a dictionary of options.
  /** @type {MapOptionsDictionary} */
  let options;
  if (isPlainObject(instructions)) {
    // @ts-ignore
    options = instructions;
    valueFn = options?.value ?? options?.valueMap;
  } else if (
    typeof instructions === "function" ||
    typeof (/** @type {any} */ (instructions)?.unpack) === "function"
  ) {
    valueFn = instructions;
    options = {};
  } else {
    throw new TypeError(
      `@map: You must specify a value function or options dictionary.`
    );
  }

  let { deep, description, inverseKey, needsSourceValue } = options;
  let extension = options.extension ?? options.extensions;
  let keyFn = options.keyMap ?? options.key;

  description ??= `@map ${extension ?? ""}`;

  if (extension && (keyFn || inverseKey)) {
    throw new TypeError(
      `@map: You can't specify extensions and also a key or inverseKey function`
    );
  }

  const baseScope = Scope.getScope(this);

  // Extend the value function to include the value and key in scope.
  let extendedValueFn;
  if (valueFn) {
    const resolvedValueFn = toFunction(valueFn);
    extendedValueFn = function (sourceValue, sourceKey, tree) {
      const scope = addValueKeyToScope(baseScope, sourceValue, sourceKey);
      return resolvedValueFn.call(scope, sourceValue, sourceKey, tree);
    };
  }

  // Extend the key function to include the value and key in scope.
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
    async function scopedKeyFn(sourceKey, tree) {
      const sourceValue = await tree.get(sourceKey);
      const scope = addValueKeyToScope(baseScope, sourceValue, sourceKey);
      const resultKey = await resolvedKeyFn.call(
        scope,
        sourceValue,
        sourceKey,
        tree
      );
      return resultKey;
    }
    const keyFns = cachedKeyFunctions(scopedKeyFn);
    extendedKeyFn = keyFns.key;
    extendedInverseKeyFn = keyFns.inverseKey;
  } else {
    // Use sidecar keyFn/inverseKey functions if the valueFn defines them.
    extendedKeyFn = /** @type {any} */ (valueFn)?.key;
    extendedInverseKeyFn = /** @type {any} */ (valueFn)?.inverseKey;
  }

  const transform = function mapTreelike(treelike) {
    return map({
      deep,
      description,
      inverseKey: extendedInverseKeyFn,
      key: extendedKeyFn,
      needsSourceValue,
      value: extendedValueFn,
    })(treelike);
  };

  return source ? transform(source) : transform;
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
    /^\.?(?<sourceExtension>\S*)(?:\s*(→|->)\s*)\.?(?<extension>\S+)$/;
  let resultExtension;
  let sourceExtension;
  const match = lowercase.match(extensionRegex);
  if (match?.groups) {
    // foo→bar
    ({ extension: resultExtension, sourceExtension } = match.groups);
  } else {
    // foo
    resultExtension = lowercase;
    sourceExtension = lowercase;
  }
  return { resultExtension, sourceExtension };
}
