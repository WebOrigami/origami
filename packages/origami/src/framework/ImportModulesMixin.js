import * as fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * @param {Constructor<Explorable & { dirname: string }>} Base
 */
export default function ImportModulesMixin(Base) {
  return class ImportModules extends Base {
    async import(...keys) {
      const filePath = path.join(this.dirname, ...keys);
      // On Windows, absolute paths must be valid file:// URLs.
      const fileUrl = pathToFileURL(filePath);
      const modulePath = fileUrl.href;

      // Try to load the module.
      let obj;
      try {
        obj = await import(modulePath);
      } catch (/** @type {any} */ error) {
        if (error.code !== "ERR_MODULE_NOT_FOUND") {
          throw error;
        }

        // Does the module exist as a file?
        let stats;
        try {
          stats = await fs.stat(filePath);
        } catch (error) {
          // Ignore errors.
        }
        if (stats) {
          // Module exists, but we can't load it, probably due to a syntax error.
          throw new SyntaxError(`Error loading ${filePath}`);
        }

        // Module doesn't exist.
        return undefined;
      }

      // If the module loaded and defines a default export, return that, otherwise
      // return the overall module.
      return obj?.default ?? obj;
    }
  };
}
