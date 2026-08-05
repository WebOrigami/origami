import { trailingSlash, Tree } from "@weborigami/async-tree";
import { evaluate, getGlobalsForTree } from "@weborigami/language";
import debugTransform from "./debugTransform.js";

/**
 * Return a route that evaluates a key containing an expression.
 */
export default async function oriEval(parent) {
  const globals = getGlobalsForTree(parent);
  return async (key) => {
    const normalizedKey = trailingSlash.remove(key);
    const expression = decodeURIComponent(normalizedKey);

    let value = await evaluate(expression, {
      globals,
      mode: "shell",
      parent,
    });

    if (
      (Tree.isMaplike(value) && typeof value !== "function") ||
      value?.unpack
    ) {
      value = debugTransform(value);
    }

    return value;
  };
}
