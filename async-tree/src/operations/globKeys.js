import ObjectMap from "../drivers/ObjectMap.js";
import * as trailingSlash from "../trailingSlash.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import isAsyncTree from "./isAsyncTree.js";
import merge from "./merge.js";

const globstar = "**";
const globstarSlash = `${globstar}/`;

export default async function globKeys(treelike) {
  const globs = await getTreeArgument(treelike, "globKeys", { deep: true });
  return {
    async get(key) {
      if (typeof key !== "string") {
        return undefined;
      }

      let value = await matchGlobs(globs, key);
      if (isAsyncTree(value)) {
        value = globKeys(value);
      }
      return value;
    },

    async keys() {
      return globs.keys();
    },
  };
}

// Convert the glob to a regular expression
function matchGlob(glob, key) {
  const regexText = glob
    // Escape special regex characters
    .replace(/[+?^${}()|\.\[\]\\]/g, "\\$&")
    // Replace the glob wildcards with regex wildcards
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  const regex = new RegExp(`^${regexText}$`);
  return regex.test(key);
}

async function matchGlobs(globs, key) {
  let globstarGlobs;

  // Collect all matches
  let matches = [];
  for (let glob of await globs.keys()) {
    if (glob === globstarSlash) {
      // Remember for later
      globstarGlobs = await globs.get(glob);
      if (trailingSlash.has(key)) {
        // A key for a subtree matches the globstar
        matches.push(new ObjectMap({ [globstar]: globstarGlobs }));
      }
    } else if (matchGlob(glob, key)) {
      // Text matches glob, get value
      const globValue = await globs.get(glob);
      if (globValue !== undefined) {
        if (!isAsyncTree(globValue)) {
          // Found a non-tree match, return immediately
          return globValue;
        }
        // Add to matches
        matches.push(globValue);
      }
    }
  }

  // If we don't have a match yet, try globstar
  if (matches.length === 0) {
    if (!globstarGlobs) {
      // No matches
      return undefined;
    } else {
      // Try globstar
      const globstarValue = await matchGlobs(globstarGlobs, key);
      if (!isAsyncTree(globstarValue)) {
        // Found a non-tree match, return immediately
        return globstarValue;
      } else if (trailingSlash.has(key)) {
        // No match but key is for subtree, return globstar tree
        return new ObjectMap({ [globstar]: globstarGlobs });
      }
    }
  }

  // Merge all matches
  const value = matches.length === 1 ? matches[0] : merge(...matches);
  return value;
}
