/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../core/explorable").Constructor<AsyncDictionary & { import: function }>} BaseConstructor
 * @param {BaseConstructor} Base
 */
export default function ImplicitModulesTransform(Base) {
  return class ImplicitModules extends Base {
    async get(key) {
      const value = await super.get(key);
      if (value !== undefined) {
        return value;
      }

      // See if we have a JS module for the requested key.
      if (key === undefined || key.endsWith?.(".js")) {
        return undefined;
      }

      const moduleKey = `${key}.js`;
      return this.import?.(moduleKey);
    }
  };
}
