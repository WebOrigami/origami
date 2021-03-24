import { AsyncExplorable, asyncGet, asyncKeys } from "@explorablegraph/core";
import path from "path";
import Files from "./Files.js";

export default class VirtualFiles extends TransformMixin(Files) {
  #bindings;
  #fallbackFolders;
  #wildcardFolder;

  constructor(dirname, fallbackFolders, bindings) {
    // @ts-ignore Until we can typecheck mixins.
    super(dirname);
    this.#fallbackFolders = fallbackFolders || [];
    this.#bindings = bindings || {};
  }

  async [asyncGet](key, ...rest) {
    const result = await super[asyncGet](key, ...rest);
    if (result) {
      // Prefer base result.
      return result;
    }

    // Try looking in fallback folders.
    for (const folder of this.#fallbackFolders) {
      const result = await folder[asyncGet](...rest);
      if (result) {
        return result;
      }
    }

    // If we have a wildcard folder, look in there.
    if (rest.length > 0) {
      const wildcardFolder = await this.wildcardFolder();
      if (wildcardFolder) {
        // Construct a bound folder.
        const basename = path.basename(wildcardFolder.dirname);
        const name = basename.slice(1);
        const bindings = Object.assign({}, this.#bindings, {
          [name]: key,
        });
        const bound = await this.subgraph(basename, undefined, bindings);
        const result = await bound[asyncGet](...rest);
        return result;
      }
    }

    return undefined;
  }

  async *[asyncKeys]() {
    // Yield our keys first.
    yield* super[asyncKeys]();

    // Yield fallback keys.
    // For wildcard folders, we only yield keys for arrow modules to avoid having,
    // e.g., scripts and other resources in the wildcard folders show up in every
    // folder using that wildcard folder for fallback content.
    for (const folder of this.#fallbackFolders) {
      const basename = path.basename(folder.dirname);
      const isWildcardFolder = basename.startsWith(":") && folder.innerKeys;
      if (isWildcardFolder) {
        // We want to only serve generated files.
        // HACK: compare key with wildcard folder's inner keys, if not found then
        // file is generated.
        const innerKeys = [];
        for await (const key of folder.innerKeys()) {
          innerKeys.push(key);
        }
        for await (const key of folder[asyncKeys]()) {
          if (!innerKeys.includes(key)) {
            yield key;
          }
        }
      } else {
        yield* folder[asyncKeys]();
      }
    }
  }

  get bindings() {
    return this.#bindings;
  }

  get boundDirname() {
    let result = this.dirname;
    for (const key in this.#bindings) {
      const wildcard = `:${key}`;
      const value = this.#bindings[key];
      result = result.replace(wildcard, value);
    }
    return result;
  }

  async innerKeyForOuterKey(outerKey) {
    if (outerKey === "." || outerKey === "..") {
      // Return special cases as is.
      return outerKey;
    }

    // See if the outer key is found in the inner graph.
    const keys = [];
    for await (const key of this.innerKeys()) {
      keys.push(key);
    }
    const virtualKey = `${outerKey}←.js`;

    // Prefer outer key if found, otherwise use virtual key if it exists.
    return keys.includes(outerKey)
      ? outerKey
      : keys.includes(virtualKey)
      ? virtualKey
      : undefined;
  }

  async outerKeyForInnerKey(innerKey) {
    return innerKey.endsWith("←.js")
      ? path.basename(innerKey, "←.js")
      : innerKey;
  }

  async subgraph(
    key,
    fallbackFolders = [],
    bindings = this.#bindings,
    ...args
  ) {
    const fallbacks = fallbackFolders.slice();

    // If this folder has a wildcard subfolder, look inside those for the same
    // key. If any matches are found, they'll become fallback folders for the
    // subfolder we're constructing.
    for (const fallbackFolder of fallbackFolders) {
      const subfolder = await fallbackFolder[asyncGet](key);
      if (subfolder instanceof AsyncExplorable) {
        fallbacks.push(subfolder);
      }
    }

    // If we're trying to construct a regular subfolder (not a wildcard), and
    // the current folder has a wildcard folder, that will become a fallback
    // folder for the subfolder we're constructing too.
    if (!key.startsWith(":")) {
      const wildcardFolder = await this.wildcardFolder();
      if (wildcardFolder) {
        fallbacks.push(wildcardFolder);
      }
    }

    return await super.subgraph(key, fallbacks, bindings, ...args);
  }

  async transform(obj, outerKey, innerKey) {
    if (innerKey.endsWith("←.js")) {
      // This is inefficient: the transform has already loaded the module's
      // contents as a buffer, but we can't import that, so we throw that away
      // and load the module ourselves.
      const filePath = path.join(this.dirname, innerKey);
      const obj = await import(filePath);
      const fn = obj.default;
      return typeof fn === "function" ? await fn(this) : fn;
    }
    return obj;
  }

  async wildcardFolder() {
    if (this.#wildcardFolder !== undefined) {
      return this.#wildcardFolder;
    }
    this.#wildcardFolder = null;
    for await (const key of this[asyncKeys]()) {
      if (key.startsWith(":")) {
        this.#wildcardFolder = this.subgraph(key);
        break;
      }
    }
    return this.#wildcardFolder;
  }
}

function TransformMixin(Base) {
  return class Transform extends Base {
    async [asyncGet](outerKey, ...rest) {
      const innerKey = await this.innerKeyForOuterKey(outerKey);
      const value = innerKey
        ? await super[asyncGet](innerKey, ...rest)
        : undefined;
      return value
        ? await this.transform(value, outerKey, innerKey)
        : undefined;
    }

    async *[asyncKeys]() {
      for await (const innerKey of super[asyncKeys]()) {
        const outerKey = await this.outerKeyForInnerKey(innerKey);
        if (outerKey !== undefined) {
          yield outerKey;
        }
      }
    }

    // The default implementation returns the key unmodified.
    async innerKeyForOuterKey(key) {
      return key;
    }

    async *innerKeys() {
      yield* super[asyncKeys]();
    }

    // The default implementation returns the key unmodified.
    async outerKeyForInnerKey(key) {
      return key;
    }

    // The default implementation returns the object unmodified.
    async transform(obj, outerKey, innerKey) {
      return obj;
    }
  };
}
