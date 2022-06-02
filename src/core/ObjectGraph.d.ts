/// <reference path="explorable.ts"/>

export default class ObjectGraph implements Explorable {
  constructor(obj: PlainObject | Array<any>);
  [Symbol.asyncIterator](): AsyncIterableIterator<any>;
  get(key: any): Promise<any>;
  isKeyExplorable(key: any): Promise<boolean>;
  set(key: any, value: any): Promise<void>;
  set(variant: GraphVariant): Promise<void>;
}
