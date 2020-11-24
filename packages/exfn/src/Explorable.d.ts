// Define constructor a la Boolean, String, etc., in
// https://github.com/microsoft/TypeScript/blob/master/lib/lib.es5.d.ts

import { get } from "@explorablegraph/symbols";

interface Explorable {
  [Symbol.iterator]: Iterator;
  [get](key: any): any;
  name: string;
}

interface ExplorableConstructor {
  new(obj?: any): Explorable;
  (obj?: any): Explorable;
}

declare const Explorable: ExplorableConstructor;

export default Explorable;
