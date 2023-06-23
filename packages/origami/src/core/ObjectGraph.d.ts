/// <reference path="explorable.ts"/>

export default class ObjectGraph implements Explorable {
  constructor(obj: PlainObject | Array<any>);
  get(key: any): Promise<any>;
  isKeyExplorable(key: any): Promise<boolean>;
  keys(): Promise<IterableIterator<any>>;
  set(key: any, value: any): Promise<void>;
  set(variant: GraphVariant): Promise<void>;
}
