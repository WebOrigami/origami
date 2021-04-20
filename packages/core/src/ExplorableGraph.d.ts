export default class ExplorableGraph {
  [Symbol.asyncIterator](): AsyncIterableIterator<any>;
  get(...keys: any[]): Promise<any>;
  keys(): Promise<any[]>;
  mapValues(mapFn: (any) => any): Promise<any>;
  plain(): Promise<any>;
  strings(): Promise<any>;
  structure(): Promise<any>;
  traverse(fn: (extendedRoute, interior, value) => Promise<void>): Promise<void>;
}
