/**
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class ConstantTree {
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
