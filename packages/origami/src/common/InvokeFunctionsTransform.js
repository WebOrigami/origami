/**
 * When using `get` to retrieve a value from a graph, if the value is a
 * function, invoke it and return the result.
 *
 * @param {Constructor<Explorable>} Base
 */
export default function InvokeFunctionsTransform(Base) {
  return class InvokeFunctions extends Base {
    async get(key) {
      let value = await super.get(key);
      if (typeof value === "function") {
        const scope = this.scope ?? this;
        value = await value.call(scope);
      }
      return value;
    }
  };
}
