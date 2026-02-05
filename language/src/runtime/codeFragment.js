export default function codeFragment(location) {
  const { source, start, end } = location;
  const sourceText = source.text ?? source;

  let fragment =
    start && end && start.offset < end.offset
      ? sourceText.slice(start.offset, end.offset)
      : // Use entire source
        sourceText;

  // Replace newlines and whitespace runs with a single space.
  fragment = fragment.replace(/(\n|\s\s+)+/g, " ");

  // If longer than 80 characters, truncate with an ellipsis.
  if (fragment.length > 80) {
    fragment = fragment.slice(0, 80) + "…";
  }

  return fragment;
}
