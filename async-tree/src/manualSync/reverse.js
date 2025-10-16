import MapBase from "../drivers/MapBase.js";
import from from "./from.js";

/**
 * Reverse the order of the top-level keys in the tree.
 */
export default /*async*/ function reverse(object) {
  const map = from(object);
  return new ReverseMap(map.entries());
}

class ReverseMap extends MapBase {
  keys() {
    const base = [...super.keys()];
    base.reverse();
    return base[Symbol.iterator]();
  }
}
