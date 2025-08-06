import { attachWarning } from "@weborigami/language";

const parsers = {};

// TODO: Remove this deprecated function
export default function regexMatch(text, regex) {
  if (!parsers[regex]) {
    const regexp = new RegExp(regex);
    parsers[regex] = (input) => input.match(regexp)?.groups;
  }
  const match = parsers[regex](text);
  return attachWarning(
    match,
    "The regexMatch function is deprecated. Use a JavaScript regular expression instead."
  );
}
