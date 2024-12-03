/**
 * Origami language definition for highlight.js
 */
export default function origamiHighlightDefinition(hljs) {
  return {
    name: "Origami",
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.BACKSLASH_ESCAPE,
      {
        // Backtick template strings
        className: "string",
        begin: "`",
        end: "`",
        contains: [
          hljs.BACKSLASH_ESCAPE,
          {
            className: "subst",
            begin: "\\$\\{",
            end: "\\}",
            contains: [hljs.C_NUMBER_MODE, hljs.QUOTE_STRING_MODE],
          },
        ],
      },
      {
        // Treat namespaces as keywords
        className: "keyword",
        begin:
          /\b(calc|dev|explore|files|http|https|httpstree|httptree|image|inherited|js|new|node|origami|package|scope|site|text|tree):\b/,
      },
      {
        // Treat identifier containing a period before an open paren or backtick as a variable
        className: "variable",
        begin:
          /\b[^(){}\[\]<>=,/:\`"'«»\\ →⇒\t\n\r]+\.[^(){}\[\]<>\?!&\|=,/:\`"'«»\\ →⇒\t\n\r]+(?=(\(|\`))\b/,
      },
      {
        className: "built_in",
        // Treat shorthands before open paren or backtick as a builtin
        begin: /\b[A-Za-z][A-Za-z0-9]*(?=(\(|\`))\b/,
      },
      {
        className: "operator",
        begin:
          /===|!==|==|!=|<=|<|>=|>|\*|\*\*|\/|%|\+|-|=>|⇒|->|→|=|\.\.\.|…|&&|&|\|\||\||!|\^|~|\?\?|\?|:|#!/,
      },
      {
        // Treat remaining identifiers as variables
        className: "variable",
        begin: /\b[^(){}\[\]<>\?!\|=,/:\`"'«»\\ →⇒\t\n\r]+\b/,
      },
    ],
  };
}
