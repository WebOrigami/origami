import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Storage maintained by the execute() function and accessible to async
 * functions called during evaluation.
 */
export default new AsyncLocalStorage();
