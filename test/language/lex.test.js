import { lex, state, tokenType } from "../../src/language/lex.js";
import assert from "../assert.js";

describe("lex", () => {
  it("array with comma separator", () => {
    const text = "[foo, bar]";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.LEFT_BRACKET },
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SEPARATOR },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.RIGHT_BRACKET },
    ]);
  });

  it("array with newline separators", () => {
    const text = "[\nfoo\nbar\n]";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.LEFT_BRACKET },
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SEPARATOR },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SEPARATOR },
      { type: tokenType.RIGHT_BRACKET },
    ]);
  });

  it("assignment", () => {
    const text = "foo = bar";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.EQUALS },
      { type: tokenType.REFERENCE, lexeme: "bar" },
    ]);
  });

  it("double quoted string", () => {
    const text = '"foo"';
    const tokens = lex(text);
    assert.deepEqual(tokens, [{ type: tokenType.STRING, lexeme: "foo" }]);
  });

  it("double quoted string with escaped double quote", () => {
    const text = `"foo \\"bar\\" baz"`;
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.STRING, lexeme: 'foo "bar" baz' },
    ]);
  });

  it("double quoted string with no closing quote", () => {
    const text = '"foo';
    assert.throws(() => lex(text));
  });

  it("function call with arguments in parentheses", () => {
    const text = "foo(bar, baz)";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.LEFT_PAREN },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SEPARATOR },
      { type: tokenType.REFERENCE, lexeme: "baz" },
      { type: tokenType.RIGHT_PAREN },
    ]);
  });

  it("number", () => {
    const text = "123";
    const tokens = lex(text);
    assert.deepEqual(tokens, [{ type: tokenType.NUMBER, lexeme: "123" }]);
  });

  it("list with commas", () => {
    const text = "foo,bar,baz";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SEPARATOR },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SEPARATOR },
      { type: tokenType.REFERENCE, lexeme: "baz" },
    ]);
  });

  it("list with line breaks", () => {
    const text = `foo
bar
baz`;
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SEPARATOR },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SEPARATOR },
      { type: tokenType.REFERENCE, lexeme: "baz" },
    ]);
  });

  it("object literal", () => {
    const text = "{ foo: bar, baz: qux }";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.LEFT_BRACE },
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.COLON },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SEPARATOR },
      { type: tokenType.REFERENCE, lexeme: "baz" },
      { type: tokenType.COLON },
      { type: tokenType.REFERENCE, lexeme: "qux" },
      { type: tokenType.RIGHT_BRACE },
    ]);
  });

  it("reference, comments, reference", () => {
    const text =
      "   foo   # This is a comment\n# And another comment\n    bar   ";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.REFERENCE, lexeme: "bar" },
    ]);
  });

  it("reference and a single quoted string", () => {
    const text = "foo 'bar'";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.STRING, lexeme: "bar" },
    ]);
  });

  it("reference with escaped whitespace", () => {
    const text = "foo\\ bar";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo bar" },
    ]);
  });

  it("references separated by whitespace", () => {
    const text = "foo bar baz";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.REFERENCE, lexeme: "baz" },
    ]);
  });

  it("single character tokens", () => {
    const text = "(),/:=[]{}";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.LEFT_PAREN },
      { type: tokenType.RIGHT_PAREN },
      { type: tokenType.SEPARATOR },
      { type: tokenType.SLASH },
      { type: tokenType.COLON },
      { type: tokenType.EQUALS },
      { type: tokenType.LEFT_BRACKET },
      { type: tokenType.RIGHT_BRACKET },
      { type: tokenType.LEFT_BRACE },
      { type: tokenType.RIGHT_BRACE },
    ]);
  });

  it("slash-separated path", () => {
    const text = "foo/bar/baz";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SLASH },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SLASH },
      { type: tokenType.REFERENCE, lexeme: "baz" },
    ]);
  });

  it("template document with embedded expression", () => {
    const text = "`foo` {{ bar }} baz";
    const tokens = lex(text, state.TEMPLATE_DOCUMENT);
    assert.deepEqual(tokens, [
      { type: tokenType.STRING, lexeme: "`foo` " },
      { type: tokenType.DOUBLE_LEFT_BRACE },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.DOUBLE_RIGHT_BRACE },
      { type: tokenType.STRING, lexeme: " baz" },
    ]);
  });

  it("template document with escaped left and right brace", () => {
    const text = "foo \\{{ bar \\}} baz";
    const tokens = lex(text, state.TEMPLATE_DOCUMENT);
    assert.deepEqual(tokens, [
      { type: tokenType.STRING, lexeme: "foo {{ bar }} baz" },
    ]);
  });

  it("template document with nested template", () => {
    const text = "{{ `foo {{bar}}` }}";
    const tokens = lex(text, state.TEMPLATE_DOCUMENT);
    assert.deepEqual(tokens, [
      { type: tokenType.STRING, lexeme: "" },
      { type: tokenType.DOUBLE_LEFT_BRACE },
      { type: tokenType.BACKTICK },
      { type: tokenType.STRING, lexeme: "foo " },
      { type: tokenType.DOUBLE_LEFT_BRACE },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.DOUBLE_RIGHT_BRACE },
      { type: tokenType.STRING, lexeme: "" },
      { type: tokenType.BACKTICK },
      { type: tokenType.DOUBLE_RIGHT_BRACE },
      { type: tokenType.STRING, lexeme: "" },
    ]);
  });

  it("template literal with embedded expression", () => {
    const text = "`foo {{ bar }} baz`";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.BACKTICK },
      { type: tokenType.STRING, lexeme: "foo " },
      { type: tokenType.DOUBLE_LEFT_BRACE },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.DOUBLE_RIGHT_BRACE },
      { type: tokenType.STRING, lexeme: " baz" },
      { type: tokenType.BACKTICK },
    ]);
  });
});
