import assignPropertyDescriptors from "../runtime/assignPropertyDescriptors.js";
import coreGlobals from "./coreGlobals.js";
import projectConfig from "./projectConfig.js";

let globals;

// Core globals plus project config
export default async function projectGlobals(dir = process.cwd()) {
  if (!globals) {
    // Start with core globals
    globals = await coreGlobals();

    // Now get config. The config.ori file may require access to globals,
    // which will obtain the core globals set above. Once we've got the
    // config, we add it to the globals.
    const config = await projectConfig(dir);

    // Merge config into globals, taking care to avoid invoking property getters.
    assignPropertyDescriptors(globals, config);
  }

  return globals;
}
