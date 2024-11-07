import { ObjectTree } from "@weborigami/async-tree";
import { OrigamiFiles } from "@weborigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import { builtins } from "../../src/builtins/internal.js";

/**
 * Run the programs in the `programs` directory as unit tests.
 *
 * Each program is expected to have an `actual.ori` file that contains the
 * output of the program, and an `expected` value that contains the expected
 * output.
 */
describe("programs", async () => {
  const dir = new URL("fixtures", import.meta.url);
  const fixtures = new OrigamiFiles(dir);
  fixtures.parent = new ObjectTree(builtins);
  for (const key of await fixtures.keys()) {
    const file = await fixtures.get(key);
    const program = await file.unpack();
    const title = await program.title;

    test(title, async () => {
      const actual = await program.actual;
      const expected = await program.expected;
      assert.deepEqual(actual, expected);
    });
  }
});
