import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Given a main graph of arbitrary depth, and a shallow secondary graph of
 * default values, this returns values as usual from the main graph. If a
 * requested key is missing from the main graph, but exists in the default
 * values graph, the value will be returned from that graph.
 */
export default function DefaultValuesMixin(Base) {
  return class DefaultValues extends Base {
    #defaults;

    get defaults() {
      return this.#defaults;
    }
    set defaults(defaults) {
      this.#defaults = ExplorableGraph.from(defaults);
    }

    async get(...keys) {
      // Try main graph first.
      let value = await super.get(...keys);
      if (value !== undefined) {
        return value;
      }

      // Find route to subgraph that would hold the last key.
      const lastKey = keys.pop();
      if (lastKey === undefined) {
        return undefined; // Nothing to get.
      }

      // See if we have a default value for this last key.
      const defaultValue = await this.defaults.get(lastKey);
      if (!(defaultValue instanceof Function)) {
        // Either we have a fixed default value, or we don't have a default. In
        // either case, return that.
        return defaultValue;
      }

      // We have a default value function; give it the subgraph to work on.
      let subgraph = keys.length === 0 ? this : await this.get(...keys);
      if (subgraph === undefined) {
        return undefined; // Can't find subgraph.
      }

      // TODO: Rethink where this check for Buffer happens.
      // if (subgraph instanceof Buffer) {
      //   subgraph = subgraph.toString();
      // }

      // Bind to subgraph and invoke.
      value = defaultValue.call(subgraph);

      // TODO: Use Reflect.construct

      return value;
    }
  };
}
