import { Tree, createCachedMapTransform } from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import addValueKeyToScope from "../common/addValueKeyToScope.js";
import { toFunction } from "../common/utilities.js";

export default function map2(options) {
  return function (treelike) {
    const tree = Tree.from(treelike);

    let extendedValueFn;
    if (options.valueFn) {
      const valueFn = toFunction(options.valueFn);
      extendedValueFn = function (innerValue, innerKey) {
        const scope = addValueKeyToScope(
          Scope.getScope(tree),
          innerValue,
          innerKey
        );
        return valueFn.call(scope, innerValue, innerKey);
      };
    }

    let extendedKeyFn;
    if (options.keyFn) {
      const keyFn = toFunction(options.keyFn);
      extendedKeyFn = async function (innerValue, innerKey) {
        const scope = addValueKeyToScope(
          Scope.getScope(tree),
          innerValue,
          innerKey
        );
        const outerKey = await keyFn.call(scope, innerValue, innerKey);
        return outerKey;
      };
    }

    return createCachedMapTransform({
      description: "@map",
      keyFn: extendedKeyFn,
      valueFn: extendedValueFn,
    })(tree);
  };
}
