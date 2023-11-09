import {
  cachedKeyFns,
  keyFnsForExtensions,
  mapTransform,
  Tree,
} from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import addValueKeyToScope from "../../common/addValueKeyToScope.js";
import { toFunction } from "../../common/utilities.js";

/**
 *
 * @typedef {import("@graphorigami/async-tree").KeyFn} KeyMapFn
 * @typedef {import("@graphorigami/async-tree").ValueKeyFn} ValueKeyFn
 *
 * @this {import("@graphorigami/types").AsyncTree|null}
 * @param {ValueKeyFn|{ deep?: boolean, description?: string, extensions?: string, innerKeyFn?: KeyMapFn, keyFn?: ValueKeyFn, keyName?: string, valueFn?: ValueKeyFn, valueName?: string }} options
 */
export default function treeMap(options) {
  let deep;
  let description;
  let extensions;
  let innerKeyFn;
  let keyFn;
  let keyName;
  let valueFn;
  let valueName;
  if (
    typeof options === "function" ||
    typeof (/** @type {any} */ (options)?.unpack) === "function"
  ) {
    // Take the single function argument as the valueFn
    valueFn = options;
  } else {
    ({
      deep,
      description,
      extensions,
      innerKeyFn,
      keyFn,
      keyName,
      valueFn,
      valueName,
    } = options);
    description ??= `@tree/map ${extensions ?? ""}`;
  }

  if (extensions) {
    if (keyFn || innerKeyFn) {
      throw new TypeError(
        `@tree/map: You can't specify both extensions and a keyFn or innerKeyFn`
      );
    }
  }

  const baseScope = Scope.getScope(this);

  // Extend the value function to include the value and key in scope.
  let extendedValueFn;
  if (valueFn) {
    const resolvedValueFn = toFunction(valueFn);
    extendedValueFn = function (innerValue, innerKey, tree) {
      const scope = addValueKeyToScope(
        baseScope,
        innerValue,
        innerKey,
        valueName,
        keyName
      );
      return resolvedValueFn.call(scope, innerValue, innerKey, tree);
    };
  }

  // Extend the key function to include the value and key in scope.
  let extendedKeyFn;
  let extendedInnerKeyFn;
  if (extensions) {
    let { extension, innerExtension } = parseExtensions(extensions);
    const keyFns = keyFnsForExtensions({
      extension,
      innerExtension,
    });
    extendedKeyFn = keyFns.keyFn;
    extendedInnerKeyFn = keyFns.innerKeyFn;
  } else if (keyFn) {
    const resolvedKeyFn = toFunction(keyFn);
    async function scopedKeyFn(innerKey, tree) {
      const innerValue = await tree.get(innerKey);
      const scope = addValueKeyToScope(
        baseScope,
        innerValue,
        innerKey,
        valueName,
        keyName
      );
      const outerKey = await resolvedKeyFn.call(
        scope,
        innerValue,
        innerKey,
        tree
      );
      return outerKey;
    }
    const keyFns = cachedKeyFns(scopedKeyFn);
    extendedKeyFn = keyFns.keyFn;
    extendedInnerKeyFn = keyFns.innerKeyFn;
  }

  return function map(treelike) {
    const tree = Tree.from(treelike);
    return mapTransform({
      deep,
      description,
      innerKeyFn: extendedInnerKeyFn,
      keyFn: extendedKeyFn,
      valueFn: extendedValueFn,
    })(tree);
  };
}

/**
 * Given a string specifying an extension or a mapping of one extension to another,
 * return the inner and outer extensions.
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
    /^\.?(?<innerExtension>\S*)(?:\s*(→|->)\s*)\.?(?<extension>\S+)$/;
  let extension;
  let innerExtension;
  const match = lowercase.match(extensionRegex);
  if (match?.groups) {
    // foo→bar
    ({ extension, innerExtension } = match.groups);
  } else {
    // foo
    extension = lowercase;
    innerExtension = lowercase;
  }
  return { extension, innerExtension };
}
