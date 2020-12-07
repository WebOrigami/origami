import { asyncGet } from "@explorablegraph/symbols";
import chai from "chai";
import Explorable from "../src/Explorable.js";
import FirstMatch from "../src/FirstMatch.js";
const { assert } = chai;

describe("FirstMatch", () => {
  it("returns the first defined value from an ordered list of exfns", async () => {
    const fixture = new FirstMatch([
      new Explorable({
        a: 1,
        c: 3,
      }),
      new Explorable({
        b: 2,
        c: 0, // Will be obscured by `c` above
        d: 4,
      }),
    ]);
    assert.equal(await fixture[asyncGet]("a"), 1);
    assert.equal(await fixture[asyncGet]("b"), 2);
    assert.equal(await fixture[asyncGet]("c"), 3);
    assert.equal(await fixture[asyncGet]("d"), 4);
    assert.equal(await fixture[asyncGet]("x"), undefined);
  });
});
