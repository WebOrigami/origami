import breakpoint from "./breakpoint.js";
import changes from "./changes.js";
import code from "./code.js";
import debug from "./debug.js";
import explore from "./explore.js";
import log from "./log.js";
import serve from "./serve.js";
import svg from "./svg.js";
import watch from "./watch.js";

const commands = {
  breakpoint,
  changes,
  code,
  debug,
  explore,
  log,
  serve,
  svg,
  watch,
};

Object.defineProperty(commands, "description", {
  enumerable: false,
  value: "Develop and debug Origami projects",
});

export default commands;
