import assignPropertyDescriptors from "../runtime/assignPropertyDescriptors.js";
import coreGlobals from "./coreGlobals.js";
import projectConfig from "./projectConfig.js";

let globals;

/**
 * Return the complete set of globals available to code running in the given
 * container. This will be the core globals plus any configuration specified in
 * the project's config.ori file.
 *
 * @typedef {import("@weborigami/async-tree").SyncOrAsyncMap} SyncOrAsyncMap
 * @param {SyncOrAsyncMap|null} parent
 */
export default async function projectGlobals(parent) {
  if (!globals) {
    // Start with core globals
    globals = await coreGlobals();

    if (parent) {
      // Get config for the given container and add it to the globals.
      const config = await projectConfig(parent);

      // Merge config into globals; don't invoke property getters.
      assignPropertyDescriptors(globals, config);
    }
  }

  return globals;
}
