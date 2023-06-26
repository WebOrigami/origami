/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import path from "node:path";

/**
 * This mixin is a companion to ImplicitModulesTransform.
 *
 * ImplicitModulesTransform takes care of loading "foo.js" if a request to load
 * "foo" fails, then returning that module's export as a result. What that mixin
 * doesn't do is expose "foo" as a key, since that might not be desired in cases
 * like a server, which has no need to expose such internal functions on things
 * like a default index page.
 *
 * One case where we *do* want to expose such keys is as commands in the scope
 * used by the Origami CLI. This mixin takes care of that: if a folder contains
 * "foo.js", then this will expose "foo" as a key.
 *
 * @param {Constructor<AsyncDictionary>} Base
 */
export default function CommandsModulesTransform(Base) {
  return class CommandModules extends Base {
    async keys() {
      const keys = new Set(await super.keys());
      for (const key of keys.keys()) {
        // If we find something like "foo.js", then include "foo" as a key.
        if (key.endsWith(".js")) {
          keys.add(path.basename(key, ".js"));
        }
      }
      return keys;
    }
  };
}
