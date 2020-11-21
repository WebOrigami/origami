import chai from "chai";
import ArrowDeclaration from "../src/ArrowDeclaration.js";
const { assert } = chai;

describe("ArrowDeclaration", () => {
  it("can parse a simple declaration", () => {
    const declaration = new ArrowDeclaration("*.html ← (*.md).js");
    assert(declaration.sourcePattern, "*.html");
    assert(declaration.targetPattern, "*.md");
  });
});
