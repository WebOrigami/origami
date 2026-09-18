/**
 * This module serves as the internal entry point for some critical files in the
 * library to manually resolve circular dependencies. The core issue is that
 * `from()` depends on various Map classes, including classes that `extend
 * SyncMap`. SyncMap in turn has methods that depend on `from()`. It's that
 * `extend SyncMap` that causes the circular dependency -- JavaScript needs
 * SyncMap to be fully defined before any class can extend it.
 *
 * We can break this circular dependency by having an internal entry point that
 * ensures `from()` and the Map classes are loaded in a controlled order.
 */

// from() imports classes but doesn't use any of them until it's called
export { default as from } from "./operations/from.js";

// These base classes depend on things that depend on from()
export { default as AsyncMap } from "./drivers/AsyncMap.js";
export { default as SyncMap } from "./drivers/SyncMap.js";

// And finally these classes depend on SyncMap
export { default as FunctionMap } from "./drivers/FunctionMap.js";
export { default as ObjectMap } from "./drivers/ObjectMap.js";
export { default as SetMap } from "./drivers/SetMap.js";
