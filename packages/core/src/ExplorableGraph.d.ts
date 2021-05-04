export default class ExplorableGraph {
  constructor(obj?: any);
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

export class ExplorableObject extends ExplorableGraph {
  constructor(obj: any);
  set(...args: any[]): Promise<void>;
}