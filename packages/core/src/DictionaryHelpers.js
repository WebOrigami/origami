/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/types").AsyncMutableDictionary} AsyncMutableDictionary
 */

/**
 * This class implements utilities methods like `entries()` that can be defined
 * in terms of other methods like `keys()` and `get()`.
 *
 * This collection of utilities is defined as a class with static methods,
 * rather than a module with multiple exports, so that it include a method
 * called `delete`. In JavaScript, `delete` is a reserved word, so can't be used
 * as the name of an export.
 */
export default class DictionaryHelpers {
  /**
   * @param {AsyncMutableDictionary} dictionary
   */
  static async clear(dictionary) {
    // @ts-ignore
    for (const key of await dictionary.keys()) {
      await dictionary.set(key, undefined);
    }
  }

  /**
   * @param {AsyncMutableDictionary} dictionary
   * @param {any} key
   */
  static async delete(dictionary, key) {
    const exists = await this.has(dictionary, key);
    if (exists) {
      await dictionary.set(key, undefined);
      return true;
    } else {
      return false;
    }
  }

  /**
   * @param {AsyncDictionary} dictionary
   */
  static async entries(dictionary) {
    const keys = [...(await dictionary.keys())];
    const promises = keys.map(async (key) => [key, await dictionary.get(key)]);
    return Promise.all(promises);
  }

  /**
   * @param {AsyncDictionary} dictionary
   * @param {Function} callbackFn
   */
  static async forEach(dictionary, callbackFn) {
    const keys = [...(await dictionary.keys())];
    const promises = keys.map(async (key) => {
      const value = await dictionary.get(key);
      return callbackFn(value, key);
    });
    await Promise.all(promises);
  }

  /**
   * Return the Object prototype at the root of the object's prototype chain.
   *
   * This is used by functions like isPlainObject() to handle cases where the
   * `Object` at the root prototype chain is in a different realm.
   *
   * @param {any} obj
   */
  static getRealmObjectPrototype(obj) {
    let proto = obj;
    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }
    return proto;
  }

  /**
   * @param {AsyncDictionary} dictionary
   * @param {any} key
   */
  static async has(dictionary, key) {
    const value = await dictionary.get(key);
    return value !== undefined;
  }

  /**
   * Return true if the object is an AsyncDictionary.
   *
   * @param {any} object
   * @returns {boolean}
   */
  static isAsyncDictionary(object) {
    return (
      object &&
      typeof object.get === "function" &&
      typeof object.keys === "function"
    );
  }

  /**
   * Return true if the object is an AsyncMutableDictionary.
   *
   * @param {any} object
   * @returns {boolean}
   */
  static isAsyncMutableDictionary(object) {
    return this.isAsyncDictionary(object) && typeof object.set === "function";
  }

  /**
   * Return true if the object is a plain JavaScript object created by `{}`,
   * `new Object()`, or `Object.create(null)`.
   *
   * This function also considers object-like things with no prototype (like a
   * `Module`) as plain objects.
   *
   * @param {any} obj
   */
  static isPlainObject(obj) {
    // From https://stackoverflow.com/q/51722354/76472
    if (typeof obj !== "object" || obj === null) {
      return false;
    }

    // We treat object-like things with no prototype (like a Module) as plain
    // objects.
    if (Object.getPrototypeOf(obj) === null) {
      return true;
    }

    // Do we inherit directly from Object in this realm?
    return Object.getPrototypeOf(obj) === this.getRealmObjectPrototype(obj);
  }

  /**
   * Return the values in the dictionary.
   *
   * @param {AsyncDictionary} dictionary
   */
  static async values(dictionary) {
    const keys = [...(await dictionary.keys())];
    const promises = keys.map(async (key) => dictionary.get(key));
    return Promise.all(promises);
  }
}
