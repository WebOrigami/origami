import regexParser from "./@regexParser.js";

export default function applyRegexParser(text, regex) {
  const parser = regexParser.call(this, regex);
  return parser(text);
}
