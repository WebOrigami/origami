import { get } from "@explorablegraph/symbols";

interface Explorable<Key, Value> {
  [get](key: Key): Value;
  [Symbol.asyncIterator](): AsyncIterableIterator<Key>;
}

export default class AsyncExplorable implements Explorable<any, any> {
  [Symbol.asyncIterator](): AsyncIterableIterator<any>;
  [get](key: any): any;
  static get: string;
  static isExplorable(obj: any): boolean;
  static keys(obj: any): any[];
  static plain(exfn: any): any;
  static structure(exfn: any): any;
  static strings(exfn: any): any;
  static traverse(exfn: any, path: any[]): any;
}