import equals from "./@equals.js";
import ifBuiltin from "./@if.js";
import regexMatch from "./@regexMatch.js";

const entries = {
  equals,
  if: ifBuiltin,
  regexMatch,
};

export default function origami(key) {
  return entries[key];
}
