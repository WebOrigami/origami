export default async function parseJson(text) {
  return text ? JSON.parse(text) : undefined;
}

parseJson.usage = `parseJson <text>\tParse text as JSON`;
parseJson.documentation = "https://weborigami.org/cli/builtins.html#parseJson";
