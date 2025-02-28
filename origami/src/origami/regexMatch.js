const parsers = {};

export default function regexMatch(text, regex) {
  if (!parsers[regex]) {
    const regexp = new RegExp(regex);
    parsers[regex] = (input) => input.match(regexp)?.groups;
  }
  return parsers[regex](text);
}
