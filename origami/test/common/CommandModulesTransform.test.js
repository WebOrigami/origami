import { FileTree } from "@graphorigami/core";
import { ImportModulesMixin } from "@graphorigami/language";
import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import CommandModulesTransform from "../../src/common/CommandModulesTransform.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const commands = new (CommandModulesTransform(ImportModulesMixin(FileTree)))(
  fixturesDirectory
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
