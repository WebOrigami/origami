import { AsyncMap, SyncMap, Tree } from "@weborigami/async-tree";
import process, { stdout } from "node:process";

export default async function showProgress(fn, source, target) {
  let progressTree;
  if (stdout.isTTY) {
    progressTree = wrapWithProgress(target, {
      copied: 0,
      total: 0,
    });
  } else {
    progressTree = target;
  }

  await fn(progressTree, source);

  if (stdout.isTTY) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }
}

// Wrap the target tree to show progress on set() operations. Handle both sync
// and async trees. All child trees will share the same counts object.
function wrapWithProgress(target, counts) {
  function displayProgress() {
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
        return Tree.isMap(value) ? wrapWithProgress(value, counts) : value;
      });
    },

    // Wrap set() to show progress
    set(key, value) {
      counts.total++;
      displayProgress();
      const setResult = target.set(key, value);
      return awaitIfPromise(setResult, () => {
        counts.copied++;
        displayProgress();
        return progressTree;
      });
    },
  });

  if (typeof target.child === "function") {
    // @ts-ignore
    progressTree.child = async function (key) {
      counts.total++;
      displayProgress();
      const childResult = target.child(key);
      return awaitIfPromise(childResult, (child) => {
        counts.copied++;
        displayProgress();
        return wrapWithProgress(child, counts);
      });
    };
  }

  if (typeof target.apply === "function") {
    // @ts-ignore
    progressTree.apply = target.apply.bind(target);
  }
  if (typeof target.replaceWith === "function") {
    // @ts-ignore
    progressTree.replaceWith = target.replaceWith.bind(target);
  }

  return progressTree;
}

// Helper function that awaits a value if it's a Promise, then gives it to the
// function; otherwise calls the function directly. This helps us write code
// that can handle both sync and async values.
function awaitIfPromise(value, fn) {
  return value instanceof Promise ? value.then(fn) : fn(value);
}
