/**
 * A simple test runner for the browser to run the subset of the Node.s test
 * runner used by the project.
 */

let promises = {};
let currentSuite;

const markers = {
  success: "✅",
  skipped: "ー",
  fail: "❌",
};

export async function describe(name, fn) {
  promises[name] = [];
  currentSuite = name;
  fn();
  const results = await Promise.all(promises[name]);
  const someFailed = results.some((result) => result.result === "fail");
  const header = `${someFailed ? markers.fail : markers.success} ${name}`;
  console[someFailed ? "group" : "groupCollapsed"](header);
  for (const result of results) {
    const marker = markers[result.result];
    const name = result.name;
    const message = result.result === "fail" ? `: ${result.message}` : "";
    const skipped = result.result === "skipped" ? " [skipped]" : "";
    console.log(`${marker} ${name}${message}${skipped}`);
  }
  console.groupEnd();
}

// Node test() calls can call an async function, but the test() function isn't
// declared async. We implicitly wrap the test call with a Promise and add it to
// the list of promises for the current suite.
export async function test(name, fn) {
  promises[currentSuite].push(runTest(name, fn));
}

test.skip = (name, fn) => {
  promises[currentSuite].push(Promise.resolve({ result: "skipped", name }));
};

async function runTest(name, fn) {
  try {
    await fn();
    return { result: "success", name };
  } catch (/** @type {any} */ error) {
    return { result: "fail", name, message: error.message };
  }
}
