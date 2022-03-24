import Compose from "../common/Compose.js";
import { isPlainObject } from "../core/utilities.js";

/**
 * Compose the given set of ambient properties on top of the given graph. This
 * operation is typically performed on a graph that will be used as a scope.
 *
 * @param {Explorable|null} graph
 * @param {PlainObject} ambientProperties
 */
export default function defineAmbientProperties(graph, ambientProperties) {
  // Create a graph of the ambient properties.
  const ambients = new AmbientPropertyGraph(ambientProperties);

  // If graph is defined, compose the ambients with it.
  const extended = graph ? new Compose(ambients, graph) : ambients;

  // Return the extended graph.
  return extended;
}

/**
 * Helper class for defining a graph of ambient properties.
 *
 * This is simpler than ExplorableObject: it doesn't expose the object's keys,
 * just makes object's values available. It also doesn't support `set`, nor does
 * it wrap returned graphs with its own class.
 */
class AmbientPropertyGraph {
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
