import { get } from "./symbols.js";

interface Explorable<Key, Value> {
  [get](key: Key): Value;
  [Symbol.asyncIterator](): AsyncIterableIterator<Key>;
}

export default class AsyncExplorable implements Explorable<any, any> {
  static get: string;
  [get](key: any): any;
  static isExplorable(obj: any): boolean;
  static keys(obj: any): any[];
  [Symbol.asyncIterator](): AsyncIterableIterator<any>;
  static traverse(exfn: any, path: any[]): any;
}