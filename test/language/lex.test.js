import { lex, state, tokenType } from "../../src/language/lex.js";
import assert from "../assert.js";

describe("lex", () => {
  it("array with comma separator", () => {
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

  it("array with newline separators", () => {
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

  it("assignment", () => {
    const text = "foo = bar";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
      { type: tokenType.EQUALS, lexeme: "=" },
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
      { type: tokenType.LEFT_PAREN, lexeme: "(" },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SEPARATOR, lexeme: "," },
      { type: tokenType.REFERENCE, lexeme: "baz" },
      { type: tokenType.RIGHT_PAREN, lexeme: ")" },
    ]);
  });

  it("function call with implicit parentheses and lambda argument", () => {
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
      { type: tokenType.SEPARATOR, lexeme: "," },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SEPARATOR, lexeme: "," },
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
      { type: tokenType.SEPARATOR, lexeme: "\n" },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SEPARATOR, lexeme: "\n" },
      { type: tokenType.REFERENCE, lexeme: "baz" },
    ]);
  });

  it("object literal", () => {
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

  it("reference, comments, reference", () => {
    const text =
      "   foo   # This is a comment\n# And another comment\n    bar   ";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SEPARATOR, lexeme: "   \n\n    " },
      { type: tokenType.REFERENCE, lexeme: "bar" },
    ]);
  });

  it("reference and a single quoted string", () => {
    const text = "foo 'bar'";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: tokenType.REFERENCE, lexeme: "foo" },
      { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
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
      { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
      { type: tokenType.REFERENCE, lexeme: "bar" },
      { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
      { type: tokenType.REFERENCE, lexeme: "baz" },
    ]);
  });

  it("single character tokens", () => {
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

  it("slash-separated path", () => {
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

  it("template document with embedded expression", () => {
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

  it("template document with escaped left and right brace", () => {
    const text = "foo \\{{ bar \\}} baz";
    const tokens = lex(text, state.TEMPLATE_DOCUMENT);
    assert.deepEqual(tokens, [
      { type: tokenType.STRING, lexeme: "foo {{ bar }} baz" },
    ]);
  });

  it("template document with extra whitespace", () => {
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

  it("template document with nested template", () => {
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

  it("template literal with embedded expression", () => {
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
