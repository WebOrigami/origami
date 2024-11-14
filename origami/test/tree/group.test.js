import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import group from "../../src/tree/group.js";

describe("group", () => {
  test("groups using a group key function", async () => {
    const fonts = [
      { name: "Aboreto", tags: ["Sans Serif"] },
      { name: "Albert Sans", tags: ["Geometric", "Sans Serif"] },
      { name: "Alegreya", tags: ["Serif"] },
      { name: "Work Sans", tags: ["Grotesque", "Sans Serif"] },
    ];
    const grouped = await group.call(
      null,
      fonts,
      (value, key, tree) => value.tags
    );
    assert.deepEqual(await Tree.plain(grouped), {
      Geometric: [{ name: "Albert Sans", tags: ["Geometric", "Sans Serif"] }],
      Grotesque: [{ name: "Work Sans", tags: ["Grotesque", "Sans Serif"] }],
      "Sans Serif": [
        { name: "Aboreto", tags: ["Sans Serif"] },
        { name: "Albert Sans", tags: ["Geometric", "Sans Serif"] },
        { name: "Work Sans", tags: ["Grotesque", "Sans Serif"] },
      ],
      Serif: [{ name: "Alegreya", tags: ["Serif"] }],
    });
  });
});
