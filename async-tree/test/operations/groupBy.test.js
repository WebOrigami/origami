import assert from "node:assert";
import { describe, test } from "node:test";
import from from "../../src/operations/from.js";
import groupBy from "../../src/operations/groupBy.js";
import plain from "../../src/operations/plain.js";

describe("groupBy transform", () => {
  test("groups an array using a group key function", async () => {
    const fonts = [
      { name: "Aboreto", tags: ["Sans Serif"] },
      { name: "Albert Sans", tags: ["Geometric", "Sans Serif"] },
      { name: "Alegreya", tags: ["Serif"] },
      { name: "Work Sans", tags: ["Grotesque", "Sans Serif"] },
    ];
    const tree = from(fonts);
    const grouped = await groupBy(tree, (value, key, tree) => value.tags);
    assert.deepEqual(await plain(grouped), {
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
    const tree = from(fonts);
    const grouped = await groupBy(tree, (value, key, tree) => value.tags);
    assert.deepEqual(await plain(grouped), {
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
