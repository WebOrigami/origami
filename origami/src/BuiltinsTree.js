import { trailingSlash } from "@weborigami/async-tree";

// We create our own tree instead of using ObjectTree, since that binds the
// functions would be bound to the object. We want to leave them unbound.
export default class BuiltinsTree {
  constructor(object) {
    this.object = object;
  }

  async get(key) {
    const normalizedKey = trailingSlash.remove(key);
    return this.object[normalizedKey];
  }

  async keys() {
    return Object.keys(this.object);
  }
}
