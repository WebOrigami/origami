/// <reference path="../core/explorable.ts"/>

export default class FilesGraph implements Explorable {
  constructor(dirname: string);
  [Symbol.asyncIterator](): AsyncIterableIterator<any>;
  dirname: string;
  get(...keys: any[]): Promise<any>;
  isKeyExplorable(key: any): Promise<boolean>;
  set(...args: any[]): Promise<void>;
  unwatch(): Promise<void>;
  watch(): Promise<void>;
}