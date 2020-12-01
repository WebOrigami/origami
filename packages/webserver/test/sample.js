// Simple graph of web pages used by the server in test.js.

import { get, keys } from "@explorablegraph/core";

const letters = ["a", "b", "c", "d", "e", "f", "g", "i", "j"];
const routes = ["index.html", ...letters];

export default {
  *[keys]() {
    yield* routes;
  },

  "index.html": letters
    .map((letter) => `<li><a href="${letter}">${letter}</a></li>`)
    .join(""),

  secret: "You have found the secret page!",

  [get](key) {
    return this[key] || `Hello, ${key}.`;
  },

  // TODO: Get this key from web package.
  "__keys__.json": JSON.stringify(routes, null, 2),
};
