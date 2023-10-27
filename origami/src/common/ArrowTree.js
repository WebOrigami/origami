import InvokeFunctionsTransform from "./InvokeFunctionsTransform.js";
import MapKeysValuesTree from "./MapKeysValuesTree.js";

export default class ArrowTree extends InvokeFunctionsTransform(
  MapKeysValuesTree
) {
  constructor(treelike, options = {}) {
    super(treelike, getAttachedFunction, options);
  }

  async innerKeyForOuterKey(outerKey) {
    for (const key of await this.tree.keys()) {
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
    // TODO: Use utilities.toFunction
    return value?.unpack?.() ?? value;
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
