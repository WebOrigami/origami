import ExplorableGraph from "../core/ExplorableGraph.js";
import { box, isPlainObject, transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";

/**
 * Helper class for defining a graph of ambient properties.
 *
 * This is simpler than ExplorableObject: it doesn't expose the object's keys,
 * just makes object's values available. It also doesn't support `set`, nor does
 * it wrap returned graphs with its own class.
 */
export class AmbientPropertyGraph {
  constructor(object) {
    if (!isPlainObject(object)) {
      throw new TypeError(
        "Ambient properties must be defined as a plain JavaScript object."
      );
    }
    this.object = object;
  }

  // We define this so that class instances are considered to be explorable, but
  // we don't yield any keys.
  async *[Symbol.asyncIterator]() {}

  async get(key) {
    return this.object[key];
  }
}

/**
 * Compose the given set of ambient properties on top of the given graph. This
 * operation is typically performed on a graph that will be used as a scope.
 *
 * @param {Explorable|null} graph
 * @param {PlainObject} ambientProperties
 */
export function defineAmbientProperties(graph, ambientProperties) {
  // Create a graph of the ambient properties.
  const ambients = new (InheritScopeTransform(AmbientPropertyGraph))(
    ambientProperties
  );
  if (graph) {
    // If graph is defined, make it the parent of the ambient properties graph.
    ambients.parent = graph;
  }

  // Return the extended graph.
  return ambients;
}

/**
 * Convert value into a context graph or object that can take a scope.
 *
 * @param {any} value
 */
export function setScope(value, scope) {
  let result;
  if (ExplorableGraph.isExplorable(value)) {
    result = value;
  } else if (
    typeof value !== "string" &&
    ExplorableGraph.canCastToExplorable(value)
  ) {
    // Convert the value to a graph.
    result = ExplorableGraph.from(value);
    // Apply InheritScopeTransform if necessary so graph can take a scope.
    if (!("parent" in result)) {
      result = transformObject(InheritScopeTransform, result);
    }
  } else {
    // Box the value so that we get an object we can set a scope on.
    result = box(value);
  }

  // Set the result's scope.
  if ("parent" in result) {
    result.parent = scope;
  } else {
    result.scope = scope;
  }

  return result;
}
