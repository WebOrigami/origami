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
  // Find first character that's not whitespace, alphanumeric, or underscore
  const first = text.match(/[^A-Za-z0-9_ \t\n\r]/)?.[0];
  const origamiMarkers = ["(", ".", "/", "{"];
  return origamiMarkers.includes(first);
}
