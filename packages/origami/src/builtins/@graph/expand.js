import { GraphHelpers } from "@graphorigami/core";
import MapValuesGraph from "../../common/MapValuesGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Expand values that can be treated as graphs into graphs.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} [variant]
 */
export default async function expand(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const expanded = new MapValuesGraph(variant, (value) => expandValue(value), {
    deep: true,
  });
  return expanded;
}

function expandValue(value) {
  let result;
  if (GraphHelpers.isGraphable(value)) {
    try {
      result = GraphHelpers.from(value);
    } catch (error) {
      result = value;
    }
  } else {
    result = value;
  }
  return result;
}

expand.usage = `@graph/expand <graph>\tExpand values that can be treated as graphs`;
expand.documentation = "https://graphorigami.org/cli/builtins.html#@graph";
