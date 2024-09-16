export default function codeFragment(location) {
  const { source, start, end } = location;

  let fragment =
    start.offset < end.offset
      ? source.text.slice(start.offset, end.offset)
      : // Use entire source
        source.text;

  // Remove newlines and whitespace runs.
  fragment = fragment.replace(/(\n|\s\s+)+/g, "");

  // If longer than 80 characters, truncate with an ellipsis.
  if (fragment.length > 80) {
    fragment = fragment.slice(0, 80) + "…";
  }

  return fragment;
}
