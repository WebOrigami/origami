import { lex, token } from "../../src/language/lex.js";
import assert from "../assert.js";

describe.only("lex", () => {
  it("single character tokens", () => {
    const text = "(),/:[]{}";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: token.LEFT_PAREN },
      { type: token.RIGHT_PAREN },
      { type: token.COMMA },
      { type: token.SLASH },
      { type: token.COLON },
      { type: token.LEFT_BRACKET },
      { type: token.RIGHT_BRACKET },
      { type: token.LEFT_BRACE },
      { type: token.RIGHT_BRACE },
    ]);
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

  it("reference and a single quoted string", () => {
    const text = "foo 'bar'";
    const tokens = lex(text);
    assert.deepEqual(tokens, [
      { type: token.REFERENCE, lexeme: "foo" },
      { type: token.STRING, lexeme: "bar" },
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
});
