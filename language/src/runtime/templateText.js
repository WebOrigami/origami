/**
 * Concatenate the strings in a template just like JavaScript
 */
export default async function text(strings, ...values) {
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    result += values[i];
    result += strings[i + 1];
  }
  return result;
}
