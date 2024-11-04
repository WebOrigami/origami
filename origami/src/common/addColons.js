// Return a new object that appends a colon to each key
export default function addColons(object) {
  const result = {};
  for (const key in object) {
    result[key + ":"] = object[key];
  }
  return result;
}
