import regexMatchFn from "./regexMatchFn.js";

export default function regexMatch(text, regex) {
  return regexMatchFn(regex)(text);
}
regexMatch.description =
  "regexMatch(text, regex) - Return matches of the regex in the text";
