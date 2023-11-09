import { cachedKeyFns, mapTransform } from "@graphorigami/async-tree";
import { toFunction } from "./utilities.js";

export default function arrowFunctionsMap() {
  const deep = true;
  return mapTransform({
    deep,
    description: "arrowFunctions",
    valueFn,
    ...cachedKeyFns(keyFn, deep),
  });
}

function keyFn(innerKey, tree) {
  return parseArrowKey(innerKey) ?? innerKey;
}

// If the key is of the form "lhs←rhs", return "lhs".
// Whitespace between the lhs and the arrow is ignored.
function parseArrowKey(innerKey) {
  const regex = /^(?<lhs>.+?)\s*←.+$/;
  const match = innerKey.match(regex);
  return match?.groups.lhs;
}

function valueFn(innerValue, innerKey, tree) {
  let outerValue;
  if (parseArrowKey(innerKey)) {
    // Treat the value as a function to be invoked.
    outerValue = toFunction(innerValue);
  } else {
    outerValue = innerValue;
  }
  return outerValue;
}
