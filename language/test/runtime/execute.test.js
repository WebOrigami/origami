import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";

import { SyncMap } from "@weborigami/async-tree";
import systemCache from "../../src/cache/systemCache.js";
import execute from "../../src/runtime/execute.js";
import { createCode } from "../compiler/codeHelpers.js";

describe("execute", () => {
  beforeEach(() => {
    systemCache.clear();
  });

  test("if object in function position isn't a function, can unpack it", async () => {
    const fn = (...args) => args.join(",");
    const packed = new String();
    /** @type {any} */ (packed).unpack = async () => fn;
    const code = createCode([packed, "a", "b", "c"]);
    const result = await execute({ code });
    assert.equal(result, "a,b,c");
  });

  describe("argument unpacking", () => {
    test("unpacks packed arguments", async () => {
      const fn = (...args) => args.join(",");
      const packedArg = new String("a");
      /** @type {any} */ (packedArg).unpack = async () => "a unpacked";
      const code = createCode([fn, packedArg, "b", "c"]);
      const result = await execute({ code });
      assert.equal(result, "a unpacked,b,c");
    });

    test("unpacks plain object arguments", async () => {
      const fn = (...args) => args;
      const packedValue = new String("value");
      /** @type {any} */ (packedValue).unpack = async () => "unpacked value";
      const plainObjectArg = { key: packedValue };
      const code = createCode([fn, plainObjectArg]);
      const result = await execute({ code });
      assert.deepEqual(result, [{ key: "unpacked value" }]);
    });

    test("leaves arguments packed if function opts out of unpacking", async () => {
      const fn = (...args) => args;
      fn.unpackArgs = false;
      const packedArg = new String("b");
      /** @type {any} */ (packedArg).unpack = async () => "b unpacked";
      const code = createCode([fn, "a", packedArg, "c"]);
      const result = await execute({ code });
      assert.deepEqual(result, ["a", packedArg, "c"]);
    });
  });

  test("if function has parentAsTarget, it gets bound to state.container", async () => {
    /** @this {import("@weborigami/async-tree").SyncOrAsyncMap} */
    const fn = function () {
      return this;
    };
    fn.parentAsTarget = true;
    const parent = new SyncMap();
    const code = createCode([fn]);
    const result = await execute({ code, parent });
    assert.equal(result, parent);
  });
});
