import {
  DeepObjectTree,
  ObjectTree,
  Tree,
  isPlainObject,
  merge,
} from "@weborigami/async-tree";

const globstar = "**";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @implements {AsyncTree}
 */
export default class GlobTree {
  constructor(globs) {
    this.globs = isPlainObject(globs)
      ? new DeepObjectTree(globs)
      : Tree.from(globs);
  }

  async get(key) {
    if (typeof key !== "string") {
      return undefined;
    }
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

function matchGlob(glob, text) {
  // Convert the glob to a regular expression
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
  for (const glob of await globs.keys()) {
    if (typeof glob !== "string") {
      continue;
    } else if (glob !== globstar && matchGlob(glob, text)) {
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
