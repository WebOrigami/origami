import { AsyncMap, isUnpackable, Tree } from "@weborigami/async-tree";
import addExtensionKeyFn from "./addExtensionKeyFn.js";
import zip_handler from "./zip_handler.js";

/**
 * Handler for EPUB files
 */
const epub_handler = {
  mediaType: "application/epub+zip",

  /**
   * Package a tree of files as an EPUB file in Buffer form.
   *
   * This calls the pack() method for ZIP files, but ensures the `mimetype` file
   * is the first file in the package -- a requirement for EPUB files.
   *
   * @param {import("@weborigami/async-tree").Maplike} maplike
   */
  async pack(maplike) {
    if (isUnpackable(maplike)) {
      maplike = await maplike.unpack();
    }
    const tree = Tree.from(maplike, { deep: true });
    return zip_handler.pack(mimetypeFirst(tree));
  },

  async unpack(buffer, options) {
    return zip_handler.unpack(buffer, options);
  },
};

/** @type {any} */ (epub_handler.pack).key = addExtensionKeyFn(".epub");

export default epub_handler;

// A tree with its `mimetype` file first
function mimetypeFirst(tree) {
  return Object.assign(new AsyncMap(), {
    async get(key) {
      return tree.get(key);
    },

    async *keys() {
      const keys = await Tree.keys(tree);
      // Move `mimetype` (if present) to the front of the list.
      const index = keys.indexOf("mimetype");
      if (index >= 0) {
        keys.splice(index, 1);
        keys.unshift("mimetype");
      }
      yield* keys;
    },
  });
}
