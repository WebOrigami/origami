/**
 * Return the Object prototype at the root of the object's prototype chain.
 *
 * This is used by functions like isPlainObject() to handle cases where the
 * `Object` at the root prototype chain is in a different realm.
 *
 * @param {any} object
 */
export default function getRealmObjectPrototype(object) {
  if (Object.getPrototypeOf(object) === null) {
    // The object has no prototype.
    return null;
  }
  let proto = object;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return proto;
}
