export default function ImplicitExportsMixin(Base) {
  return class ImplicitExports extends Base {
    async get(...keys) {
      const value = await super.get(...keys);
      if (value !== undefined) {
        return value;
      }

      // See if we have a JS module for the requested key.
      const lastKey = keys.pop();

      // Don't define an value if the key is a formula.
      if (lastKey.includes("=")) {
        return undefined;
      }

      const commandKey = `${lastKey}.js`;
      keys.push(commandKey);
      return await super.get(...keys);
    }
  };
}
