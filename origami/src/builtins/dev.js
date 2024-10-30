import debug from "./@debug.js";
import serve from "./@serve.js";
import watch from "./@watch.js";

const entries = { debug, serve, watch };

export default function dev(key) {
  return entries[key];
}
