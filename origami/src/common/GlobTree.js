import { ObjectTree, Tree, merge, trailingSlash } from "@weborigami/async-tree";

const globstar = "**";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class GlobTree {
  constructor(globs) {
    this.globs = Tree.from(globs, { deep: true });
  }

  async get(key) {
    if (typeof key !== "string") {
      return undefined;
    }

    // Remove trailing slash if it exists
    key = trailingSlash.remove(key);

    let value = await matchGlobs(this.globs, key);
    if (Tree.isAsyncTree(value)) {
      value = Reflect.construct(this.constructor, [value]);
    }
    return value;
  }

  async keys() {
    return this.globs.keys();
  }
}

// Convert the glob to a regular expression
function matchGlob(glob, text) {
  const regexText = glob
    // Escape special regex characters
    .replace(/[+?^${}()|\[\]\\]/g, "\\$&")
    // Replace the glob wildcards with regex wildcards
    .replace(/\*/g, ".+")
    .replace(/\?/g, ".");
  const regex = new RegExp(`^${regexText}$`);
  return regex.test(text);
}

async function matchGlobs(globs, text) {
  let value;
  for (let glob of await globs.keys()) {
    if (typeof glob !== "string") {
      continue;
    }

    // Remove trailing slash if it exists
    glob = trailingSlash.remove(glob);

    if (glob !== globstar && matchGlob(glob, text)) {
      value = await globs.get(glob);
      if (value !== undefined) {
        break;
      }
    }
  }

  const globstarGlobs = await globs.get(globstar);
  if (globstarGlobs) {
    const globstarTree = new ObjectTree({ [globstar]: globstarGlobs });
    if (value === undefined) {
      const globstarValue = await matchGlobs(globstarGlobs, text);
      value = globstarValue !== undefined ? globstarValue : globstarTree;
    } else if (Tree.isAsyncTree(value)) {
      value = merge(value, globstarTree);
    }
  }

  return value;
}
