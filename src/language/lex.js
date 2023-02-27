export const token = {
  BACKTICK: "BACKTICK",
  COLON: "COLON",
  DOUBLE_LEFT_BRACE: "DOUBLE_LEFT_BRACE",
  DOUBLE_RIGHT_BRACE: "DOUBLE_RIGHT_BRACE",
  EQUAL: "EQUAL",
  LEFT_BRACE: "LEFT_BRACE",
  LEFT_BRACKET: "LEFT_BRACKET",
  LEFT_PAREN: "LEFT_PAREN",
  NUMBER: "NUMBER",
  REFERENCE: "REFERENCE",
  RIGHT_BRACE: "RIGHT_BRACE",
  RIGHT_BRACKET: "RIGHT_BRACKET",
  RIGHT_PAREN: "RIGHT_PAREN",
  SEPARATOR: "SEPARATOR",
  SLASH: "SLASH",
  STRING: "STRING",
};

const characterToToken = {
  "(": token.LEFT_PAREN,
  ")": token.RIGHT_PAREN,
  ",": token.SEPARATOR,
  "/": token.SLASH,
  ":": token.COLON,
  "=": token.EQUAL,
  "[": token.LEFT_BRACKET,
  "]": token.RIGHT_BRACKET,
  "`": token.BACKTICK,
  "{": token.LEFT_BRACE,
  "}": token.RIGHT_BRACE,
};

const isWhitespace = {
  " ": true,
  "\n": true,
  "\r": true,
  "\t": true,
};

const EOF = "\0";

export const state = {
  COMMENT: "COMMENT",
  DOUBLE_QUOTE_STRING: "DOUBLE_QUOTE_STRING",
  EXPRESSION: "EXPRESSION",
  REFERENCE: "REFERENCE",
  SINGLE_QUOTE_STRING: "SINGLE_QUOTE_STRING",
  TEMPLATE_DOCUMENT: "TEMPLATE_DOCUMENT",
  TEMPLATE_LITERAL: "TEMPLATE_LITERAL",
  WHITESPACE: "WHITESPACE",
};

/**
 * Lexes the given text into an array of tokens.
 *
 * @param {string} text
 * @param {any} initialState
 */
