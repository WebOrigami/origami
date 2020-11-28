import { asyncGet, asyncKeys } from "@explorablegraph/symbols";
import AsyncExplorable from "./AsyncExplorable.js";

/**
 * Given a set of explorable functions, the [asyncGet] method will look at each
 * exfn in turn. The first exfn is asked for object with the key. If an exfn
 * returns a defined value (i.e., not undefined), that value is returned. If the
 * first exfn returns undefined, the second exfn will be asked, and so on.
 */
export default class FirstMatch extends AsyncExplorable {
  constructor(exfns) {
    super();
    this.exfns = exfns;
  }

  // Return the union of the visible keys in the explorable functions.
  async *[asyncKeys]() {
    // Use a Set to de-duplicate the keys from the graphs.
    const set = new Set();
    for (const exfn of this.exfns) {
      for await (const key of exfn) {
        set.add(key);
      }
    }
    yield* set;
  }

  async [asyncGet](key) {
    for (const exfn of this.exfns) {
      const obj = await exfn[asyncGet](key);
      if (obj !== undefined) {
        // Found
        return obj;
      }
    }
    // Not found
    return undefined;
  }
}
