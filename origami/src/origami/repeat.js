export default async function repeat(count, content) {
  const array = new Array(count);
  array.fill(content);
  return array;
}
