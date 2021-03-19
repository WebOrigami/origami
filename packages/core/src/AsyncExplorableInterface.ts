import { asyncGet, asyncKeys } from "@explorablegraph/symbols";

export default interface AsyncExplorableInterface {
  [asyncGet](...key: any[]): Promise<any>;
  [asyncKeys](): AsyncIterableIterator<any>;
}
 