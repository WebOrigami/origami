import regexParser from "./@regexParseFn.js";

export default function regexParse(text, regex) {
  return regexParser(regex)(text);
}
