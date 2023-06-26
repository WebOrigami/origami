/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import extendValueKeyFn from "../../common/extendValueKeyFn.js";
import MapInnerKeysGraph from "../../common/MapInnerKeysGraph.js";
import InheritScopeTransform from "../../framework/InheritScopeTransform.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Wrap a graph and redefine the key used to access nodes in it.
 *
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} variant
 * @param {function} keyFn
 * @param {PlainObject} [options]
 */
export default async function mapKeys(variant, keyFn, options = {}) {
  assertScopeIsDefined(this);
  if (!variant) {
    return undefined;
  }
  const extendedKeyFn = keyFn ? extendValueKeyFn(keyFn) : null;
  const mappedGraph = new (InheritScopeTransform(MapInnerKeysGraph))(
    variant,
    extendedKeyFn,
    options
  );
  if (this) {
    mappedGraph.parent = this;
  }
  return mappedGraph;
}

mapKeys.usage = `mapKeys <graph>\tDefine the key used to get nodes from the graph`;
mapKeys.documentation = "https://graphorigami.org/cli/builtins.html#mapKeys";
