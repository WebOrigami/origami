/// <reference path="explorable.ts"/>

export default class ExplorableObject implements Explorable, Storable {
  constructor(obj: any);
  [Symbol.asyncIterator](): AsyncIterableIterator<any>;
  get(...keys: any[]): Promise<any>;
  isKeyValueExplorable(key: string): Promise<boolean>;
  set(...args: any[]): Promise<void>;
}
