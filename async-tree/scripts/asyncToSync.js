import toString from "../src/utilities/toString.js";

const replacements = new Map([
  [/async /g, "/*async*/ "],
  [/await /g, "/*await*/ "],
  [/Promise.all/g, "/*Promise.all*/ "],
  [/\/src\/async/g, "/src/sync"],
  [/Promise<(.+)>/g, "$1"],
  [/AsyncGenerator/g, "Generator"],
  [/SyncOrAsyncMap/g, "SyncMap"],
  [
    /Edit this ASYNC version to generate the sync version./g,
    "Don't edit this SYNC version; edit the async version instead.",
  ],
]);

/**
 * Given source code meant to work with async maps and async functions, return a
 * equivalent version that does the same operation using sync maps and sync
 * functions.
 *
 * @param {import("../index.ts").Stringlike} source
 * @returns {string}
 */
export default function asyncToSync(source) {
  let text = toString(source);
  if (!text) {
    throw new Error("Source could not be converted to string.");
  }
  for (const [find, replace] of replacements.entries()) {
    text = text.replace(find, replace);
  }
  return text;
}
asyncToSync.unpackArgs = true;
