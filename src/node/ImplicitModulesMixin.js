import path from "path";

export default function ImplicitModulesMixin(Base) {
  if (!Base.prototype.import) {
    // Base class can't do imports; skip mixin application.
    return Base;
  }

  return class ImplicitModules extends Base {
    async get(...keys) {
      const value = await super.get(...keys);
      if (value !== undefined) {
        return value;
      }

      // See if we have a JS module for the requested key.
      const lastKey = keys.pop();
      if (!path || lastKey.endsWith(".js")) {
        return undefined;
      }

      const moduleKey = `${lastKey}.js`;
      keys.push(moduleKey);

      return this.import(...keys);
    }
  };
}
