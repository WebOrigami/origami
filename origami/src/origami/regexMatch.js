import helpRegistry from "../common/helpRegistry.js";
import regexMatchFn from "./regexMatchFn.js";

export default function regexMatch(text, regex) {
  return regexMatchFn(regex)(text);
}

helpRegistry.set(
  "origami:regexMatch",
  "(text, regex) - Return matches of the regex in the text"
);
