import MapInnerKeysGraph from "../../common/MapInnerKeysGraph.js";
import InheritScopeTransform from "../../framework/InheritScopeTransform.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Wrap a graph and redefine the key used to access nodes in it.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 *
 * @this {AsyncDictionary|null}
 * @param {Graphable} graphable
 * @param {function} keyFn
 * @param {PlainObject} [options]
 */
export default async function mapKeys(graphable, keyFn, options = {}) {
  assertScopeIsDefined(this);
  if (!graphable) {
    return undefined;
  }
  const mappedGraph = new (InheritScopeTransform(MapInnerKeysGraph))(
    graphable,
    keyFn,
    options
  );
  if (this) {
    mappedGraph.parent = this;
  }
  return mappedGraph;
}

mapKeys.usage = `mapKeys <graph>\tDefine the key used to get nodes from the graph`;
mapKeys.documentation = "https://graphorigami.org/cli/builtins.html#mapKeys";
