/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/types").AsyncMutableDictionary} AsyncMutableDictionary
 */

/**
 * A collection of utility methods like `entries()` that can be defined in terms
 * of other methods like `keys()` and `get()`.
 */

/**
 * @param {AsyncMutableDictionary} dictionary
 */
export async function clear(dictionary) {
  // @ts-ignore
  for (const key of await dictionary.keys()) {
    await dictionary.set(key, undefined);
  }
}

/**
 * @param {AsyncDictionary} dictionary
 */
export async function entries(dictionary) {
  const keys = [...(await dictionary.keys())];
  const promises = keys.map(async (key) => [key, await dictionary.get(key)]);
  return Promise.all(promises);
}

/**
 * @param {AsyncDictionary} dictionary
 * @param {Function} callbackFn
 */
export async function forEach(dictionary, callbackFn) {
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
export function getRealmObjectPrototype(obj) {
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
export async function has(dictionary, key) {
  const value = await dictionary.get(key);
  return value !== undefined;
}

/**
 * Return true if the object is an AsyncDictionary.
 *
 * @param {any} object
 * @returns {boolean}
 */
export function isAsyncDictionary(object) {
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
export function isAsyncMutableDictionary(object) {
  return isAsyncDictionary(object) && typeof object.set === "function";
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
export function isPlainObject(obj) {
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
  return Object.getPrototypeOf(obj) === getRealmObjectPrototype(obj);
}

/**
 * @param {AsyncMutableDictionary} dictionary
 * @param {any} key
 *
 * Note: The corresponding `Map` method is `delete`, not `remove`. However,
 * `delete` is a reserved word in JavaScript, so we use `remove` instead.
 */
export async function remove(dictionary, key) {
  const exists = await has(dictionary, key);
  if (exists) {
    await dictionary.set(key, undefined);
    return true;
  } else {
    return false;
  }
}

/**
 * Return the values in the dictionary.
 *
 * @param {AsyncDictionary} dictionary
 */
export async function values(dictionary) {
  const keys = [...(await dictionary.keys())];
  const promises = keys.map(async (key) => dictionary.get(key));
  return Promise.all(promises);
}
