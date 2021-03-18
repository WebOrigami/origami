// Define constructor a la Boolean, String, etc., in
// https://github.com/microsoft/TypeScript/blob/master/lib/lib.es5.d.ts

import { asyncGet, asyncKeys } from "@explorablegraph/symbols";

interface AsyncExplorableInterface {
  // We define [Symbol.asyncIterator] so TypeScript knows it's there, even
  // though it's the same as the [asyncKeys].
  [asyncGet](key: any): Promise<any>;
  [asyncKeys]: AsyncIterableIterator<any>;
  [Symbol.asyncIterator](): Iterator<any>;
}
 
// interface AsyncExplorableConstructor {
//   new(obj?: any): AsyncExplorable;
//   (obj?: any): AsyncExplorable;
//   asyncOps: typeof asyncOps;
//   isExplorable(obj: any): boolean;
//   // keys(obj: any): Array<any>;
// }

// declare const AsyncExplorable: AsyncExplorableConstructor;

// export default AsyncExplorable;

export default class AsyncExplorable implements AsyncExplorableInterface {
  [asyncGet](key: any): Promise<any>;
  [asyncKeys]: AsyncIterableIterator<any>;
  [Symbol.asyncIterator](): Iterator<any>;
}