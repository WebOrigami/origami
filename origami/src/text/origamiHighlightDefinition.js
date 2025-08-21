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
        className: "operator",
        begin:
          /===|!==|==|!=|<=|<|>=|>|\*|\*\*|\/|%|\+|-|=>|⇒|->|→|=|:|\.\.\.|&&|&|\|\||\||!|\^|~|\?\?|\?|#!/,
      },
      {
        className: "variable",
        // This is simpler than the corresponding definition in the VS Code
        // extension; we couldn't figure out how to get the Unicode ID_Continue
        // pattern to match.
        begin: /[$_A-Za-z0-9\.~][$_A-Za-z0-9\.~@!+\-*%&|^]+/,
      },
    ],
  };
}
