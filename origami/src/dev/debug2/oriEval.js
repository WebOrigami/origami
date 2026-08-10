import { trailingSlash } from "@weborigami/async-tree";
import { evaluate, getGlobalsForTree } from "@weborigami/language";
import * as Dev from "../dev.js";
import debugValue from "./debugValue.js";

/**
 * Return a route that evaluates a key containing an expression.
 */
export default async function oriEval(parent) {
  const globals = getGlobalsForTree(parent);

  // Also add the Dev globals
  Object.assign(globals, Dev);

  return async (key) => {
    const normalizedKey = trailingSlash.remove(key);
    const expression = decodeURIComponent(normalizedKey);

    let value = await evaluate(expression, {
      globals,
      mode: "shell",
      parent,
    });

    value = await debugValue(value);

    return value;
  };
}
