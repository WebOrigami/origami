import path from "path";

export default function CommandsModulesMixin(Base) {
  return class CommandModules extends Base {
    async *[Symbol.asyncIterator]() {
      for await (const key of super[Symbol.asyncIterator]()) {
        if (key.endsWith(".js")) {
          yield path.basename(key, ".js");
        }
      }
    }

    async get(...keys) {
      // See if we have a JS module for the requested key.
      const lastKey = keys.pop();
      const commandKey = `${lastKey}.js`;
      keys.push(commandKey);
      return await super.get(...keys);
    }
  };
}
