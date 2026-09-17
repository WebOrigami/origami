import FileMap from "../src/drivers/FileMap.js";
import map from "../src/operations/map.js";
import asyncToSync from "./asyncToSync.js";

/**
 * Convert async source code to its synchronous equivalent.
 *
 * This uses AsyncTree drivers and functions directly instead of using Origami to
 * coordinate the transformation.
 */
const asyncFilesUrl = new URL("../src/async", import.meta.url);
const asyncFiles = new FileMap(asyncFilesUrl);
const syncFiles = map(asyncFiles, {
  key: (value, key) =>
    key.endsWith("Async.js") ? key.replace("Async.js", "Sync.js") : key,
  keyNeedsSourceValue: false,
  inverseKey: (key) =>
    key.endsWith("Sync.js") ? key.replace("Sync.js", "Async.js") : key,
  value: asyncToSync,
});

export default syncFiles;
