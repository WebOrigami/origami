// Define constructor a la Boolean, String, etc., in
// https://github.com/microsoft/TypeScript/blob/master/lib/lib.es5.d.ts

import { get, keys } from "@explorablegraph/symbols";

interface Explorable {
  // We define [Symbol.iterator] so TypeScript knows it's there, even though
  // it's the same as the [keys].
  [Symbol.iterator](): Iterator<any>;
  [get](key: any): any;
  [keys]: Array<any>;
  name: string;
}

interface ExplorableConstructor {
  new(obj?: any): Explorable;
  (obj?: any): Explorable;
  isExplorable(obj: any): Boolean;
  keys(obj: any): Array<any>;
}

declare const Explorable: ExplorableConstructor;

export default Explorable;
