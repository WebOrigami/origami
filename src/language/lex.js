export const tokenType = {
  BACKTICK: "BACKTICK",
  COLON: "COLON",
  DOUBLE_LEFT_BRACE: "DOUBLE_LEFT_BRACE",
  DOUBLE_RIGHT_BRACE: "DOUBLE_RIGHT_BRACE",
  EQUALS: "EQUALS",
  LEFT_BRACE: "LEFT_BRACE",
  LEFT_BRACKET: "LEFT_BRACKET",
  LEFT_PAREN: "LEFT_PAREN",
  NUMBER: "NUMBER",
  REFERENCE: "REFERENCE",
  RIGHT_BRACE: "RIGHT_BRACE",
  RIGHT_BRACKET: "RIGHT_BRACKET",
  RIGHT_PAREN: "RIGHT_PAREN",
  SEPARATOR: "SEPARATOR",
  SIGNIFICANT_SPACE: "SIGNIFICANT_SPACE",
  SLASH: "SLASH",
  STRING: "STRING",
  WHITESPACE: "WHITESPACE", // Internal; never returned by the lexer.
};

const characterToToken = {
  "(": tokenType.LEFT_PAREN,
  ")": tokenType.RIGHT_PAREN,
  ",": tokenType.SEPARATOR,
  "/": tokenType.SLASH,
  ":": tokenType.COLON,
  "=": tokenType.EQUALS,
  "[": tokenType.LEFT_BRACKET,
  "]": tokenType.RIGHT_BRACKET,
  "`": tokenType.BACKTICK,
  "{": tokenType.LEFT_BRACE,
  "}": tokenType.RIGHT_BRACE,
};

const tokenCanBeginTerm = {
  [tokenType.BACKTICK]: true,
  [tokenType.EQUALS]: true,
  [tokenType.LEFT_BRACE]: true,
  [tokenType.LEFT_BRACKET]: true,
  [tokenType.LEFT_PAREN]: true,
  [tokenType.NUMBER]: true,
  [tokenType.REFERENCE]: true,
  [tokenType.STRING]: true,
};

