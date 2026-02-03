import { interop } from "@weborigami/async-tree";
import asyncStorage from "./asyncStorage.js";
import { lineInfo } from "./errors.js";

/**
 * Inject our warning function into async-tree calls
 */
interop.warn = function warn(...args) {
  console.warn(...args);
  const context = asyncStorage.getStore();
  const location = context?.code?.location;
  if (location) {
    console.warn(lineInfo(location));
  }
};
