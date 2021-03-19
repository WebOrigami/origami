import { asyncGet, asyncKeys, IAsyncExplorable } from "@explorablegraph/symbols";

export default class AsyncExplorable implements IAsyncExplorable {
  constructor(obj?: object);
  [asyncGet](...key: any[]): Promise<any>;
  [asyncKeys](): AsyncIterableIterator<any>;
}