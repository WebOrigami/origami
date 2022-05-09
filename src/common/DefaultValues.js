import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Given a main graph of arbitrary depth, and a shallow secondary graph of
 * default values, this returns values as usual from the main graph. If a
 * requested key is missing from the main graph, but exists in the default
 * values graph, the value will be returned from that graph.
 */
export default class DefaultValues {
  constructor(graph, defaults) {
    this.graph = ExplorableGraph.from(graph);
    this.defaults = ExplorableGraph.from(defaults);
  }

  async *[Symbol.asyncIterator]() {
    // Yield the graph's keys, not the defaults.
    yield* this.graph;
  }

  async get(key) {
    // Try main graph first.
    let value = await this.graph.get(key);
    if (value !== undefined || !this.defaults) {
      if (ExplorableGraph.isExplorable(value)) {
        value = Reflect.construct(this.constructor, [value, this.defaults]);
      }
      return value;
    }

    // See if we have a default value for this key.
    const defaultValue = await this.defaults.get(key);
    if (!(defaultValue instanceof Function)) {
      // Either we have a fixed default value, or we don't have a default. In
      // either case, return that.
      return defaultValue;
    }

    // We have a default value function; give it the graph to work on.
    value = defaultValue.call(this.graph);

    return value;
  }

  get listeningForChanges() {
    return /** @type {any} */ (this.graph).listeningForChanges;
  }
  set listeningForChanges(listeningForChanges) {
    /** @type {any} */ (this.graph).listeningForChanges = listeningForChanges;
  }

  onChange(eventType, fileName) {
    /** @type {any} */ (this.graph).onChange?.(eventType, fileName);
  }

  get scope() {
    return /** @type {any} */ (this.graph).scope;
  }
}
