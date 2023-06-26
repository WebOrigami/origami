/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { GraphHelpers } from "@graphorigami/core";
import ShuffleTransform from "../../common/ShuffleTransform.js";
import { transformObject } from "../../core/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return a new graph with the original's keys shuffled
 *
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} [variant]
 */
export default async function shuffle(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = GraphHelpers.from(variant);
  const shuffled = transformObject(ShuffleTransform, graph);
  return shuffled;
}

shuffle.usage = `shuffle <graph>\tReturn a new graph with the original's keys shuffled`;
shuffle.documentation = "https://graphorigami.org/cli/builtins.html#shuffle";
