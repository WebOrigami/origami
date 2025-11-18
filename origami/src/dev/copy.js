import {
  AsyncMap,
  getTreeArgument,
  SyncMap,
  Tree,
} from "@weborigami/async-tree";
import { formatError } from "@weborigami/language";
import process, { stdout } from "node:process";

/**
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} source
 * @param {Maplike} target
 */
export default async function copy(source, target) {
  const sourceTree = await getTreeArgument(source, "copy", { position: 0 });
  let targetTree = await getTreeArgument(target, "copy", { position: 1 });

  if (stdout.isTTY) {
    targetTree = showSetProgress(targetTree, {
      copied: 0,
      total: 0,
    });
  }

  await Tree.assign(targetTree, sourceTree);

  if (stdout.isTTY) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }
}

// Wrap the source tree to show progress on set() operations. Handle both sync
// and async trees. All child trees will share the same counts object.
function showSetProgress(source, counts) {
  function showProgress() {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`Copied ${counts.copied} of ${counts.total}`);
  }

  const isSync = source instanceof Map;
  const MapClass = isSync ? SyncMap : AsyncMap;
  const iteratorKey = isSync ? Symbol.iterator : Symbol.asyncIterator;

  const progressTree = Object.assign(new MapClass(), {
    // Delegate these methods to source tree
    delete: source.delete.bind(source),
    keys: source.keys.bind(source),
    [iteratorKey]: source[iteratorKey].bind(source),

    // Wrap get() to apply progress tracking
    get(key) {
      return awaitIfPromise(source.get(key), (value) => {
        return Tree.isMap(value) ? showSetProgress(value, counts) : value;
      });
    },

    // Wrap set() to show progress
    set(key, value) {
      counts.total++;
      showProgress();
      try {
        const setResult = source.set(key, value);
        return awaitIfPromise(setResult, () => {
          counts.copied++;
          showProgress();
          return progressTree;
        });
      } catch (/** @type {any} */ error) {
        console.error(formatError(error));
        return progressTree;
      }
    },
  });

  return progressTree;
}

// Helper function that awaits a value if it's a Promise, then gives it to the
// function; otherwise calls the function directly. This helps us write code
// that can handle both sync and async values.
function awaitIfPromise(value, fn) {
  return value instanceof Promise ? value.then(fn) : fn(value);
}
