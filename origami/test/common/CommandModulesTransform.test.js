import { FileTree } from "@weborigami/async-tree";
import { ImportModulesMixin } from "@weborigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import CommandModulesTransform from "../../src/common/CommandModulesTransform.js";

const fixturesUrl = new URL("fixtures", import.meta.url);
const commands = new (CommandModulesTransform(ImportModulesMixin(FileTree)))(
  fixturesUrl
);

describe("CommandModulesTransform", () => {
  test("maps foo.js file keys to foo keys", async () => {
    const keys = await commands.keys();
    assert.deepEqual([...keys], ["greet", "obj", "text"]);
  });

  test("Gets the exports of the .js file named by the key", async () => {
    const result = await commands.get("text");
    assert.equal(result, "This is the default export.");
  });
});
