import format from "./@image/format.js";
import resize from "./@image/resize.js";

const entries = {
  format,
  resize,
};

export default function image(key) {
  return entries[key];
}
