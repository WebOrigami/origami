export default function markdownOutline(markdown, depth = 2) {
  const lines = markdown.split("\n");
  const outline = {};

  const headingRegex = /^(?<pounds>#+) (?<heading>.*)$/;
  let text = "";
  const stack = [];
  let current = outline;
  for (const line of lines) {
    const match = headingRegex.exec(line);
    const level = match?.groups.pounds.length; // Number of # signs
    const heading = match?.groups.heading;
    if (match && level <= depth) {
      // Any current text gets added as content for the current node.
      current["._content_"] = text;
      text = "";

      // Pop nodes off the stack until we're at the right level for this head.
      while (stack.length >= level) {
        current = stack.pop();
      }

      // Start a new node for this heading.
      const newNode = {};
      current[heading] = newNode;
      stack.push(current);
      current = newNode;
    } else if (match) {
      // Heading below depth level gets shifted by depth and added to current
      // text.
      const shiftedLevel = level - depth;
      const shiftedPounds = "".padEnd(shiftedLevel, "#");
      const shiftedLine = `${shiftedPounds} ${heading}`;
      text += shiftedLine + "\n";
    } else {
      // Body text: add to the current text.
      text += line + "\n";
    }
  }

  // Any remaining text gets added to the current node.
  if (text !== undefined) {
    current["._content_"] = text;
  }

  return outline;
}
