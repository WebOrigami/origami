export const token = {
  BACKTICK: "BACKTICK",
  COLON: "COLON",
  COMMA: "COMMA",
  DOUBLE_LEFT_BRACE: "DOUBLE_LEFT_BRACE",
  DOUBLE_RIGHT_BRACE: "DOUBLE_RIGHT_BRACE",
  LEFT_BRACE: "LEFT_BRACE",
  LEFT_BRACKET: "LEFT_BRACKET",
  LEFT_PAREN: "LEFT_PAREN",
  REFERENCE: "REFERENCE",
  RIGHT_BRACE: "RIGHT_BRACE",
  RIGHT_BRACKET: "RIGHT_BRACKET",
  RIGHT_PAREN: "RIGHT_PAREN",
  SLASH: "SLASH",
  STRING: "STRING",
};

const characterToToken = {
  "(": token.LEFT_PAREN,
  ")": token.RIGHT_PAREN,
  ",": token.COMMA,
  "/": token.SLASH,
  ":": token.COLON,
  "[": token.LEFT_BRACKET,
  "]": token.RIGHT_BRACKET,
  "`": token.BACKTICK,
  "{": token.LEFT_BRACE,
  "}": token.RIGHT_BRACE,
};

const EOF = "\x04";

const state = {
  COMMENT: "COMMENT",
  EXPRESSION: "EXPRESSION",
  STRING: "STRING",
  TEMPLATE_TEXT: "TEMPLATE_TEXT",
};

export function lex(text, initialState = state.EXPRESSION) {
  const tokens = [];
  let currentState = initialState;
  let lexeme = "";
  let i = 0;

  // Append an end-of-file character to the end of the text. This is a
  // convenience for the lexer so that it doesn't have to check for the end of
  // the text in every state.
  text += EOF;

  while (i < text.length) {
    const c = text[i];

    // A backslash in any state means the next character (with the exception of
    // a newline) is escaped. The backslash is skipped.
    // if (c === "\\") {
    //   i++;
    //   if (text[i] === "\n") {
    //     throw "Unexpected newline after backslash.";
    //   }
    //   continue;
    // }

    switch (currentState) {
      case state.COMMENT:
        if (c === "\n" || c === "\r") {
          currentState = state.EXPRESSION;
        }
        break;

      case state.EXPRESSION:
        let completedReference = false;
        let completedToken = null;
        switch (c) {
          case EOF:
          case " ":
          case "\t":
          case "\r":
          case "\n":
            // Ignore whitespace
            completedReference = true;
            break;
          case "#":
            completedReference = true;
            currentState = state.COMMENT;
            break;
          case "'":
            completedReference = true;
            currentState = state.STRING;
            break;
          case "`":
            completedReference = true;
            currentState = state.TEMPLATE_TEXT;
            break;
          default:
            if (c === "}" && text[i + 1] === "}") {
              completedReference = true;
              completedToken = { type: token.DOUBLE_RIGHT_BRACE };
              currentState = state.TEMPLATE_TEXT;
              i++;
            } else if (characterToToken[c]) {
              completedReference = true;
              completedToken = { type: characterToToken[c] };
            } else {
              lexeme += c;
            }
            break;
        }
        if (completedReference && lexeme.length > 0) {
          tokens.push({
            type: token.REFERENCE,
            lexeme,
          });
          lexeme = "";
        }
        if (completedToken) {
          tokens.push(completedToken);
        }
        break;

      case state.STRING:
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

      case state.TEMPLATE_TEXT:
        if (c === "`") {
          tokens.push({
            type: token.TEMPLATE,
            lexeme,
          });
          lexeme = "";
          currentState = state.EXPRESSION;
        } else if (c === "{" && text[i + 1] === "{") {
          tokens.push({
            type: token.TEMPLATE,
            lexeme,
          });
          lexeme = "";
          currentState = state.EXPRESSION;
          i++;
        } else {
          lexeme += c;
        }
        break;
    }

    i++;
  }

  return tokens;
}
