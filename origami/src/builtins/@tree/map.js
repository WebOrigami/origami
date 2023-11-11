import {
  cachedKeyMaps,
  keyMapsForExtensions,
  mapTransform,
  Tree,
} from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import addValueKeyToScope from "../../common/addValueKeyToScope.js";
import { toFunction } from "../../common/utilities.js";

/**
 * Map a hierarchical tree of keys and values to a new tree of keys and values.
 *
 * @typedef {import("@graphorigami/async-tree").KeyFn} KeyMapFn
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @typedef {import("@graphorigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {import("@graphorigami/async-tree").TreeTransform} TreeTransform
 * @typedef {import("../../../index.ts").TreelikeTransform} TreelikeTransform
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 *
 * @typedef {{ deep?: boolean, description?: string, extensions?: string,
 * inverseKeyMap?: KeyMapFn, keyMap?: ValueKeyFn, keyName?: string, valueMap?:
 * ValueKeyFn, valueName?: string }} Options
 * @typedef {Options & { source: Treelike }} OptionsWithSource
 *
 * @this {import("@graphorigami/types").AsyncTree|null}
 *
 * @overload
 * @param {ValueKeyFn} options
 * @returns {TreeTransform}
 *
 * @overload
 * @param {OptionsWithSource} options
 * @returns {AsyncTree}
 *
 * @overload
 * @param {Options} options
 * @returns {TreelikeTransform}
 */
export default function treeMap(options) {
  let deep;
  let description;
  let extensions;
  let inverseKeyMap;
  let keyMap;
  let keyName;
  let source;
  let valueMap;
  let valueName;
  if (
    typeof options === "function" ||
    typeof (/** @type {any} */ (options)?.unpack) === "function"
  ) {
    // Take the single function argument as the valueMap
    valueMap = options;
  } else {
    ({
      deep,
      description,
      extensions,
      inverseKeyMap,
      keyMap,
      keyName,
      valueMap,
      valueName,
      source,
    } = options);
    description ??= `@tree/map ${extensions ?? ""}`;
  }

  if (extensions) {
    if (keyMap || inverseKeyMap) {
      throw new TypeError(
        `@tree/map: You can't specify both extensions and a keyMap or inverseKeyMap`
      );
    }
  }

  const baseScope = Scope.getScope(this);

  // Extend the value function to include the value and key in scope.
  let extendedValueFn;
  if (valueMap) {
    const resolvedValueFn = toFunction(valueMap);
    extendedValueFn = function (sourceValue, sourceKey, tree) {
      const scope = addValueKeyToScope(
        baseScope,
        sourceValue,
        sourceKey,
        valueName,
        keyName
      );
      return resolvedValueFn.call(scope, sourceValue, sourceKey, tree);
    };
  }

  // Extend the key function to include the value and key in scope.
  let extendedKeyFn;
  let extendedInnerKeyFn;
  if (extensions) {
    let { resultExtension, sourceExtension } = parseExtensions(extensions);
    const keyFns = keyMapsForExtensions({
      resultExtension,
      sourceExtension,
    });
    extendedKeyFn = keyFns.keyMap;
    extendedInnerKeyFn = keyFns.inverseKeyMap;
  } else if (keyMap) {
    const resolvedKeyFn = toFunction(keyMap);
    async function scopedKeyFn(sourceKey, tree) {
      const sourceValue = await tree.get(sourceKey);
      const scope = addValueKeyToScope(
        baseScope,
        sourceValue,
        sourceKey,
        valueName,
        keyName
      );
      const resultKey = await resolvedKeyFn.call(
        scope,
        sourceValue,
        sourceKey,
        tree
      );
      return resultKey;
    }
    const keyFns = cachedKeyMaps(scopedKeyFn);
    extendedKeyFn = keyFns.keyMap;
    extendedInnerKeyFn = keyFns.inverseKeyMap;
  }

  const transform = function map(treelike) {
    const tree = Tree.from(treelike);
    return mapTransform({
      deep,
      description,
      inverseKeyMap: extendedInnerKeyFn,
      keyMap: extendedKeyFn,
      valueMap: extendedValueFn,
    })(tree);
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
