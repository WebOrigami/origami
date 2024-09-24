import { trailingSlash } from "@weborigami/async-tree";
import path from "node:path";

/**
 * This mixin can be used to turn a collection of .js modules in a folder into a collection
 * of commands. For every module `foo.js`, the tree will expose a key `foo` with the value
 * of the module's export(s).
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Constructor<AsyncTree & { import: function }>} BaseConstructor
 * @param {BaseConstructor} Base
 */
export default function CommandsModulesTransform(Base) {
  return class CommandModules extends Base {
    async get(key) {
      const value = await super.get(key);
      if (value !== undefined) {
        return value;
      }

      // See if we have a JS module for the requested key.
      key = trailingSlash.remove(key);
      if (key === undefined || key.endsWith?.(".js")) {
        return undefined;
      }

      const moduleKey = `${key}.js`;
      return this.import?.(moduleKey);
    }

    async keys() {
      const keys = Array.from(await super.keys());
      // If we find a key like "foo.js", then return "foo" as the key.
      return keys.map((key) =>
        key.endsWith(".js") ? path.basename(key, ".js") : key
      );
    }
  };
}
