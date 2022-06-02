/// <reference path="explorable.ts"/>

export default class ObjectGraph implements Explorable {
  constructor(obj: PlainObject | Array<any>);
  [Symbol.asyncIterator](): AsyncIterableIterator<any>;
  get(...keys: any[]): Promise<any>;
  isKeyExplorable(key: any): Promise<boolean>;
  set(...args: any[]): Promise<void>;
}
