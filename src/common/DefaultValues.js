import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Given a main graph of arbitrary depth, and a shallow secondary graph of
 * default values, this returns values as usual from the main graph. If a
 * requested key is missing from the main graph, but exists in the default
 * values graph, the value will be returned from that graph.
 */
export default class DefaultValues {
  constructor(graph, defaults) {
    this.original = ExplorableGraph.from(graph);
    this.graph = this.original;
    this.defaults = ExplorableGraph.from(defaults);
  }

  async allKeys() {
    const graphAllKeys = /** @type {any} */ (this.graph).allKeys;
    const keys = graphAllKeys
      ? await graphAllKeys.call(this.graph)
      : await ExplorableGraph.keys(this.graph);
    return keys;
  }

  async *[Symbol.asyncIterator]() {
    // Yield the graph's keys, not the defaults.
    yield* this.graph;
  }

  async get(key) {
    return this.traverse(key);
  }

  get parent() {
    return /** @type {any} */ (this.graph).parent;
  }
  set parent(parent) {
    // Avoid destructive modification of the underlying graph.
    this.graph = Object.create(this.original);
    /** @type {any} */ (this.graph).parent = parent;
  }

  get scope() {
    return /** @type {any} */ (this.graph).scope;
  }
  set scope(scope) {
    /** @type {any} */ (this.graph).scope = scope;
  }

  async traverse(...keys) {
    // Start our traversal at the root of the graph.
    let value = this.graph;

    // Process each key in turn.
    for (const key of keys) {
      if (value === undefined) {
        // Can't traverse further
        break;
      }

      // If the value isn't already explorable, cast it to an explorable graph.
      // If someone is trying to traverse this thing, they mean to treat it as
      // an explorable graph.
      const graph = ExplorableGraph.from(value);

      // Ask the graph if it has the key.
      value = await graph.get(key);

      if (value === undefined) {
        // The graph doesn't have the key; try the defaults.
        const defaultValue = await this.defaults.get(key);
        value =
          defaultValue instanceof Function
            ? await defaultValue.call(graph)
            : defaultValue;
      }
    }

    // If the value we're returning is a graph, or convertible to a graph, wrap
    // it in a DefaultValues instance so that it can provide default values.
    if (ExplorableGraph.isExplorable(value)) {
      value = Reflect.construct(this.constructor, [value, this.defaults]);
    } else if (value?.toGraph) {
      // If the value isn't a graph, but has a graph attached via a `toGraph`
      // method, wrap the toGraph method to provide default values for it.
      const original = value.toGraph.bind(value);
      value.toGraph = () => {
        const graph = original();
        return Reflect.construct(this.constructor, [graph, this.defaults]);
      };
    }

    return value;
  }

  async unwatch() {
    return /** @type {any} */ (this.graph).unwatch?.();
  }
  async watch() {
    await /** @type {any} */ (this.graph).watch?.();
  }
}
