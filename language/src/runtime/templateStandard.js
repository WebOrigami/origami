/**
 * Concatenate the strings with a standard tagged template function that works
 * just like normal JavaScript templates. This is: a) synchronous, b) does not
 * convert treelike objects to strings.
 */
export default function standardTemplate(strings, ...values) {
  let result = strings[0];
  for (let i = 0; i < values.length; i++) {
    result += values[i];
    result += strings[i + 1];
  }
  return result;
}
