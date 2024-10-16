import assert from "node:assert";
import { describe, test } from "node:test";
import { Tree } from "../../src/internal.js";
import groupFn from "../../src/operations/groupFn.js";

describe("groupFn transform", () => {
  test("groups an array using a group key function", async () => {
    const fonts = [
      { name: "Aboreto", tags: ["Sans Serif"] },
      { name: "Albert Sans", tags: ["Geometric", "Sans Serif"] },
      { name: "Alegreya", tags: ["Serif"] },
      { name: "Work Sans", tags: ["Grotesque", "Sans Serif"] },
    ];
    const tree = Tree.from(fonts);
    const grouped = await groupFn((value, key, tree) => value.tags)(tree);
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

  test("groups an object using a group key function", async () => {
    const fonts = {
      Aboreto: { tags: ["Sans Serif"] },
      "Albert Sans": { tags: ["Geometric", "Sans Serif"] },
      Alegreya: { tags: ["Serif"] },
      "Work Sans": { tags: ["Grotesque", "Sans Serif"] },
    };
    const tree = Tree.from(fonts);
    const grouped = await groupFn((value, key, tree) => value.tags)(tree);
    assert.deepEqual(await Tree.plain(grouped), {
      Geometric: {
        "Albert Sans": { tags: ["Geometric", "Sans Serif"] },
      },
      Grotesque: {
        "Work Sans": { tags: ["Grotesque", "Sans Serif"] },
      },
      "Sans Serif": {
        Aboreto: { tags: ["Sans Serif"] },
        "Albert Sans": { tags: ["Geometric", "Sans Serif"] },
        "Work Sans": { tags: ["Grotesque", "Sans Serif"] },
      },
      Serif: {
        Alegreya: { tags: ["Serif"] },
      },
    });
  });
});
