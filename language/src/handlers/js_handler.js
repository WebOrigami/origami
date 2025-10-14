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

// If the value is a function, bind it to the parent so that the function can,
// e.g., find local files. Note: evaluate() supports a related but separate
// mechanism called `containerAsTarget`. We want to use binding here so that, if
// a function is handed to another to be called later, it still has the correct
// `this`.
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
