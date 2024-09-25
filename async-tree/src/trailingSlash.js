/**
 * Add a trailing slash to a string key if the value is truthy. If the key
 * is not a string, it will be returned as is.
 *
 * @param {any} key
 * @param {any?} value
 */
export function add(key, value = true) {
  return typeof key === "string" && value && !key.endsWith("/")
    ? `${key}/`
    : key;
}

/**
 * Return true if the indicated key is a string with a trailing slash,
 * false otherwise.
 *
 * @param {any} key
 */
export function has(key) {
  return typeof key === "string" && key.endsWith("/");
}

/**
 * Remove a trailing slash from a string key.
 *
 * @param {any} key
 */
export function remove(key) {
  return typeof key === "string" ? key.replace(/\/$/, "") : key;
}

/**
 * If the key has a trailing slash, remove it; otherwise add it.
 *
 * @param {any} key
 * @param {boolean} [force]
 */
export function toggle(key, force = undefined) {
  if (typeof key !== "string") {
    return key;
  }
  const addSlash = force ?? !has(key);
  return addSlash ? add(key) : remove(key);
}
