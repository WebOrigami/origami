export default function ImplicitModulesTransform(Base) {
  return class ImplicitModules extends Base {
    async get(key) {
      const value = await super.get(key);
      if (value !== undefined) {
        return value;
      }

      // See if we have a JS module for the requested key.
      if (key.endsWith?.(".js")) {
        return undefined;
      }

      const moduleKey = `${key}.js`;
      return this.import?.(moduleKey);
    }
  };
}
