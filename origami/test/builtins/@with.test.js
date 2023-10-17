import { ObjectTree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import withTree from "../../src/builtins/@with.js";

describe("@with", () => {
  test("adds a tree to scope", async () => {
    const scope = new ObjectTree({
      inScope: "foo",
    });
    const result = await withTree.call(
      scope,
      {
        inWith: "bar",
      },
      /** @this {import("@graphorigami/types").AsyncDictionary} */
      async function () {
        return `${await this.get("inScope")}-${await this.get("inWith")}`;
      }
    );
    assert.equal(result, "foo-bar");
  });
});
