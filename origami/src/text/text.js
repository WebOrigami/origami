import document from "./document.js";
import indent from "./indent.js";
import inline from "./inline.js";
import mdHtml from "./mdHtml.js";

const commands = {
  document,
  indent,
  inline,
  mdHtml,
};

Object.defineProperty(commands, "description", {
  enumerable: false,
  value: "Manipulate text",
});

export default commands;
