import { FileMap } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import sftp from "../../src/sftp/sftp.js";
import SftpExecMap from "../../src/sftp/SftpExecMap.js";

const parentUrl = new URL(".", import.meta.url);
const parent = new FileMap(parentUrl);

// Traverse to the fixture directory in the SFTP server
const fixturePath = new URL("fixture", import.meta.url).pathname;
const fixtureFiles = new FileMap(fixturePath);
const fixture = await sftp(
  {
    shellAccess: true,
    host: "localhost",
    path: fixturePath,
  },
  { parent },
);

describe("SftpExecMap", () => {
  test("child calls mkdir", async () => {
    const child = await fixture.child("newdir");
    assert.equal(child.path, fixture.path + "newdir/");
    assert(await fixtureFiles.get("newdir/"));
    await fixtureFiles.delete("newdir/");
  });

  test("child removes preexisting file before calling mkdir", async () => {
    await fixtureFiles.set("newdir", "some content");
    const child = await fixture.child("newdir");
    assert.equal(child.path, fixture.path + "newdir/");
    assert(await fixtureFiles.get("newdir/"));
    await fixtureFiles.delete("newdir/");
  });

  describe("delete", () => {
    test("delete a file", async () => {
      // Create the file directly
      await fixtureFiles.set("temp.txt", "Hello, Origami!");

      const result = await fixture.delete("temp.txt");
      assert(result);
      const value = await fixture.get("temp.txt");
      assert.equal(value, undefined);
    });

    test("delete a directory with trailing slash", async () => {
      // Create the directory directly
      await fixtureFiles.child("temp");
      const result = await fixture.delete("temp/");
      assert(result);
      const value = await fixtureFiles.get("temp");
      assert.equal(value, undefined);
    });

    test("delete a directory without trailing slash", async () => {
      // Create the directory directly
      await fixtureFiles.child("temp");
      const result = await fixture.delete("temp");
      assert(result);
      const value = await fixtureFiles.get("temp");
      assert.equal(value, undefined);
    });

    test("delete non-existent file returns false", async () => {
      const result = await fixture.delete("nonexistent.txt");
      assert.equal(result, false);
    });
  });

  test("manifest", async () => {
    assert(fixture instanceof SftpExecMap);
    const manifest = await fixture.manifest();
    const greetingsHash = manifest.get("greetings.yaml");
    assert.equal(greetingsHash, "7227b6f0c50442a4396a230665f505568642094f");
  });
});
