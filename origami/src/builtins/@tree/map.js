import {
  Tree,
  cachedKeysTransform,
  createExtensionKeyFns,
} from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import addValueKeyToScope from "../../common/addValueKeyToScope.js";
import { toFunction } from "../../common/utilities.js";

/**
 *
 * @typedef {import("@graphorigami/async-tree").ValueKeyFn} ValueKeyFn
 *
 * @this {import("@graphorigami/types").AsyncTree|null}
 * @param {{ deep?: boolean, description?: string, extensions?: string, innerKeyFn?: (any) => any, keyFn?: (any) => any, valueFn?: ValueKeyFn }} options
 */
export default function map({
  deep,
  description = "@tree/map",
  extensions,
  innerKeyFn,
  keyFn,
  valueFn,
}) {
  let extension;
  let innerExtension;
  if (extensions) {
    if (keyFn || innerKeyFn) {
      throw new TypeError(
        `@tree/map: You can't specify both extensions and a keyFn or innerKeyFn`
      );
    }
    ({ extension, innerExtension } = parseExtensions(extensions));
  }

  const baseScope = Scope.getScope(this);
  return function (treelike) {
    const tree = Tree.from(treelike);

    // Extend the value function to include the value and key in scope.
    let extendedValueFn;
    if (valueFn) {
      const resolvedValueFn = toFunction(valueFn);
      extendedValueFn = function (innerValue, innerKey) {
        const scope = addValueKeyToScope(baseScope, innerValue, innerKey);
        return resolvedValueFn.call(scope, innerValue, innerKey);
      };
    }

    // Extend the key function to include the value and key in scope.
    let extendedKeyFn;
    if (extensions) {
      ({ extendedKeyFn: innerKeyFn } = createExtensionKeyFns({
        deep,
        tree,
        extension,
        innerExtension,
      }));
    } else if (keyFn) {
      const resolvedKeyFn = toFunction(keyFn);
      extendedKeyFn = async function (innerKey) {
        const innerValue = await tree.get(innerKey);
        const scope = addValueKeyToScope(baseScope, innerValue, innerKey);
        const outerKey = await resolvedKeyFn.call(scope, innerKey);
        return outerKey;
      };
    }

    return cachedKeysTransform({
      deep,
      description,
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
    /^\.?(?<innerExtension>\S*)(?:\s*(→|->)\s*)\.?(?<outerExtension>\S+)$/;
  let extension;
  let innerExtension;
  const match = lowercase.match(extensionRegex);
  if (match?.groups) {
    // foo→bar
    extension = match.groups.outerExtension;
    innerExtension = match.groups.innerExtension;
  } else {
    // foo
    extension = lowercase;
    innerExtension = lowercase;
  }
  return { extension, innerExtension };
}
