// Define constructor a la Boolean, String, etc., in
// https://github.com/microsoft/TypeScript/blob/master/lib/lib.es5.d.ts

import { asyncGet, asyncKeys, get, keys } from "@explorablegraph/symbols";

interface Explorable {
  // We define [Symbol.iterator] so TypeScript knows it's there, even though
  // it's the same as the [keys].
  [asyncGet](key: any): Promise<any>;
  [asyncKeys]: AsyncIterableIterator<any>;
  [get](key: any): any;
  [Symbol.iterator](): Iterator<any>;
  [keys]: Array<any>;
}

interface ExplorableConstructor {
  new(obj?: any): Explorable;
  (obj?: any): Explorable;
  isExplorable(obj: any): Boolean;
  keys(obj: any): Array<any>;
}

declare const Explorable: ExplorableConstructor;

export default Explorable;
