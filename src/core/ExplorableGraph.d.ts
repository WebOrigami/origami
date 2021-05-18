export default class ExplorableGraph {
  constructor();
  [Symbol.asyncIterator](): AsyncIterableIterator<any>;
  get(...keys: any[]): Promise<any>;
  keys(): Promise<any[]>;
  mapValues(mapFn: (any) => any): Promise<any>;
  plain(): Promise<any>;
  resolve(value:any, path:any[]): Promise<any>;
  strings(): Promise<any>;
  structure(): Promise<any>;
  traverse(fn: (extendedRoute, interior, value) => Promise<void>): Promise<void>;
}
