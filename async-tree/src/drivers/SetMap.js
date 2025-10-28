import SyncMap from "./SyncMap.js";

/**
 * A map of Set objects.
 */
export default class SetMap extends SyncMap {
  /**
   * @param {Set} set
   */
  constructor(set) {
    super(set.entries());
  }
}
