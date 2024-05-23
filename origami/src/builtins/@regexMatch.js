import regexMatchFn from "./@regexMatchFn.js";

export default function regexMatch(text, regex) {
  return regexMatchFn(regex)(text);
}
