import ExplorableObject from "../../src/core/ExplorableObject.js";
import Template from "../../src/framework/Template.js";
import execute from "../../src/language/execute.js";
import * as ops from "../../src/language/ops.js";
import assert from "../assert.js";

class TestTemplate extends Template {
  async compile() {
    return async (data, graph) => {
      const result = await execute.call(this.compiled, graph);
      return result;
    };
  }
}

describe.only("Template", () => {
  it("defines ambient property @input that references input data", async () => {
    const template = new TestTemplate("template not used");
    template.code = [ops.scope, "@input"];
    const graph = new ExplorableObject({});
    const result = await template.apply("data goes here", graph);
    assert.equal(result, "data goes here");
  });

  //   it("gives template access to @key and @value", async () => {
  //     const template = new OrigamiTemplate(
  //       "{{ map(array, =`{{ @key }}: {{ @value }}\n`) }}"
  //     );
  //     const graph = ExplorableGraph.from({
  //       array: ["a", "b", "c"],
  //       map,
  //     });
  //     const result = await template.apply(null, graph);
  //     assert.equal(
  //       result,
  //       `0: a
  // 1: b
  // 2: c
  // `
  //     );
  //   });
});
