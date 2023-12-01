import {
  cachedKeyMaps,
  keyMapsForExtensions,
  map,
  Tree,
} from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import addValueKeyToScope from "../common/addValueKeyToScope.js";
import { toFunction } from "../common/utilities.js";

/**
 * Map a hierarchical tree of keys and values to a new tree of keys and values.
 *
 * @typedef {import("@graphorigami/async-tree").KeyFn} KeyFn
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @typedef {import("@graphorigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {import("@graphorigami/async-tree").TreeTransform} TreeTransform
 * @typedef {import("../../index.ts").TreelikeTransform} TreelikeTransform
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 *
 * @typedef {{ deep?: boolean, description?: string, extensions?: string,
 * inverseKeyMap?: KeyFn, keyMap?: ValueKeyFn, keyName?: string, valueMap?:
 * ValueKeyFn, valueName?: string }} TreeMapOptions
 *
 * @this {import("@graphorigami/types").AsyncTree|null}
 *
 * @overload
 * @param {ValueKeyFn} param1
 * @returns {TreelikeTransform}
 *
 * @overload
 * @param {TreeMapOptions} param1
 * @returns {TreelikeTransform}
 *
 * @overload
 * @param {Treelike} param1
 * @param {ValueKeyFn} param2
 * @returns {AsyncTree}
 *
 * @overload
 * @param {Treelike} param1
 * @param {TreeMapOptions} param2
 * @returns {AsyncTree}
 */
export default function treeMap(param1, param2) {
  // Identify whether the valueMap/options are the first parameter
  // or the second.
  let source;
  let options;
  if (param2 === undefined) {
    options = param1;
  } else {
    source = param1;
    options = param2;
  }

  // Identify whether the valueMap/options is a valueMap function
  // or an options dictionary.
  let valueMap;
  if (
    typeof options === "function" ||
    typeof (/** @type {any} */ (options)?.unpack) === "function"
  ) {
    valueMap = options;
    options = {};
  } else {
    valueMap = options.valueMap;
  }

  let {
    deep,
    description,
    extensions,
    inverseKeyMap,
    keyMap,
    keyName,
    valueName,
  } = options;

  description ??= `@tree/map ${extensions ?? ""}`;

  if (extensions && (keyMap || inverseKeyMap)) {
    throw new TypeError(
      `@tree/map: You can't specify both extensions and a keyMap or inverseKeyMap`
    );
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
  let extendedKeyMap;
  let extendedInnerKeyMap;
  if (extensions) {
    let { resultExtension, sourceExtension } = parseExtensions(extensions);
    const keyFns = keyMapsForExtensions({
      resultExtension,
      sourceExtension,
    });
    extendedKeyMap = keyFns.keyMap;
    extendedInnerKeyMap = keyFns.inverseKeyMap;
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
    extendedKeyMap = keyFns.keyMap;
    extendedInnerKeyMap = keyFns.inverseKeyMap;
  }

  const transform = function mapTreelike(treelike) {
    const tree = Tree.from(treelike);
    return map({
      deep,
      description,
      inverseKeyMap: extendedInnerKeyMap,
      keyMap: extendedKeyMap,
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
