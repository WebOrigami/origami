import keys from "../tree/keys.js";

export default function ls(value) {
  return value ? keys.call(this, value) : keys.call(this);
}
