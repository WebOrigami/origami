/**
 * Return true if the given text is Origami front matter
 *
 * @param {string} text
 */
export default function isOrigamiFrontMatter(text) {
  // Find first character that's not whitespace, alphanumeric, or underscore
  const first = text.match(/[^A-Za-z0-9_ \t\n\r]/)?.[0];
  if (!first) {
    return false;
  }
  const origamiMarkers = ["(", ".", "/", "{"];
  return origamiMarkers.includes(first);
}
