import { args, AsyncMap, SyncMap, Tree } from "@weborigami/async-tree";
import process, { stdout } from "node:process";

/**
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} source
 * @param {Maplike} target
 */
export default async function copy(source, target) {
  const sourceTree = await args.map(source, "Dev.copy", { position: 1 });
  let targetTree = await args.map(target, "Dev.copy", { position: 2 });

  let progressTree;
  if (stdout.isTTY) {
    progressTree = showSetProgress(targetTree, {
      copied: 0,
      total: 0,
    });
  } else {
    progressTree = targetTree;
  }

  await Tree.assign(progressTree, sourceTree);

  if (stdout.isTTY) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }
}

// Wrap the target tree to show progress on set() operations. Handle both sync
// and async trees. All child trees will share the same counts object.
function showSetProgress(target, counts) {
  function showProgress() {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`Copied ${counts.copied} of ${counts.total}`);
  }

  const isSync = target instanceof Map;
  const MapClass = isSync ? SyncMap : AsyncMap;
  const iteratorKey = isSync ? Symbol.iterator : Symbol.asyncIterator;

  const progressTree = Object.assign(new MapClass(), {
    delete: target.delete.bind(target),
    keys: target.keys.bind(target),
    [iteratorKey]: target[iteratorKey].bind(target),

    // Wrap get() to apply progress tracking
    get(key) {
      return awaitIfPromise(target.get(key), (value) => {
        return Tree.isMap(value) ? showSetProgress(value, counts) : value;
      });
    },

    // Wrap set() to show progress
    set(key, value) {
      counts.total++;
      showProgress();
      const setResult = target.set(key, value);
      return awaitIfPromise(setResult, () => {
        counts.copied++;
        showProgress();
        return progressTree;
      });
    },
  });

  if (typeof target.child === "function") {
    // @ts-ignore
    progressTree.child = async function (key) {
      counts.total++;
      showProgress();
      const childResult = target.child(key);
      return awaitIfPromise(childResult, (child) => {
        counts.copied++;
        showProgress();
        return showSetProgress(child, counts);
      });
    };
  }

  if (typeof target.assign === "function") {
    // @ts-ignore
    progressTree.assign = target.assign.bind(target);
  }

  return progressTree;
}

// Helper function that awaits a value if it's a Promise, then gives it to the
// function; otherwise calls the function directly. This helps us write code
// that can handle both sync and async values.
function awaitIfPromise(value, fn) {
  return value instanceof Promise ? value.then(fn) : fn(value);
}
