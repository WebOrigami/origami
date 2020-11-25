import chai from "chai";
import parseExpression from "../src/parseExpression.js";
const { assert } = chai;

describe.only("parseExpression", () => {
  it("recognizes text as text", () => {
    assert.equal(parseExpression("  hello  "), "hello");
  });

  it("recognizes a function call", () => {
    const token = parseExpression(" fn ( arg ) ");
    assert.deepEqual(token, {
      function: "fn",
      arguments: ["arg"],
    });
  });
});
