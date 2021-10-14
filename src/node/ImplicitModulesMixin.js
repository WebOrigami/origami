import path from "path";
import { pathToFileURL } from "url";

export default function ImplicitModulesMixin(Base) {
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
      const filePath = path.join(this.dirname, ...keys);
      // On Windows, absolute paths must be valid file:// URLs.
      const fileUrl = pathToFileURL(filePath);

      // Try to load the module.
      const module = await importModule(fileUrl.href);

      // If the module loaded and defines a default export, return that.
      // Otherwise return the module (which may be undefined).
      return module?.default ?? module;
    }
  };
}

async function importModule(modulePath) {
  let obj;
  try {
    obj = await import(modulePath);
  } catch (/** @type {any} */ error) {
    if (error.code !== "ERR_MODULE_NOT_FOUND") {
      throw error;
    }
  }
  return obj;
}
