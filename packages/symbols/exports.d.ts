// Declare symbols as strings until TypeScript releases support for symbols as
// indexers.
export const asyncGet = "_asynGet";
export const asyncKeys = Symbol.asyncIterator;
export const get = "_get";
export const keys = Symbol.iterator;
