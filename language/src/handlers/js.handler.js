/**
 * A JavaScript file
 *
 * Unpacking a JavaScript file returns its default export, or its set of exports
 * if there is more than one.
 */
export default {
  mediaType: "application/javascript",

  /** @type {import("@weborigami/async-tree").UnpackFunction} */
  async unpack(packed, options = {}) {
    const { key, parent } = options;
    if (!(parent && "import" in parent)) {
      throw new TypeError(
        "The parent tree must support importing modules to unpack JavaScript files."
      );
    }

    const object = await /** @type {any} */ (parent).import?.(key);

    let bound;
    if ("default" in object) {
      // Module with a default export; return that.
      bound = bindToParent(object.default, parent);
    } else {
      // Module with multiple named exports.
      bound = {};
      for (const [name, value] of Object.entries(object)) {
        bound[name] = bindToParent(value, parent);
      }
    }

    return bound;
  },
};

function bindToParent(value, parent) {
  if (typeof value === "function") {
    const result = value.bind(parent);
    // Copy over any properties that were attached to the function
    Object.assign(result, value);
    return result;
  } else {
    return value;
  }
}
