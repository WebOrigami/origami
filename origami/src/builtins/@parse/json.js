import { toString } from "../../common/utilities.js";

export default async function parseJson(input) {
  const text = toString(input);
  return text ? JSON.parse(text) : undefined;
}

parseJson.usage = `parseJson <text>\tParse text as JSON`;
parseJson.documentation = "https://weborigami.org/cli/builtins.html#parseJson";
