const TypedArray = Object.getPrototypeOf(Uint8Array);

/**
 * If the given plain object has only sequential integer keys, return it as an
 * array. Otherwise return it as is.
 *
 * @param {any} object
 */
export function castArrayLike(object) {
  let hasKeys = false;
  let expectedIndex = 0;
  for (const key in object) {
    hasKeys = true;
    const index = Number(key);
    if (key === "" || isNaN(index) || index !== expectedIndex) {
      // Not an array-like object.
      return object;
    }
    expectedIndex++;
  }
  return hasKeys ? Object.values(object) : object;
}

/**
 * Return the Object prototype at the root of the object's prototype chain.
 *
 * This is used by functions like isPlainObject() to handle cases where the
 * `Object` at the root prototype chain is in a different realm.
 *
 * @param {any} object
 */
export function getRealmObjectPrototype(object) {
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

// Names of OS-generated files that should not be enumerated
export const hiddenFileNames = [".DS_Store"];

/**
 * Return true if the object is in a packed form (or can be readily packed into
 * a form) that can be given to fs.writeFile or response.write().
 *
 * @param {any} object
 * @returns {object is import("../index.ts").Packed}
 */
export function isPacked(object) {
  return (
    typeof object === "string" ||
    object instanceof ArrayBuffer ||
    object instanceof Buffer ||
    object instanceof ReadableStream ||
    object instanceof String ||
    object instanceof TypedArray
  );
}

/**
 * Return true if the object is a plain JavaScript object created by `{}`,
 * `new Object()`, or `Object.create(null)`.
 *
 * This function also considers object-like things with no prototype (like a
 * `Module`) as plain objects.
 *
 * @param {any} object
 * @returns {object is import("../index.ts").PlainObject}
 */
export function isPlainObject(object) {
  // From https://stackoverflow.com/q/51722354/76472
  if (typeof object !== "object" || object === null) {
    return false;
  }

  // We treat object-like things with no prototype (like a Module) as plain
  // objects.
  if (Object.getPrototypeOf(object) === null) {
    return true;
  }

  // Do we inherit directly from Object in this realm?
  return Object.getPrototypeOf(object) === getRealmObjectPrototype(object);
}

/**
 * Return true if the object is a string or object with a non-trival `toString`
 * method.
 *
 * @param {any} object
 * @returns {obj is import("../index.ts").StringLike}
 */
export function isStringLike(object) {
  if (typeof object === "string") {
    return true;
  } else if (object?.toString === undefined) {
    return false;
  } else if (object.toString === getRealmObjectPrototype(object)?.toString) {
    // The stupid Object.prototype.toString implementation always returns
    // "[object Object]", so if that's the only toString method the object has,
    // we return false.
    return false;
  } else {
    return true;
  }
}

export function isUnpackable(object) {
  return (
    isPacked(object) &&
    typeof (/** @type {any} */ (object).unpack) === "function"
  );
}

/**
 * Given a path like "/foo/bar/baz", return an array of keys like ["foo", "bar",
 * "baz"].
 *
 * Leading slashes are ignored. Consecutive slashes or a trailing slash will be
 * represented by the empty string.
 *
 * @param {string} pathname
 */
export function keysFromPath(pathname) {
  const keys = pathname.split("/");
  if (keys[0] === "") {
    // The path begins with a slash; drop that part.
    keys.shift();
  }
  return keys;
}

// Used for natural sort order
export const naturalSortCompareFn = new Intl.Collator(undefined, {
  numeric: true,
}).compare;

/**
 * Sort the given array using [natural sort
 * order](https://en.wikipedia.org/wiki/Natural_sort_order). Like the native
 * `Array` `sort` function, this operation destructively modifies the array in
 * place.
 *
 * The default sort order for some sources like operating system files can be
 * unpredictable. Since it's quite common for file names to include numbers, it
 * can helpful to use natural sort order instead: ["file1", "file9", "file10"]
 * instead of ["file1", "file10", "file9"].
 */
export function sortNatural(array) {
  array.sort(naturalSortCompareFn);
}
