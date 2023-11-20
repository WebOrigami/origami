import { cachedKeyMaps, map } from "@graphorigami/async-tree";
import { toFunction } from "./utilities.js";

export default function arrowFunctionsMap() {
  const deep = true;
  return map({
    deep,
    description: "arrowFunctions",
    valueMap,
    ...cachedKeyMaps(keyMap, deep),
  });
}

function keyMap(sourceKey, tree) {
  return parseArrowKey(sourceKey) ?? sourceKey;
}

// If the key is of the form "lhs←rhs", return "lhs".
// Whitespace between the lhs and the arrow is ignored.
function parseArrowKey(sourceKey) {
  const regex = /^(?<lhs>.+?)\s*←.+$/;
  const match = sourceKey.match(regex);
  return match?.groups.lhs;
}

function valueMap(sourceValue, sourceKey, tree) {
  let resultValue;
  if (parseArrowKey(sourceKey)) {
    // Treat the value as a function to be invoked.
    resultValue = toFunction(sourceValue);
  } else {
    resultValue = sourceValue;
  }
  return resultValue;
}
