import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import FormulasTransform from "../../src/framework/FormulasTransform.js";
import InheritScopeTransform from "../../src/framework/InheritScopeTransform.js";
import assert from "../assert.js";

class FormulasObject extends FormulasTransform(ObjectGraph) {}

describe.only("FormulasTransform", () => {
  it("can get a value defined by a variable pattern", async () => {
    const fixture = new FormulasObject({
      "[x].txt": "Default text",
      "a.txt": "Specific text",
    });
    assert.equal(await fixture.get("a.txt"), "Specific text");
    assert.equal(await fixture.get("b.txt"), "Default text");
  });

  it("matches extensions", async () => {
    const fixture = new FormulasObject({
      "[x].html": "html",
      "[y]": "no extension",
    });
    assert.equal(await fixture.get("foo.html"), "html");
    assert.equal(await fixture.get("bar.baz.html"), "html");
    assert.equal(await fixture.get("foo.json"), undefined); // Has extension
    assert.equal(await fixture.get("foo"), "no extension");
  });

  it("can compute keys for variable patterns", async () => {
    const fixture = new FormulasObject({
      "[x].json": "html",
      a: "",
      b: "",
    });
    assert.deepEqual(await ExplorableGraph.keys(fixture), [
      "[x].json",
      "a",
      "a.json",
      "b",
      "b.json",
    ]);
  });

  it("can compute keys for assignments", async () => {
    const fixture = new FormulasObject({
      "a = b": "",
      b: "Hello",
    });
    assert.deepEqual(await ExplorableGraph.keys(fixture), ["a", "a = b", "b"]);
  });

  it("can get a value defined by an assignment", async () => {
    const fixture = new FormulasObject({
      "a = b": "",
      b: "Hello",
    });
    assert.equal(await fixture.get("a"), "Hello");
  });

  it("first formula that returns a defined value is used", async () => {
    const fixture = new FormulasObject({
      a: undefined,
      "a = b()": "",
      "a = c": "",
      b: () => undefined,
      c: "Hello",
    });
    assert.equal(await fixture.get("a"), "Hello");
  });

  it("can define assignments to variables", async () => {
    const fixture = new FormulasObject({
      "[name] = 'FOO'": "",
    });
    assert.equal(await fixture.get("alice"), "FOO");
    assert.equal(await fixture.get("bob"), "FOO");
  });

  it("can pass variable name to right-hand side", async () => {
    const fixture = new FormulasObject({
      "[name] = `Hello, {{name}}.`": "",
      Carol: "Hey, Carol.", // Explicit values preferred over formulas.
      "David = 'Hi, David.'": "", // Constant formulas preferred over patterns.
    });
    assert.deepEqual(await fixture.get("Alice"), "Hello, Alice.");
    assert.deepEqual(await fixture.get("Bob"), "Hello, Bob.");
    assert.deepEqual(await fixture.get("Carol"), "Hey, Carol.");
    assert.deepEqual(await fixture.get("David"), "Hi, David.");
  });

  // More focused version of test also performed in MetaTransform.tests.js.
  it("can inherit bound variables", async () => {
    const fixture = new (InheritScopeTransform(FormulasObject))({
      "[x]": {
        "[y] = `{{x}}{{y}}`": "",
      },
    });
    assert.equal(
      await ExplorableGraph.traverse(fixture, "foo", "bar"),
      "foobar"
    );
    assert.equal(
      await ExplorableGraph.traverse(fixture, "fizz", "buzz"),
      "fizzbuzz"
    );
  });
});
