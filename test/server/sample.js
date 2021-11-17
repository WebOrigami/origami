// Simple graph of web pages used by the server in test.js.

const letters = ["a", "b", "c", "d", "e", "f", "g", "i", "j"];
const routes = ["index.html", ...letters];

export default {
  async *[Symbol.asyncIterator]() {
    yield* routes;
  },

  async get2(key) {
    switch (key) {
      case "index.html":
        return letters
          .map((letter) => `<li><a href="${letter}">${letter}</a></li>`)
          .join("");

      case "secret":
        return "You have found the secret page!";

      default:
        return `Hello, ${key}.`;
    }
  },
};
