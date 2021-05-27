/**
 * Return true if the object is a plain JavaScript object.
 *
 * @param {any} obj
 */
export function isPlainObject(obj) {
  // From https://stackoverflow.com/q/51722354/76472
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}

export function stringify(obj) {
  if (isPlainObject(obj)) {
    const result = {};
    for (const key of obj) {
      result[key] = stringify(obj);
    }
    return result;
  } else if (obj instanceof Array) {
    return obj.map((value) => stringify(value));
  } else {
    return obj?.toString?.();
  }
}
