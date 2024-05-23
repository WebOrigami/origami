const parsers = {};

export default function regexParseFn(text) {
  if (!parsers[text]) {
    const regexp = new RegExp(text);
    parsers[text] = (input) => input.match(regexp)?.groups;
  }
  return parsers[text];
}
