import { trailingSlash } from "@weborigami/async-tree";
import { projectGlobals } from "@weborigami/language";

/**
 * Add support for commands prefixed with `!`.
 *
 * E.g., asking this tree for `!yaml` will invoke the yaml() builtin function,
 * passing the current tree as the first argument.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Constructor<AsyncTree>}
 * AsyncTreeConstructor
 *
 * @param {AsyncTreeConstructor} Base
 */
export default function OriCommandTransform(Base) {
  return class OriCommand extends Base {
    async get(key) {
      let value = await super.get(key);

      if (value === undefined) {
        if (
          key === undefined ||
          typeof key !== "string" ||
          !key.startsWith?.("!")
        ) {
          return undefined;
        }

        // Key is an Origami command; invoke it.
        const globals = await projectGlobals();
        const commandName = trailingSlash.remove(key.slice(1).trim());

        // Look for command as a global or Dev command
        const command = globals[commandName] ?? globals.Dev[commandName];
        if (!(command instanceof Function)) {
          throw new Error(`Unknown Origami command: ${commandName}`);
        }

        value = await command(this);
      }

      return value;
    }
  };
}
