import { isUnpackable, SyncMap, Tree } from "@weborigami/async-tree";
import {
  getGlobalsForTree,
  HandleExtensionsTransform,
} from "@weborigami/language";
import Zip from "adm-zip";

/**
 * Handler for ZIP files
 */
export default {
  mediaType: "application/zip",

  /**
   * Pack a tree of files as a ZIP file in Buffer form.
   *
   * @param {import("@weborigami/async-tree").Maplike} maplike
   */
  async pack(maplike) {
    // The ZIP file should leave the files in tree order.
    const zip = new Zip({ noSort: true });
    if (isUnpackable(maplike)) {
      maplike = await maplike.unpack();
    }
    const deflated = await Tree.deflatePaths(maplike);
    for (let [path, value] of deflated) {
      if (typeof value === "function") {
        value = value();
      }
      if (value instanceof Promise) {
        value = await value;
      }
      zip.addFile(path, value);
    }
    const buffer = zip.toBuffer();
    return buffer;
  },

  /**
   * Unpack a ZIP file
   */
  async unpack(buffer, options) {
    // Origami generally prefers keeping things as an Uint8Array or ArrayBuffer,
    // but adm-zip only accepts a Buffer.
    if (buffer instanceof Uint8Array || buffer instanceof ArrayBuffer) {
      buffer = Buffer.from(buffer);
    }

    const zip = new Zip(buffer);

    const entries = zip.getEntries();
    const filtered = entries.filter(
      (entry) =>
        !entry.entryName.startsWith("__MACOSX/") &&
        !entry.entryName.endsWith("/"),
    );
    const deflated = Object.fromEntries(
      filtered.map((entry) => [entry.entryName, () => entry.getData()]),
    );

    // The final tree will include extension handlers and have functions invoked
    // to retrieve data from the ZIP file. While the base map is a SyncMap, the
    // final tree will be async.
    const classFn = HandleExtensionsTransform(
      InvokeFunctionsTransform(SyncMap),
    );
    const result = await Tree.inflatePaths(deflated, { classFn });

    const parent = options?.parent;
    const globals = parent ? getGlobalsForTree(parent) : null;
    if (globals) {
      result.globals = globals;
    }

    return result;
  },
};

function InvokeFunctionsTransform(Base) {
  return class InvokeFunctions extends Base {
    delete(key) {
      return super.delete(key);
    }

    get(key) {
      const value = super.get(key);
      return typeof value === "function" ? value() : value;
    }

    set(key, value) {
      return super.set(key, value);
    }

    trailingSlashKeys = true;
  };
}
