import { lex, state, token } from "../../src/language/lex.js";
import assert from "../assert.js";

describe.only("lex", () => {
  it("array", () => {
    const text = "[foo, bar]";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: token.LEFT_BRACKET },
      { type: token.REFERENCE, lexeme: "foo" },
      { type: token.COMMA },
      { type: token.REFERENCE, lexeme: "bar" },
      { type: token.RIGHT_BRACKET },
    ]);
  });

  it("assignment", () => {
    const text = "foo = bar";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: token.REFERENCE, lexeme: "foo" },
      { type: token.EQUAL },
      { type: token.REFERENCE, lexeme: "bar" },
    ]);
  });

  it("double quoted string", () => {
    const text = '"foo"';
    const tokens = lex(text);
    assert.deepEqual(tokens, [{ type: token.STRING, lexeme: "foo" }]);
  });

  it("double quoted string with escaped double quote", () => {
    const text = `"foo \\"bar\\" baz"`;
    const tokens = lex(text);
    assert.deepEqual(tokens, [{ type: token.STRING, lexeme: 'foo "bar" baz' }]);
  });

  it("double quoted string with no closing quote", () => {
    const text = '"foo';
    assert.throws(() => lex(text));
  });

  it("function call with arguments in parentheses", () => {
    const text = "foo(bar, baz)";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: token.REFERENCE, lexeme: "foo" },
      { type: token.LEFT_PAREN },
      { type: token.REFERENCE, lexeme: "bar" },
      { type: token.COMMA },
      { type: token.REFERENCE, lexeme: "baz" },
      { type: token.RIGHT_PAREN },
    ]);
  });

  it("object literal", () => {
    const text = "{ foo: bar, baz: qux }";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: token.LEFT_BRACE },
      { type: token.REFERENCE, lexeme: "foo" },
      { type: token.COLON },
      { type: token.REFERENCE, lexeme: "bar" },
      { type: token.COMMA },
      { type: token.REFERENCE, lexeme: "baz" },
      { type: token.COLON },
      { type: token.REFERENCE, lexeme: "qux" },
      { type: token.RIGHT_BRACE },
    ]);
  });

  it("reference, comments, reference", () => {
    const text =
      "   foo   # This is a comment\n# And another comment\n    bar   ";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: token.REFERENCE, lexeme: "foo" },
      { type: token.REFERENCE, lexeme: "bar" },
    ]);
  });

  it("reference and a single quoted string", () => {
    const text = "foo 'bar'";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: token.REFERENCE, lexeme: "foo" },
      { type: token.STRING, lexeme: "bar" },
    ]);
  });

  it("reference with escaped whitespace", () => {
    const text = "foo\\ bar";
    const tokens = lex(text);
    assert.deepEqual(tokens, [{ type: token.REFERENCE, lexeme: "foo bar" }]);
  });

  it("references separated by whitespace", () => {
    const text = "foo bar baz";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: token.REFERENCE, lexeme: "foo" },
      { type: token.REFERENCE, lexeme: "bar" },
      { type: token.REFERENCE, lexeme: "baz" },
    ]);
  });

  it("single character tokens", () => {
    const text = "(),/:=[]{}";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: token.LEFT_PAREN },
      { type: token.RIGHT_PAREN },
      { type: token.COMMA },
      { type: token.SLASH },
      { type: token.COLON },
      { type: token.EQUAL },
      { type: token.LEFT_BRACKET },
      { type: token.RIGHT_BRACKET },
      { type: token.LEFT_BRACE },
      { type: token.RIGHT_BRACE },
    ]);
  });

  it("slash-separated path", () => {
    const text = "foo/bar/baz";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: token.REFERENCE, lexeme: "foo" },
      { type: token.SLASH },
      { type: token.REFERENCE, lexeme: "bar" },
      { type: token.SLASH },
      { type: token.REFERENCE, lexeme: "baz" },
    ]);
  });

  it("template document with embedded expression", () => {
    const text = "`foo` {{ bar }} baz";
    const tokens = lex(text, state.TEMPLATE_DOCUMENT);
    assert.deepEqual(tokens, [
      { type: token.STRING, lexeme: "`foo` " },
      { type: token.DOUBLE_LEFT_BRACE },
      { type: token.REFERENCE, lexeme: "bar" },
      { type: token.DOUBLE_RIGHT_BRACE },
      { type: token.STRING, lexeme: " baz" },
    ]);
  });

  it("template document with escaped left and right brace", () => {
    const text = "foo \\{{ bar \\}} baz";
    const tokens = lex(text, state.TEMPLATE_DOCUMENT);
    assert.deepEqual(tokens, [
      { type: token.STRING, lexeme: "foo {{ bar }} baz" },
    ]);
  });

  it("template document with nested template", () => {
    const text = "{{ `foo {{bar}}` }}";
    const tokens = lex(text, state.TEMPLATE_DOCUMENT);
    assert.deepEqual(tokens, [
      { type: token.DOUBLE_LEFT_BRACE },
      { type: token.BACKTICK },
      { type: token.STRING, lexeme: "foo " },
      { type: token.DOUBLE_LEFT_BRACE },
      { type: token.REFERENCE, lexeme: "bar" },
      { type: token.DOUBLE_RIGHT_BRACE },
      { type: token.BACKTICK },
      { type: token.DOUBLE_RIGHT_BRACE },
    ]);
  });

  it("template literal with embedded expression", () => {
    const text = "`foo {{ bar }} baz`";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: token.BACKTICK },
      { type: token.STRING, lexeme: "foo " },
      { type: token.DOUBLE_LEFT_BRACE },
      { type: token.REFERENCE, lexeme: "bar" },
      { type: token.DOUBLE_RIGHT_BRACE },
      { type: token.STRING, lexeme: " baz" },
      { type: token.BACKTICK },
    ]);
  });
});
