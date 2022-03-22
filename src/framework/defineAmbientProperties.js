import ExplorableObject from "../core/ExplorableObject.js";
import IdentityGraph from "../core/IdentityGraph.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "./InheritScopeTransform.js";

/**
 * Extend the scope of the given graph to include the given ambient properties.
 *
 * @param {Explorable} graph
 * @param {PlainObject} ambientProperties
 */
export default function defineAmbientProperties(graph, ambientProperties) {
  // Create a graph of the ambient properties.
  const ambients = new (InheritScopeTransform(ExplorableObject))(
    ambientProperties
  );

  // If the original graph has a scope, we're going to insert the ambients in
  // the scope between (a copy of) the original graph and original scope.
  const scope = /** @type {any} */ (graph).scope;
  if (scope && scope !== graph) {
    ambients.parent = scope;
  }

  // We don't want to destroy the original graph's scope, so we make a copy of
  // the graph. We then add the ambients (and any original scope) as a parent of
  // the copy, thereby setting a new scope.
  const extended = transformObject(InheritScopeTransform, IdentityGraph(graph));
  extended.parent = ambients;

  // Return the extended graph with its new scope.
  return extended;
}
