/// <reference path="../core/explorable.ts"/>

export default class FilesGraph extends EventTarget implements Explorable {
  constructor(dirname: string);
  dirname: string;
  get(...keys: any[]): Promise<any>;
  isKeyExplorable(key: any): Promise<boolean>;
  keys(): Promise<IterableIterator<any>>;
  set(...args: any[]): Promise<void>;
  unwatch(): Promise<void>;
  watch(): Promise<void>;
}