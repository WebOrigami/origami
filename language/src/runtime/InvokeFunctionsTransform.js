import { isPlainObject } from "@weborigami/async-tree";

// Makes it easier to define a map whose values invoke async functions
export default function InvokeFunctionsTransform(Base) {
  return class extends Base {
    constructor(iterable) {
      if (isPlainObject(iterable)) {
        iterable = Object.entries(iterable);
      }
      super(iterable);
    }

    get(key) {
      let value = super.get(key);
      if (typeof value === "function") {
        value = value();
      }
      return value;
    }
  };
}
