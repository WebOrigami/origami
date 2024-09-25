import * as fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { maybeOrigamiSourceCode } from "./formatError.js";

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
        try {
          await fs.stat(filePath);
        } catch (error) {
          // File doesn't exist
          return undefined;
        }

        // Module exists, but we can't load it. Is the error internal?
        if (maybeOrigamiSourceCode(error.message)) {
          throw new Error(
            `Internal Origami error loading ${filePath}\n${error.message}`
          );
        }

        // Error may be a syntax error, so we offer that as a hint.
        const message = `Error loading ${filePath}, possibly due to a syntax error.\n${error.message}`;
        throw new SyntaxError(message);
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
