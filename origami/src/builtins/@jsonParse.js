import { toString } from "../common/utilities.js";

export default async function jsonParse(input) {
  const text = toString(input);
  return text ? JSON.parse(text) : undefined;
}

jsonParse.usage = `@jsonParse <text>\tParse text as JSON`;
jsonParse.documentation = "https://weborigami.org/builtins/@jsonParse.html";
