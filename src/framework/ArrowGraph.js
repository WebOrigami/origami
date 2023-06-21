import FileLoadersTransform from "../common/FileLoadersTransform.js";
import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import InvokeFunctionsTransform from "../common/InvokeFunctionsTransform.js";
import MapKeysValuesGraph from "../core/MapKeysValuesGraph.js";
import InheritScopeTransform from "./InheritScopeTransform.js";

export default class ArrowGraph extends InheritScopeTransform(
  FileLoadersTransform(
    InvokeFunctionsTransform(ImplicitModulesTransform(MapKeysValuesGraph))
  )
) {
  constructor(variant, options = {}) {
    super(variant, getAttachedFunction, options);
  }

  async import(key) {
    return this.graph?.import?.(key);
  }

  async innerKeyForOuterKey(outerKey) {
    for (const key of await this.graph.keys()) {
      if (parseArrowKey(key) === outerKey) {
        return key;
      }
    }
    return outerKey;
  }

  async outerKeyForInnerKey(innerKey) {
    return parseArrowKey(innerKey) ?? innerKey;
  }
}

// If the value has an attached function, return it.
function getAttachedFunction(value, outerKey, innerKey) {
  if (outerKey !== innerKey && parseArrowKey(innerKey)) {
    return value?.toFunction?.() ?? value;
  } else {
    return value;
  }
}

// If the key is of the form "lhs←rhs", return "lhs".
// Whitespace between the lhs and the arrow is ignored.
function parseArrowKey(key) {
  const regex = /^(?<lhs>.+?)\s*←.+$/;
  const match = key.match(regex);
  return match?.groups.lhs;
}
