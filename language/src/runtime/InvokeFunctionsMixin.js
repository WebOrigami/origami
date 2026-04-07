import { isPlainObject } from "@weborigami/async-tree";

// Makes it easier to define a map whose values invoke async functions
export default function InvokeFunctionsMixin(Base) {
  return class extends Base {
    constructor(iterable) {
      if (isPlainObject(iterable)) {
        iterable = Object.entries(iterable);
      }
      super(iterable);
    }

    async get(key) {
      let value = await super.get(key);
      if (typeof value === "function") {
        value = await value();
      }
      return value;
    }
  };
}
