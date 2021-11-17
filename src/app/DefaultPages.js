import ExplorableGraph from "../core/ExplorableGraph.js";
import ExplorableObject from "../core/ExplorableObject.js";
import defaultIndexHtml from "./defaultIndexHtml.js";
import defaultKeysJson from "./defaultKeysJson.js";

/**
 * Given a main graph of arbitrary depth, and a shallow secondary graph of
 * default values, this returns values as usual from the main graph. If a
 * requested key is missing from the main graph, but exists in the default
 * values graph, the value will be returned from that graph.
 */
export default class DefaultPages {
  constructor(graph, defaults) {
    this.graph = ExplorableGraph.from(graph);
    this.defaults =
      defaults ??
      new ExplorableObject({
        ".index": defaultIndexHtml,
        ".keys.json": defaultKeysJson,
        "index.html": defaultIndexHtml,
      });
  }

  async *[Symbol.asyncIterator]() {
    // Only keys from the main graph are returned.
    yield* this.graph[Symbol.asyncIterator]();
  }

  async get2(...keys) {
    // Try main graph first.
    let value = await this.graph.get2(...keys);
    if (value !== undefined) {
      return value;
    }

    // Find route to subgraph that would hold the last key.
    const lastKey = keys.pop();
    if (lastKey === undefined) {
      return undefined; // Nothing to get.
    }

    // See if we have a default value for this last key.
    const defaultValue = await this.defaults.get2(lastKey);
    if (!(defaultValue instanceof Function)) {
      // Either we have a fixed default value, or we don't have a default. In
      // either case, return that.
      return defaultValue;
    }

    // We have a default value function; give it the subgraph to work on.
    let subgraph =
      keys.length === 0 ? this.graph : await this.graph.get2(...keys);
    if (subgraph === undefined) {
      return undefined; // Can't find subgraph.
    }

    // TODO: Rethink where this check for Buffer happens.
    // if (subgraph instanceof Buffer) {
    //   subgraph = subgraph.toString();
    // }

    // Bind to subgraph and invoke.
    value = defaultValue.call(subgraph);

    return value;
  }

  get path() {
    return /** @type {any} */ (this.graph).path;
  }
}
