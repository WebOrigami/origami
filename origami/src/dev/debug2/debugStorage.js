import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Storage maintained by async debugging functions
 */
export default new AsyncLocalStorage();
