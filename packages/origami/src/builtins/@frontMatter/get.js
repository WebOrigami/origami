export default function get(obj) {
  return obj?.toFrontMatter?.() ?? obj?.toGraph?.() ?? undefined;
}
