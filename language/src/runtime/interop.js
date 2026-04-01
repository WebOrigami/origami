import { interop } from "@weborigami/async-tree";
import { lineInfo } from "./errors.js";
import executionContext from "./executionContext.js";

/**
 * Inject our warning function into async-tree calls
 */
interop.warn = function warn(...args) {
  console.warn(...args);
  const context = executionContext.getStore();
  const location = context?.code?.location;
  if (location) {
    console.warn(lineInfo(location));
  }
};
