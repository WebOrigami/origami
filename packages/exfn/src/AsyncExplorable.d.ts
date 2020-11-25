// Define constructor a la Boolean, String, etc., in
// https://github.com/microsoft/TypeScript/blob/master/lib/lib.es5.d.ts

import { asyncGet, asyncKeys } from "@explorablegraph/symbols";

interface AsyncExplorable {
  // We define [Symbol.iterator] so TypeScript knows it's there, even though
  // it's the same as the [keys].
  [asyncGet](key: any): Promise<any>;
  [asyncKeys]: AsyncIterableIterator<any>;
  [Symbol.iterator](): Iterator<any>;
}

interface AsyncExplorableConstructor {
  new(obj?: any): AsyncExplorable;
  (obj?: any): AsyncExplorable;
  isExplorable(obj: any): Boolean;
  // keys(obj: any): Array<any>;
}

declare const AsyncExplorable: AsyncExplorableConstructor;

export default AsyncExplorable;

// static keys(obj: any): any[];
// static plain(exfn: any): any;
// static structure(exfn: any): any;
// static strings(exfn: any): any;
// static traverse(exfn: any, path: any[]): any;
