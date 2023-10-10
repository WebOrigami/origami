import { Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";
import * as utilities from "../../common/utilities.js";

/**
 * Returns the scope of the indicated graph or the current scope.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {any} [obj]
 */
export default async function getScope(obj) {
  assertScopeIsDefined(this);
  if (obj) {
    /** @type {any}  */
    const graph = Graph.from(obj);
    if (obj.parent) {
      graph.parent = obj.parent;
    }
    return utilities.getScope(graph);
  } else {
    return this;
  }
}

getScope.usage = `@scope/get [<graph>]\tReturns the scope of the graph or the current scope`;
getScope.documentation = "https://graphorigami.org/cli/builtins.html#@scope";