const tokenCanEndTerm = {
  [tokenType.BACKTICK]: true,
  [tokenType.NUMBER]: true,
  [tokenType.REFERENCE]: true,
  [tokenType.RIGHT_BRACE]: true,
  [tokenType.RIGHT_BRACKET]: true,
  [tokenType.RIGHT_PAREN]: true,
  [tokenType.STRING]: true,
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

  // Trim whitespace from template blocks before we begin lexing, as our
  // heuristics are non-local and hard to implement in our state machine.
  text = trimTemplateWhitespace(text);

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
        if (c === EOF) {
          currentState = state.EXPRESSION;
        } else if (c === EOF || c === "\n" || c === "\r") {
          // We count the newline that ends a comment as whitespace. If the
          // previous token was whitespace, we resume that state.
          if (tokens.at(-1)?.type === tokenType.WHITESPACE) {
            const lastWhitespaceToken = tokens.pop();
            // @ts-ignore
            lexeme = lastWhitespaceToken.lexeme + c;
            currentState = state.WHITESPACE;
          } else {
            currentState = state.EXPRESSION;
          }
        }
        break;

      case state.DOUBLE_QUOTE_STRING:
        if (c === '"') {
          addToken(tokens, tokenType.STRING, lexeme);
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
          addToken(tokens, tokenType.BACKTICK, "`");
          currentState = state.TEMPLATE_LITERAL;
        } else if (isWhitespace[c]) {
          // Start whitespace run.
          lexeme = c;
          currentState = state.WHITESPACE;
        } else if (c === "}" && text[i] === "}") {
          addToken(tokens, tokenType.DOUBLE_RIGHT_BRACE, "}}");
          // If we see a "}}" without a matching "{{", the lexer doesn't fuss
          // about it; the parser will.
          currentState = templateContextStack.pop() ?? initialState;
          lexeme =
            currentState === state.TEMPLATE_DOCUMENT ||
            currentState === state.TEMPLATE_LITERAL
              ? ""
              : null;
          i++;
        } else if (characterToToken[c]) {
          addToken(tokens, characterToToken[c], c);
          lexeme = "";
        } else {
          // Anything else begins a reference.
          lexeme = c;
          currentState = state.REFERENCE;
        }
        break;

      case state.REFERENCE:
        if (isWhitespace[c] || characterToToken[c] || c === EOF) {
          // Reached end of reference.
          if (lexeme && lexeme.length > 0) {
            const type = isNumber(lexeme)
              ? tokenType.NUMBER
              : tokenType.REFERENCE;
            addToken(tokens, type, lexeme);
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
          addToken(tokens, tokenType.STRING, lexeme);
          lexeme = null;
          currentState = state.EXPRESSION;
        } else {
          lexeme += c;
        }
        break;

      case state.TEMPLATE_DOCUMENT:
        // Note: template documents don't treat backticks specially.
        if (c === EOF) {
          addToken(tokens, tokenType.STRING, lexeme);
          lexeme = null;
        } else if (c === "{" && text[i] === "{") {
          addToken(tokens, tokenType.STRING, lexeme);
          lexeme = null;
          addToken(tokens, tokenType.DOUBLE_LEFT_BRACE, "{{");
          templateContextStack.push(currentState);
          currentState = state.EXPRESSION;
          i++;
        } else {
          lexeme += c;
        }
        break;

      case state.TEMPLATE_LITERAL:
        if (c === "`") {
          addToken(tokens, tokenType.STRING, lexeme);
          lexeme = null;
          tokens.push({ type: tokenType.BACKTICK, lexeme: "`" });
          currentState = state.EXPRESSION;
        } else if (c === "{" && text[i] === "{") {
          addToken(tokens, tokenType.STRING, lexeme);
          lexeme = null;
          tokens.push({ type: tokenType.DOUBLE_LEFT_BRACE, lexeme: "{{" });
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
          // End whitespace run.
          addToken(tokens, tokenType.WHITESPACE, lexeme);
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

  if (tokens.at(-1)?.type === tokenType.WHITESPACE) {
    // Remove final whitespace token.
    tokens.pop();
  }

  return tokens;
}

function addToken(tokens, type, lexeme) {
  const oneBack = tokens[tokens.length - 1];
  if (oneBack && oneBack.type === tokenType.WHITESPACE) {
    // We don't keep whitespace tokens. However, we handle two special cases
    // that follow this pattern:
    //
    //     n-2: token that can end a term
    //     n-1: whitespace
    //     n  : token that can begin a term
    //
    // then we convert the whitespace token into a significant space token (if
    // the whitespace didn't contain a newline) or else a separator token.
    const twoBack = tokens[tokens.length - 2];
    tokens.pop(); // Remove whitespace token.
    const containedNewline = oneBack.lexeme.indexOf("\n") >= 0;
    if (twoBack && tokenCanEndTerm[twoBack.type] && tokenCanBeginTerm[type]) {
      const convertedType = !containedNewline
        ? tokenType.SIGNIFICANT_SPACE
        : tokenType.SEPARATOR;
      tokens.push({ type: convertedType, lexeme: oneBack.lexeme });
    }
  }
  tokens.push({ type, lexeme });
}

function isNumber(text) {
  // Based on https://stackoverflow.com/a/51733563/76472
  // but only accepts integers or floats, not exponential notation.
  const numberRegex = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/;
  return numberRegex.test(text);
}

// Trim the whitespace around and in substitution blocks in a template. There's
// no explicit syntax for blocks, but we infer them as any place where a
// substitution itself contains a multi-line template literal.
//
// Example:
//
//     {{ if `
//       true text
//     `, `
//       false text
//     ` }}
//
// Case 1: a substitution that starts the text or starts a line (there's only
// whitespace before the `{{`), and has the line end with the start of a
// template literal (there's only whitespace after the backtick) marks the start
// of a block.
//
// Case 2: a line in the middle that ends one template literal and starts
// another is an internal break in the block. Edge case: three backticks in a
// row, like ```, are common in markdown and are not treated as a break.
//
// Case 3: a line that ends a template literal and ends with `}}` or ends the
// text marks the end of the block.
//
// In all three cases, we trim spaces and tabs from the start and end of the
// line. In case 1, we also remove the preceding newline.
function trimTemplateWhitespace(text) {
  const regex1 = /(^|\n)[ \t]*({{.*?`)[ \t]*\n/g;
  const regex2 = /\n[ \t]*(`(?!`).*?`)[ \t]*\n/g;
  const regex3 = /\n[ \t]*(`(?!`).*?}})[ \t]*(?:\n|$)/g;
  const trimBlockStarts = text.replace(regex1, "$1$2");
  const trimBlockBreaks = trimBlockStarts.replace(regex2, "\n$1");
  const trimBlockEnds = trimBlockBreaks.replace(regex3, "\n$1");
  return trimBlockEnds;
}
