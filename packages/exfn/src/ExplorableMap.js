import { get, keys } from "@explorablegraph/symbols";
import Explorable from "./Explorable.js";

class A extends Explorable {}
class B extends A {}

// export default class ExplorableMap extends Explorable {
export default class ExplorableMap extends B {
  /**
   * @param {Map} map
   */
  constructor(map) {
    super();
    const isExplorable = this instanceof Explorable;
    this.map = map;
  }

  /**
   * Return the value for the corresponding key.
   *
   * @param {any} key
   */
  [get](key) {
    return this.map.get(key);
  }

  *[keys]() {
    yield* this.map.keys();
  }
}
