import assignPropertyDescriptors from "../runtime/assignPropertyDescriptors.js";
import coreGlobals from "./coreGlobals.js";
import projectConfig from "./projectConfig.js";

let globals;

/**
 * Return the complete set of globals available to code running in the
 * given folder. This will be the core globals plus any configuration
 * specified in the project's config.ori file.
 *
 * @param {string|null} dirname
 */
export default async function projectGlobals(dirname) {
  if (!globals) {
    // Start with core globals
    globals = await coreGlobals();

    if (dirname) {
      // Get config for the given folder and add it to the globals.
      const config = await projectConfig(dirname);

      // Merge config into globals; don't invoke property getters.
      assignPropertyDescriptors(globals, config);
    }
  }

  return globals;
}
