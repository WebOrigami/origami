import filesFn from "./@files.js";

export default function files(...keys) {
  return filesFn.call(this, ...keys);
}
