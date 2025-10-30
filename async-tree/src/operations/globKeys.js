import AsyncMap from "../drivers/AsyncMap.js";
import ObjectMap from "../drivers/ObjectMap.js";
import * as trailingSlash from "../trailingSlash.js";
import getTreeArgument from "../utilities/getTreeArgument.js";
import isMap from "./isMap.js";
import merge from "./merge.js";

const globstar = "**";
const globstarSlash = `${globstar}/`;

export default async function globKeys(maplike) {
  const globs = await getTreeArgument(maplike, "globKeys", { deep: true });
  return Object.assign(new AsyncMap(), {
    async get(key) {
      if (typeof key !== "string") {
        return undefined;
      }

      let value = await matchGlobs(globs, key);
      if (isMap(value)) {
        value = globKeys(value);
      }
      return value;
    },

    async *keys() {
      for await (const key of globs.keys()) {
        yield key;
      }
    },
  });
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
  for await (let glob of globs.keys()) {
    if (glob === globstar || glob === globstarSlash) {
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
        if (!isMap(globValue)) {
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
      if (!isMap(globstarValue)) {
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
