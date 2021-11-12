import { ExplorableGraph } from "../../exports.js";
import mapTypes from "../../src/eg/commands/mapTypes.js";
import assert from "../assert.js";

describe("mapTypes", () => {
  it("applies a mapping function to convert designated file extensions", async () => {
    const fixture = {
      "file1.txt": "will be mapped",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    };
    const mapped = mapTypes(fixture, ".txt", ".upper", (value) =>
      value.toUpperCase()
    );
    assert.deepEqual(await ExplorableGraph.plain(mapped), {
      "file1.upper": "WILL BE MAPPED",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
  });
});
