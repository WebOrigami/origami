import extendValueKeyFn from "../../common/extendValueKeyFn.js";
import MapExtensionsGraph from "../../common/MapExtensionsGraph.js";
import MapValuesGraph from "../../common/MapValuesGraph.js";
import InheritScopeTransform from "../../framework/InheritScopeTransform.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Map the top-level values of a graph with a map function.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 * @typedef {import("../../core/explorable").Invocable} Invocable
 *
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} variant
 * @param {Invocable} mapFn
 * @param {PlainObject} options
 */
export default function map(variant, mapFn, options = {}) {
  assertScopeIsDefined(this);
  if (!variant) {
    return undefined;
  }

  const extendedMapFn = extendValueKeyFn(mapFn, options);

  /** @type {any} */
  const GraphClass =
    options.extension === undefined ? MapValuesGraph : MapExtensionsGraph;
  const mappedGraph = new (InheritScopeTransform(GraphClass))(
    variant,
    extendedMapFn,
    options
  );
  if (this) {
    mappedGraph.parent = this;
  }
  return mappedGraph;
}

map.usage = `map <graph, fn>\tMap the top-level values in a graph`;
map.documentation = "https://graphorigami.org/cli/builtins.html#map";
