import * as fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Constructor<AsyncTree & { dirname: string }>} BaseConstructor
 * @param {BaseConstructor} Base
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
          // Module exists, but we can't load it. This is often due to a syntax
          // error in the target module, so we offer that as a hint.
          const message = `Error loading ${filePath}, possibly due to a syntax error.\n${error.message}`;
          throw new SyntaxError(message);
        }

        // Module doesn't exist.
        return undefined;
      }

      if ("default" in obj) {
        // Module with a default export; return that.
        return obj.default;
      } else {
        // Module with multiple named exports. Cast from a module namespace
        // object to a plain object.
        return { ...obj };
      }
    }
  };
}
