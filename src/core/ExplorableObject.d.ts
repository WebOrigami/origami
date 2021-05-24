/// <reference path="explorable.ts"/>

export default class ExplorableObject implements Explorable, Storable {
  constructor(obj: any);
  [Symbol.asyncIterator](): AsyncIterableIterator<any>;
  static explore(obj): Explorable;
  get(...keys: any[]): Promise<any>;
  set(...args: any[]): Promise<void>;
}
