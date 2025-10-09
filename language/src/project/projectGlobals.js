import coreGlobals from "./coreGlobals.js";
import projectConfig from "./projectConfig.js";

let globals;

// Core globals plus project config
export default async function projectGlobals() {
  if (!globals) {
    globals = {
      ...(await coreGlobals()),
      ...(await projectConfig()),
    };
  }

  return globals;
}
