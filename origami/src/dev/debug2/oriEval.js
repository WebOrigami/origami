import { trailingSlash, Tree } from "@weborigami/async-tree";
import { evaluate } from "@weborigami/language";
import debugTransform from "./debugTransform.js";

const mapParentToResult = new WeakMap();

/**
 * Return a route that evaluates a key containing an expression.
 *
 * Because this route may be used multiple times to return the resources for a
 * page, we cache the result for each parent and key.
 *
 * To allow multiple evaluations of the same expression, we expect the key to be
 * of the form `<counter>,<expression>`, where the counter is a number that will
 * be used for caching but ignored for evaluation. The debugger increments the
 * counter to force reevaluation of the same expression.
 */
export default async function oriEval(parent) {
  return async (key) => {
    const normalizedKey = trailingSlash.remove(key);
    let result = mapParentToResult.get(parent);
    if (result?.key === normalizedKey) {
      return result.value;
    }

    const regex = /^\d+,(?<expression>.*)$/;
    const match = normalizedKey.match(regex);
    let value;
    if (match) {
      const expression = decodeURIComponent(match.groups.expression);
      value = await evaluate(expression, { parent });
      if (
        (Tree.isMaplike(value) && typeof value !== "function") ||
        value?.unpack
      ) {
        value = debugTransform(value);
      }
    }

    mapParentToResult.set(parent, { key: normalizedKey, value });

    return value;
  };
}