export function lex(text, initialState = state.EXPRESSION) {
  const tokens = [];
  let currentState = initialState;
  let lexeme = currentState === state.TEMPLATE_DOCUMENT ? "" : null;
  let templateContextStack = [];

  // Append an end-of-file character to the end of the text. This is a
  // convenience for the lexer so that it doesn't have to check for the end of
  // the text in every state.
  text += EOF;

  // Main state machine.
  let i = 0;
  while (i < text.length) {
    const c = text[i++];

    // A backslash in any state means the next character (with the exception of
    // a newline or EOF) is escaped. The backslash is skipped.
    if (c === "\\") {
      if (text[i] === "\n") {
        throw new SyntaxError("Unexpected newline after backslash.");
      }
      if (text[i] === EOF) {
        throw new SyntaxError("Unexpected end of file after backslash.");
      }
      lexeme += text[i++];
      continue;
    }

    switch (currentState) {
      case state.COMMENT:
        if (c === EOF || c === "\n" || c === "\r") {
          currentState = state.EXPRESSION;
        }
        break;

      case state.DOUBLE_QUOTE_STRING:
        if (c === '"') {
          tokens.push({
            type: token.STRING,
            lexeme,
          });
          lexeme = null;
          currentState = state.EXPRESSION;
        } else {
          lexeme += c;
        }
        break;

      case state.EXPRESSION:
        if (c === EOF) {
          // Do nothing; will fall out of loop
        } else if (c === "#") {
          currentState = state.COMMENT;
        } else if (c === "'") {
          lexeme = "";
          currentState = state.SINGLE_QUOTE_STRING;
        } else if (c === '"') {
          lexeme = "";
          currentState = state.DOUBLE_QUOTE_STRING;
        } else if (c === "`") {
          lexeme = "";
          tokens.push({ type: token.BACKTICK });
          currentState = state.TEMPLATE_LITERAL;
        } else if (isWhitespace[c]) {
          lexeme = c;
          currentState = state.WHITESPACE;
        } else if (c === "}" && text[i] === "}") {
          tokens.push({ type: token.DOUBLE_RIGHT_BRACE });
          // If we see a "}}" without a matching "{{", the lexer doesn't
          // fuss about it; the parser will.
          currentState = templateContextStack.pop() ?? initialState;
          lexeme =
            currentState === state.TEMPLATE_DOCUMENT ||
            currentState === state.TEMPLATE_LITERAL
              ? ""
              : null;
          i++;
        } else if (characterToToken[c]) {
          tokens.push({ type: characterToToken[c] });
        } else {
          // Anything else begins a reference.
          lexeme = c;
          currentState = state.REFERENCE;
        }
        break;

      case state.REFERENCE:
        if (isWhitespace[c] || characterToToken[c] || c === EOF) {
          // Reached end of reference.
          if (lexeme.length > 0) {
            const type = isNumber(lexeme) ? token.NUMBER : token.REFERENCE;
            tokens.push({
              type,
              lexeme,
            });
            lexeme = null;
          }
          currentState = state.EXPRESSION;
          i--; // Back up to consider the character again in the new state.
        } else {
          // Extend reference.
          lexeme += c;
        }
        break;

      case state.SINGLE_QUOTE_STRING:
        if (c === "'") {
          tokens.push({
            type: token.STRING,
            lexeme,
          });
          lexeme = "";
          currentState = state.EXPRESSION;
        } else {
          lexeme += c;
        }
        break;

      case state.TEMPLATE_DOCUMENT:
        // Note: template documents don't treat backticks specially.
        if (c === EOF) {
          if (lexeme.length > 0) {
            tokens.push({
              type: token.STRING,
              lexeme,
            });
            lexeme = "";
          }
        } else if (c === "{" && text[i] === "{") {
          if (lexeme.length > 0) {
            tokens.push({
              type: token.STRING,
              lexeme,
            });
            lexeme = "";
          }
          tokens.push({ type: token.DOUBLE_LEFT_BRACE });
          templateContextStack.push(currentState);
          currentState = state.EXPRESSION;
          i++;
        } else {
          lexeme += c;
        }
        break;

      case state.TEMPLATE_LITERAL:
        if (c === "`") {
          if (lexeme.length > 0) {
            tokens.push({
              type: token.STRING,
              lexeme,
            });
            lexeme = null;
          }
          tokens.push({ type: token.BACKTICK });
          currentState = state.EXPRESSION;
        } else if (c === "{" && text[i] === "{") {
          if (lexeme.length > 0) {
            tokens.push({
              type: token.STRING,
              lexeme,
            });
            lexeme = "";
          }
          tokens.push({ type: token.DOUBLE_LEFT_BRACE });
          templateContextStack.push(currentState);
          currentState = state.EXPRESSION;
          i++;
        } else {
          lexeme += c;
        }
        break;

      case state.WHITESPACE:
        if (isWhitespace[c]) {
          // Extend whitespace run.
          lexeme += c;
        } else {
          // Reached end of whitespace.
          if (lexeme.includes("\n")) {
            tokens.push({
              type: token.SEPARATOR,
            });
          }
          lexeme = null;
          currentState = state.EXPRESSION;
          i--; // Back up to consider the character again in the new state.
        }
        break;
    }
  }

  if (currentState !== initialState) {
    const message =
      {
        [state.SINGLE_QUOTE_STRING]: "Missing closing single quote (')",
        [state.DOUBLE_QUOTE_STRING]: 'Missing closing double quote (")',
        [state.TEMPLATE_LITERAL]: "Missing closing backtick (`)",
      }[currentState] || "Unexpected end of input.";
    throw new SyntaxError(message);
  }

  return tokens;
}

function isNumber(text) {
  // Based on https://stackoverflow.com/a/51733563/76472
  // but only accepts integers or floats, not exponential notation.
  const numberRegex = /^-?(?:\d+(?:\.\d*)?|\.\d+)/;
  return numberRegex.test(text);
}
