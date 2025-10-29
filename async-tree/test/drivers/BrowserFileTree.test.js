import assert from "node:assert";
import { describe, test } from "node:test";
import BrowserFileTree from "../../src/drivers/BrowserFileTree.js";
import { Tree } from "../../src/internal.js";

// Skip these tests if we're not in a browser.
const isBrowser = typeof window !== "undefined";
if (isBrowser) {
  describe.skip("BrowserFileTree", async () => {
    test("can get the keys of the tree", async () => {
      const fixture = await createFixture();
      assert.deepEqual(Array.from(await fixture.keys()), [
        "Alice.md",
        "Bob.md",
        "Carol.md",
        "subfolder/",
      ]);
    });

    test("can get the value for a key", async () => {
      const fixture = await createFixture();
      const buffer = await fixture.get("Alice.md");
      assert.equal(text(buffer), "Hello, **Alice**.");
    });

    test("getting an unsupported key returns undefined", async () => {
      const fixture = await createFixture();
      assert.equal(await fixture.get("xyz"), undefined);
    });

    test("getting empty key returns undefined", async () => {
      const fixture = await createFixture();
      assert.equal(await fixture.get(""), undefined);
    });

    test("getting a null/undefined key throws an exception", async () => {
      const fixture = await createFixture();
      await assert.rejects(async () => {
        await fixture.get(null);
      });
      await assert.rejects(async () => {
        await fixture.get(undefined);
      });
    });

    test("sets parent on subtrees", async () => {
      const fixture = await createFixture();
      const subfolder = await fixture.get("subfolder");
      assert.equal(subfolder.parent, fixture);
    });

    test("can retrieve values with optional trailing slash", async () => {
      const fixture = await createFixture();
      assert(await fixture.get("Alice.md"));
      assert(await fixture.get("Alice.md/"));
      assert(await fixture.get("subfolder"));
      assert(await fixture.get("subfolder/"));
    });

    test("can set a value", async () => {
      const fixture = await createFixture();

      // Update existing key.
      await fixture.set("Alice.md", "Goodbye, **Alice**.");

      // New key.
      await fixture.set("David.md", "Hello, **David**.");

      // Delete key.
      await fixture.set("Bob.md", undefined);

      // Delete non-existent key.
      await fixture.set("xyz", undefined);

      assert.deepEqual(await strings(fixture), {
        "Alice.md": "Goodbye, **Alice**.",
        "Carol.md": "Hello, **Carol**.",
        "David.md": "Hello, **David**.",
        subfolder: {},
      });
    });

    test("can create a subfolder via set", async () => {
      const fixture = await createFixture();
      const tree = {
        async get(key) {
          const name = key.replace(/\.md$/, "");
          return `Hello, **${name}**.`;
        },
        async keys() {
          return ["Ellen.md"];
        },
      };
      await fixture.set("more", tree);
      assert.deepEqual(await strings(fixture), {
        "Alice.md": "Hello, **Alice**.",
        "Bob.md": "Hello, **Bob**.",
        "Carol.md": "Hello, **Carol**.",
        more: {
          "Ellen.md": "Hello, **Ellen**.",
        },
        subfolder: {},
      });
    });
  });
}

async function createFile(directory, name, contents) {
  const file = await directory.getFileHandle(name, { create: true });
  const writable = await file.createWritable();
  await writable.write(contents);
  await writable.close();
}

let count = 0;
async function createFixture() {
  const root = await navigator.storage.getDirectory();
  const directory = await root.getDirectoryHandle("async-tree", {
    create: true,
  });

  // Create a new subdirectory for each test.
  const subdirectoryName = `test${count++}`;

  // Delete any pre-existing subdirectory with that name.
  try {
    await directory.removeEntry(subdirectoryName, { recursive: true });
  } catch (e) {
    // Ignore errors.
  }

  const subdirectory = await directory.getDirectoryHandle(subdirectoryName, {
    create: true,
  });

  await createFile(subdirectory, "Alice.md", "Hello, **Alice**.");
  await createFile(subdirectory, "Bob.md", "Hello, **Bob**.");
  await createFile(subdirectory, "Carol.md", "Hello, **Carol**.");

  await subdirectory.getDirectoryHandle("subfolder", {
    create: true,
  });

  return new BrowserFileTree(subdirectory);
}

async function strings(tree) {
  return Tree.plain(
    Tree.map(tree, {
      deep: true,
      value: (value) => text(value),
    })
  );
}

function text(arrayBuffer) {
  return new TextDecoder().decode(arrayBuffer);
}
