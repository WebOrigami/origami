import { Tree, cachedKeysTransform } from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import addValueKeyToScope from "../../common/addValueKeyToScope.js";
import { toFunction } from "../../common/utilities.js";

/**
 * @this {import("@graphorigami/types").AsyncTree|null}
 */
export default function map(options) {
  const baseScope = Scope.getScope(this);
  return function (treelike) {
    const tree = Tree.from(treelike);

    // Extend the value function to include the value and key in scope.
    let extendedValueFn;
    if (options.valueFn) {
      const valueFn = toFunction(options.valueFn);
      extendedValueFn = function (innerValue, innerKey) {
        const scope = addValueKeyToScope(baseScope, innerValue, innerKey);
        return valueFn.call(scope, innerValue, innerKey);
      };
    }

    // Extend the key function to include the value and key in scope.
    let extendedKeyFn;
    if (options.keyFn) {
      const keyFn = toFunction(options.keyFn);
      extendedKeyFn = async function (innerKey) {
        const innerValue = await tree.get(innerKey);
        const scope = addValueKeyToScope(baseScope, innerValue, innerKey);
        const outerKey = await keyFn.call(scope, innerValue, innerKey);
        return outerKey;
      };
    }

    return cachedKeysTransform({
      description: "@map",
      keyFn: extendedKeyFn,
      valueFn: extendedValueFn,
    })(tree);
  };
}
