// Used to force local references that fail to throw an error
export default class JseBoundaryTree {
  constructor() {
    this.parent = null;
  }

  async get(key) {
    throw new ReferenceError(`Not found: ${key}`);
  }

  async keys() {
    return [];
  }
}
