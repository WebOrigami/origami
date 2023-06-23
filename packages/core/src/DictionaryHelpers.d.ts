import type { AsyncDictionary, AsyncMutableDictionary } from "@graphorigami/types";

export default class DictionaryHelpers {
  static clear(AsyncDictionary: AsyncMutableDictionary): Promise<void>;
  static delete(AsyncDictionary: AsyncMutableDictionary, key: any): Promise<boolean>;
  static entries(AsyncDictionary: AsyncDictionary): Promise<IterableIterator<any>>;
  static forEach(AsyncDictionary: AsyncDictionary, callbackfn: (value: any, key: any) => Promise<void>): Promise<void>;
  static getRealmObjectPrototype(object: any): any;
  static has(AsyncDictionary: AsyncDictionary, key: any): Promise<boolean>;
  static isAsyncDictionary(object: any): boolean;
  static isAsyncMutableDictionary(object: any): boolean;
  static isPlainObject(object: any): boolean;
  // static toFunction(graph: GraphVariant): Function;
  static values(AsyncDictionary: AsyncDictionary): Promise<IterableIterator<any>>;
}
