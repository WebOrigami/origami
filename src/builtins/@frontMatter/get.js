export default function get(obj) {
  return obj?.toGraph?.() ?? undefined;
}
