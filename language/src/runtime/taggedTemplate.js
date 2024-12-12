// Default JavaScript tagged template function splices strings and values
// together.
export default function taggedTemplate(strings, ...values) {
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    result += values[i] + strings[i + 1];
  }
  return result;
}
