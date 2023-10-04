export default async function fromJson(text) {
  return text ? JSON.parse(text) : undefined;
}

fromJson.usage = `fromJson <text>\tParse text as JSON`;
fromJson.documentation = "https://graphorigami.org/cli/builtins.html#fromJson";
