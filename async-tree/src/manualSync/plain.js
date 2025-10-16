// import toPlainValue from "../utilities/toPlainValue.js";

export default function plain(object) {
  if (object instanceof Map) {
    const entries = Array.from(object.entries());
    const mapped = entries.map(([key, value]) => [key, plain(value)]);
    return Object.fromEntries(mapped);
  } else {
    return object;
  }
}
