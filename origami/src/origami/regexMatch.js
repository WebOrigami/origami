const parsers = {};

// TODO: Remove this deprecated function
export default function regexMatch(text, regex) {
  console.warn(
    "Warning: regexMatch is deprecated, use a JavaScript regular expression instead."
  );
  if (!parsers[regex]) {
    const regexp = new RegExp(regex);
    parsers[regex] = (input) => input.match(regexp)?.groups;
  }
  return parsers[regex](text);
}
