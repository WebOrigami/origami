import assert from "node:assert";
import { describe, test } from "node:test";
import { lex, state, tokenType } from "../../src/language/lex.js";

describe("lex", () => {
  test("array with comma separator", () => {
    const text = "[foo, bar]";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.LEFT_BRACKET, lexeme: "[" },
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SEPARATOR, lexeme: "," },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.RIGHT_BRACKET, lexeme: "]" },
    ]);
  });

  test("array with newline separators", () => {
    const text = "[\nfoo\nbar\n]";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.LEFT_BRACKET, lexeme: "[" },
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SEPARATOR, lexeme: "\n" },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.RIGHT_BRACKET, lexeme: "]" },
    ]);
  });

  test("assignment", () => {
    const text = "foo = bar";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
      { type: tokenType.EQUALS, lexeme: "=" },
      { type: tokenType.REFERENCE, lexeme: "bar" },
    ]);
  });

  test("double quoted string", () => {
    const text = '"foo"';
    const tokens = lex(text);
    assert.deepEqual(tokens, [{ type: tokenType.STRING, lexeme: "foo" }]);
  });

  test("double quoted string with escaped double quote", () => {
    const text = `"foo \\"bar\\" baz"`;
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.STRING, lexeme: 'foo "bar" baz' },
    ]);
  });

  test("double quoted string with no closing quote", () => {
    const text = '"foo';
    assert.throws(() => lex(text));
  });

  test("function call with arguments in parentheses", () => {
    const text = "foo(bar, baz)";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.LEFT_PAREN, lexeme: "(" },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SEPARATOR, lexeme: "," },
      { type: tokenType.REFERENCE, lexeme: "baz" },
      { type: tokenType.RIGHT_PAREN, lexeme: ")" },
    ]);
  });

  test("function call with implicit parentheses and lambda argument", () => {
    const text = "fn =`x`";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "fn" },
      { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
      { type: tokenType.EQUALS, lexeme: "=" },
      { type: tokenType.BACKTICK, lexeme: "`" },
      { type: tokenType.STRING, lexeme: "x" },
      { type: tokenType.BACKTICK, lexeme: "`" },
    ]);
  });

  test("function call with absolute path argument", () => {
    const text = "fn /usr/alice";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "fn" },
      { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
      { type: tokenType.SLASH, lexeme: "/" },
      { type: tokenType.REFERENCE, lexeme: "usr" },
      { type: tokenType.SLASH, lexeme: "/" },
      { type: tokenType.REFERENCE, lexeme: "alice" },
    ]);
  });

  test("number", () => {
    const text = "123";
    const tokens = lex(text);
    assert.deepEqual(tokens, [{ type: tokenType.NUMBER, lexeme: "123" }]);
  });

  test("list with commas", () => {
    const text = "foo,bar,baz";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SEPARATOR, lexeme: "," },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SEPARATOR, lexeme: "," },
      { type: tokenType.REFERENCE, lexeme: "baz" },
    ]);
  });

  test("list with line breaks", () => {
    const text = `foo
bar
baz`;
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SEPARATOR, lexeme: "\n" },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SEPARATOR, lexeme: "\n" },
      { type: tokenType.REFERENCE, lexeme: "baz" },
    ]);
  });

  test("object literal", () => {
    const text = "{ foo: bar, baz: qux }";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.LEFT_BRACE, lexeme: "{" },
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.COLON, lexeme: ":" },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SEPARATOR, lexeme: "," },
      { type: tokenType.REFERENCE, lexeme: "baz" },
      { type: tokenType.COLON, lexeme: ":" },
      { type: tokenType.REFERENCE, lexeme: "qux" },
      { type: tokenType.RIGHT_BRACE, lexeme: "}" },
    ]);
  });

  test("reference, comments, reference", () => {
    const text =
      "   foo   # This is a comment\n# And another comment\n    bar   ";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SEPARATOR, lexeme: "   \n\n    " },
      { type: tokenType.REFERENCE, lexeme: "bar" },
    ]);
  });

  test("reference and a single quoted string", () => {
    const text = "foo 'bar'";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
      { type: tokenType.STRING, lexeme: "bar" },
    ]);
  });

  test("reference with escaped whitespace", () => {
    const text = "foo\\ bar";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo bar" },
    ]);
  });

  test("references separated by whitespace", () => {
    const text = "foo bar baz";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
      { type: tokenType.REFERENCE, lexeme: "baz" },
    ]);
  });

  test("single character tokens", () => {
    const text = "(),/:=[]{}";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.LEFT_PAREN, lexeme: "(" },
      { type: tokenType.RIGHT_PAREN, lexeme: ")" },
      { type: tokenType.SEPARATOR, lexeme: "," },
      { type: tokenType.SLASH, lexeme: "/" },
      { type: tokenType.COLON, lexeme: ":" },
      { type: tokenType.EQUALS, lexeme: "=" },
      { type: tokenType.LEFT_BRACKET, lexeme: "[" },
      { type: tokenType.RIGHT_BRACKET, lexeme: "]" },
      { type: tokenType.LEFT_BRACE, lexeme: "{" },
      { type: tokenType.RIGHT_BRACE, lexeme: "}" },
    ]);
  });

  test("slash-separated path", () => {
    const text = "foo/bar/baz";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SLASH, lexeme: "/" },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SLASH, lexeme: "/" },
      { type: tokenType.REFERENCE, lexeme: "baz" },
    ]);
  });

  test("template document with embedded expression", () => {
    const text = "`foo` {{ bar }} baz";
    const tokens = lex(text, state.TEMPLATE_DOCUMENT);
    assert.deepEqual(tokens, [
      { type: tokenType.STRING, lexeme: "`foo` " },
      { type: tokenType.DOUBLE_LEFT_BRACE, lexeme: "{{" },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.DOUBLE_RIGHT_BRACE, lexeme: "}}" },
      { type: tokenType.STRING, lexeme: " baz" },
    ]);
  });

  test("template document with escaped left and right brace", () => {
    const text = "foo \\{{ bar \\}} baz";
    const tokens = lex(text, state.TEMPLATE_DOCUMENT);
    assert.deepEqual(tokens, [
      { type: tokenType.STRING, lexeme: "foo {{ bar }} baz" },
    ]);
  });

  test("template document with extra whitespace", () => {
    const text = "start\n{{ fn `\nnested\n` }}\nend";
    const tokens = lex(text, state.TEMPLATE_DOCUMENT);
    assert.deepEqual(tokens, [
      { type: tokenType.STRING, lexeme: "start\n" },
      { type: tokenType.DOUBLE_LEFT_BRACE, lexeme: "{{" },
      { type: tokenType.REFERENCE, lexeme: "fn" },
      { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
      { type: tokenType.BACKTICK, lexeme: "`" },
      { type: tokenType.STRING, lexeme: "nested\n" },
      { type: tokenType.BACKTICK, lexeme: "`" },
      { type: tokenType.DOUBLE_RIGHT_BRACE, lexeme: "}}" },
      { type: tokenType.STRING, lexeme: "end" },
    ]);
  });

  test("template document with nested template", () => {
    const text = "{{ `foo {{bar}}` }}";
    const tokens = lex(text, state.TEMPLATE_DOCUMENT);
    assert.deepEqual(tokens, [
      { type: tokenType.STRING, lexeme: "" },
      { type: tokenType.DOUBLE_LEFT_BRACE, lexeme: "{{" },
      { type: tokenType.BACKTICK, lexeme: "`" },
      { type: tokenType.STRING, lexeme: "foo " },
      { type: tokenType.DOUBLE_LEFT_BRACE, lexeme: "{{" },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.DOUBLE_RIGHT_BRACE, lexeme: "}}" },
      { type: tokenType.STRING, lexeme: "" },
      { type: tokenType.BACKTICK, lexeme: "`" },
      { type: tokenType.DOUBLE_RIGHT_BRACE, lexeme: "}}" },
      { type: tokenType.STRING, lexeme: "" },
    ]);
  });

  test("template literal with embedded expression", () => {
    const text = "`foo {{ bar }} baz`";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.BACKTICK, lexeme: "`" },
      { type: tokenType.STRING, lexeme: "foo " },
      { type: tokenType.DOUBLE_LEFT_BRACE, lexeme: "{{" },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.DOUBLE_RIGHT_BRACE, lexeme: "}}" },
      { type: tokenType.STRING, lexeme: " baz" },
      { type: tokenType.BACKTICK, lexeme: "`" },
    ]);
  });
});
