/**
 * Given a main graph of arbitrary depth, and a shallow secondary graph of
 * default values, this returns values as usual from the main graph. If a
 * requested key is missing from the main graph, but exists in the default
 * values graph, the value will be returned from that graph.
 */
export default function DefaultValuesTransform(Base) {
  return class DefaultValues extends Base {
    constructor(...args) {
      super(...args);
      this.defaults = {};
    }

    async get(key) {
      // Ask the graph if it has the key.
      let value = await super.get(key);

      if (value === undefined) {
        // The graph doesn't have the key; try the defaults.
        const defaultValue = await this.defaults[key];
        value =
          defaultValue instanceof Function
            ? await defaultValue.call(this)
            : defaultValue;
      }

      if (value?.defaults) {
        Object.assign(value.defaults, this.defaults);
      }

      if (value?.toGraph) {
        // If the value isn't a graph, but has a graph attached via a `toGraph`
        // method, wrap the toGraph method to provide default values for it.
        const original = value.toGraph.bind(value);
        value.toGraph = () => {
          const graph = original();
          return Reflect.construct(this.constructor, [graph]);
        };
      }

      return value;
    }
  };
}
