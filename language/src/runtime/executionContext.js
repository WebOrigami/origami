import { AsyncLocalStorage } from "node:async_hooks";

/**
 * The execute() function's context made available to async functions called
 * during evaluation.
 */
export default new AsyncLocalStorage();
