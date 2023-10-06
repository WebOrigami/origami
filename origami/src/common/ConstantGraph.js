export default class ConstantGraph {
  constructor(value) {
    this.value = value;
  }

  async get(key) {
    return this.value;
  }

  async keys() {
    return [];
  }
}
