export default function ImplicitModulesMixin(Base) {
  return class ImplicitModules extends Base {
    async get2(key) {
      const value = await super.get2(key);
      if (value !== undefined) {
        return value;
      }

      // See if we have a JS module for the requested key.
      if (key.endsWith(".js")) {
        return undefined;
      }

      const moduleKey = `${key}.js`;
      return this.import?.(moduleKey);
    }
  };
}
