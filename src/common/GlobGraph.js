import ExplorableGraph from "../core/ExplorableGraph.js";

export default class GlobGraph {
  constructor(globs) {
    this.globs = ExplorableGraph.from(globs);
  }

  async *[Symbol.asyncIterator]() {
    yield this.globs;
  }

  async get(key) {
    if (typeof key !== "string") {
      return undefined;
    }

    for await (const glob of this.globs) {
      if (matchGlob(glob, key)) {
        return await this.globs.get(glob);
      }
    }

    return false;
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
