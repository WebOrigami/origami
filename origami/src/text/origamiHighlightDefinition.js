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
        // Treat all `@` builtins as keywords.
        className: "keyword",
        begin: /@\w+\b/,
      },
    ],
  };
}
