/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import ExplorableGraph from "../../core/ExplorableGraph.js";

/**
 * Return true if the value is explorable
 *
 * @this {AsyncDictionary|null}
 * @param {any} value
 */
export default function isExplorable(value) {
  return ExplorableGraph.isExplorable(value);
}

isExplorable.usage = `@graph/isExplorable <value>\tReturn true if value is explorable`;
isExplorable.documentation =
  "https://graphorigami.org/cli/builtins.html#isExplorable";
