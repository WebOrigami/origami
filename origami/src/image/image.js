import format from "./format.js";
import resize from "./resize.js";

const commands = {
  format,
  resize,
};

Object.defineProperty(commands, "description", {
  enumerable: false,
  value: "Format and resize images",
});

export default commands;
