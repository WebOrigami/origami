import assert from "node:assert";
import { describe, test } from "node:test";
import MergeDeepGraph from "../../src/common/MergeDeepGraph.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";

describe("MergeDeepGraph", () => {
  test("can merge deep", async () => {
    const fixture = new MergeDeepGraph(
      {
        a: {
          b: 1,
          c: {
            d: 2,
          },
        },
      },
      {
        a: {
          b: 0, // Will be obscured by `b` above
          c: {
            e: 3,
          },
          f: 4,
        },
      }
    );
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      a: {
        b: 1,
        c: {
          d: 2,
          e: 3,
        },
        f: 4,
      },
    });
  });
});
