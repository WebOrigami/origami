export default function parseFrontMatter(text) {
  const regex =
    /^(---\r?\n(?<frontText>[\s\S]*?\r?\n?)---\r?\n)(?<body>[\s\S]*$)/;
  const match = regex.exec(text);
  if (!match?.groups) {
    return null;
  }
  const isOrigami = detectOrigami(match.groups.frontText);
  return {
    body: match.groups.body,
    frontText: match.groups.frontText,
    isOrigami,
  };
}

function detectOrigami(text) {
  const trimmed = text.trimStart();
  const origamiMarkers = ["(", "{", "//", "#!"];
  return origamiMarkers.some((marker) => trimmed.startsWith(marker));
}
