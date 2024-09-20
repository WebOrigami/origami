/**
 * A simple test runner for the browser to run the subset of the Node.s test
 * runner used by the project.
 */

export default function assert(condition) {
  if (!condition) {
    throw new Error("Assertion failed");
  }
}

assert.equal = (actual, expected) => {
  if (Number.isNaN(actual) && Number.isNaN(expected)) {
    return;
  } else if (actual == expected) {
    return;
  } else {
    throw new Error(`Expected ${expected} but got ${actual}`);
  }
};

// This is a simplified deepEqual test that examines the conditions we care
// about. For reference, the actual Node assert.deepEqual is much more complex:
// see https://github.com/nodejs/node/blob/main/lib/internal/util/comparisons.js
assert.deepEqual = (actual, expected) => {
  if (actual === expected) {
    return;
  } else if (
    typeof actual === "object" &&
    actual != null &&
    typeof expected === "object" &&
    expected != null &&
    Object.keys(actual).length === Object.keys(expected).length
  ) {
    for (const prop in actual) {
      if (!expected.hasOwnProperty(prop)) {
        break;
      }
      assert.deepEqual(actual[prop], expected[prop]);
    }
    return;
  }

  throw new Error(`Expected ${expected} but got ${actual}`);
};

assert.rejects = async (promise) => {
  try {
    await promise;
    throw new Error("Expected promise to reject but it resolved");
  } catch (error) {
    return;
  }
};
