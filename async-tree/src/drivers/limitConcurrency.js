/**
 * Wrap an async function with a function that limits the number of concurrent
 * calls to that function.
 */
export default function limitConcurrency(fn, maxConcurrency) {
  const queue = [];
  const activeCallPool = new Set();

  return async function limitedFunction(...args) {
    // Our turn is represented by a promise that can be externally resolved
    const turnWithResolvers = withResolvers();

    // Construct a promise for the result of the function call
    const resultPromise =
      // Block until its our turn
      turnWithResolvers.promise
        .then(() => fn(...args)) // Call the function and return its result
        .finally(() => {
          // Remove the promise from the active pool
          activeCallPool.delete(resultPromise);
          // Tell the next call in the queue it can proceed
          next();
        });

    // Join the queue
    queue.push({
      promise: resultPromise,
      resolve: turnWithResolvers.resolve,
    });

    if (activeCallPool.size >= maxConcurrency) {
      // The pool is full; wait for the next active call to complete. The call
      // will remove its own completed promise from the active pool.
      await Promise.any(activeCallPool);
    } else {
      next();
    }

    return resultPromise;
  };

  // If there are calls in the queue and the active pool is not full, resolve
  // the next call in the queue and add it to the active pool.
  function next() {
    if (queue.length > 0 && activeCallPool.size < maxConcurrency) {
      const { promise, resolve } = queue.shift();
      activeCallPool.add(promise);
      resolve();
    }
  }
}

// Polyfill Promise.withResolvers until Node LTS supports it
function withResolvers() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
