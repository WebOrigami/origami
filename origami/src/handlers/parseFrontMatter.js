import { isOrigamiFrontMatter } from "@weborigami/language";

export default function parseFrontMatter(text) {
  const regex =
    /^(---\r?\n(?<frontText>[\s\S]*?\r?\n?)---\r?\n)(?<body>[\s\S]*$)/;
  const match = regex.exec(text);
  if (!match?.groups) {
    return null;
  }
  const isOrigami = isOrigamiFrontMatter(match.groups.frontText);
  return {
    body: match.groups.body,
    frontText: match.groups.frontText,
    isOrigami,
  };
}
