import * as symbols from "../symbols.js";
import * as trailingSlash from "../trailingSlash.js";
import setParent from "../utilities/setParent.js";
import SyncMap from "./SyncMap.js";

export default class ObjectMap extends SyncMap {
  constructor(object = {}) {
    super();
    // Note: we use `typeof` here instead of `instanceof Object` to allow for
    // objects such as Node's `Module` class for representing an ES module.
    if (typeof object !== "object" || object === null) {
      throw new TypeError(
        `${this.constructor.name}: Expected an object or array.`
      );
    }
    this.object = object;
    this.parent = object[symbols.parent] ?? null;
  }

  delete(key) {
    const existingKey = findExistingKey(this.object, key);
    if (existingKey === null) {
      return false;
    }
    delete this.object[existingKey];
    return true;
  }

  get(key) {
    // Does the object have the key with or without a trailing slash?
    const existingKey = findExistingKey(this.object, key);
    if (existingKey === null) {
      // Key doesn't exist
      return undefined;
    }

    let value = this.object[existingKey];

    if (value === undefined) {
      // Key exists but value is undefined
      return undefined;
    }

    setParent(value, this);

    // Is value an instance method?
    const isInstanceMethod =
      value instanceof Function && !Object.hasOwn(this.object, key);
    if (isInstanceMethod) {
      // Bind it to the object
      value = value.bind(this.object);
    }

    return value;
  }

  /** @returns {boolean} */
  isSubtree(value) {
    return value instanceof Map;
  }

  keys() {
    // Defer to symbols.keys if defined
    if (typeof this.object[symbols.keys] === "function") {
      return this.object[symbols.keys]();
    }

    let object = this.object;

    const result = new Set();

    // Walk up the prototype chain
    while (object !== null) {
      const descriptors = Object.getOwnPropertyDescriptors(object);
      const propertyNames = Object.entries(descriptors)
        // Get the enumerable instance properties and the get/set properties
        .filter(
          ([name, descriptor]) =>
            name !== "constructor" &&
            name !== "__proto__" &&
            (descriptor.enumerable ||
              (descriptor.get !== undefined && descriptor.set !== undefined))
        )
        // Preserve existing slash; add slash for subtrees
        .map(([name, descriptor]) =>
          trailingSlash.has(name)
            ? name
            : trailingSlash.toggle(
                name,
                descriptor.value !== undefined &&
                  this.isSubtree(descriptor.value)
              )
        );
      for (const name of propertyNames) {
        result.add(name);
      }
      object = Object.getPrototypeOf(object);
    }

    return result[Symbol.iterator]();
  }

  set(key, value) {
    const existingKey = findExistingKey(this.object, key);

    // If the key exists under a different form, delete the existing key.
    if (existingKey !== null && existingKey !== key) {
      delete this.object[existingKey];
    }

    if (value === ObjectMap.EMPTY) {
      // Create empty subtree
      value = Reflect.construct(this.constructor, []);
    }

    // Set the value for the key.
    this.object[key] = value;

    return this;
  }
}

function findExistingKey(object, key) {
  // First try key as is
  if (key in object) {
    return key;
  }
  // Try alternate form
  const alternateKey = trailingSlash.toggle(key);
  if (alternateKey in object) {
    return alternateKey;
  }
  return null;
}
