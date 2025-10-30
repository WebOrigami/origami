import * as fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { maybeOrigamiSourceCode } from "./errors.js";
import * as moduleCache from "./moduleCache.js";

/**
 * @typedef {import("@weborigami/async-tree").AsyncMap} AsyncMap
 * @typedef {import("../../index.ts").Constructor<AsyncMap & { dirname: string }>} BaseConstructor
 * @param {BaseConstructor} Base
 */
export default function ImportModulesMixin(Base) {
  return class ImportModules extends Base {
    async import(...keys) {
      const filePath = path.join(this.dirname, ...keys);
      // On Windows, absolute paths must be valid file:// URLs.
      const fileUrl = pathToFileURL(filePath);
      // Add cache-busting timestamp
      const modulePath =
        fileUrl.href + `?cacheBust=${moduleCache.getTimestamp()}`;

      // Try to load the module.
      let object;
      try {
        object = await import(modulePath);
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

      // Cast from an exotic module namespace object to a plain object.
      return { ...object };
    }
  };
}
