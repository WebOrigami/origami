/// <reference path="explorable.ts"/>

export default class ExplorableObject implements Explorable {
  constructor(obj: any);
  [Symbol.asyncIterator](): AsyncIterableIterator<any>;
  get(...keys: any[]): Promise<any>;
  isKeyExplorable(key: any): Promise<boolean>;
  set(...args: any[]): Promise<void>;
}
