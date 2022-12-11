import ExplorableGraph from "../core/ExplorableGraph.js";
import ObjectGraph from "../core/ObjectGraph.js";
import MergeGraph from "./MergeGraph.js";

const globstar = "**";

export default class GlobGraph {
  constructor(globs) {
    this.globs = ExplorableGraph.from(globs);
  }

  async *[Symbol.asyncIterator]() {
    yield* this.globs;
  }

  async get(key) {
    if (typeof key !== "string") {
      return undefined;
    }
    let value = await matchGlobs(this.globs, key);
    if (ExplorableGraph.isExplorable(value)) {
      value = Reflect.construct(this.constructor, [value]);
    }
    return value;
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
  for await (const glob of globs) {
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
    const globstarGraph = new ObjectGraph({ [globstar]: globstarGlobs });
    if (value === undefined) {
      const globstarValue = await matchGlobs(globstarGlobs, text);
      value = globstarValue !== undefined ? globstarValue : globstarGraph;
    } else if (ExplorableGraph.isExplorable(value)) {
      value = new MergeGraph(value, globstarGraph);
    }
  }

  return value;
}
