import executionContext from "../runtime/executionContext.js";
import coreGlobals from "./coreGlobals.js";

/**
 * This returns the globals present in the current execution context; if none
 * are defined, this falls back to the core globals.
 */
export default async function initializeGlobalsFromContext() {
  const context = executionContext.getStore();
  return context?.globals ?? (await coreGlobals());
}
