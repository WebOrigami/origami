/**
 * When using `get` to retrieve a value from a graph, if the value is a
 * function, invoke it and return the result.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../core/explorable").Constructor<AsyncDictionary>} AsyncDictionaryConstructor
 * @param {AsyncDictionaryConstructor} Base
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
