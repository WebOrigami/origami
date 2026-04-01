import { AsyncLocalStorage } from "node:async_hooks";

/**
 * A graph of the dependencies: source path -> [...imported paths]
 */
export const graph = new Map();

/**
 * For determining current execution context when reading files
 */
export const storage = new AsyncLocalStorage();
