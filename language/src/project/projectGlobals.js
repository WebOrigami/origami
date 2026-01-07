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
    Object.assign(globals, config);
  }

  return globals;
}
