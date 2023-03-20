export default class SetGraph {
  /**
   * @param {Set} set
   */
  constructor(set) {
    this.values = [...set];
  }

  async get(key) {
    return this.values[key];
  }

  async keys() {
    return this.values.keys();
  }
}
