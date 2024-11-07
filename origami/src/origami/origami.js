import help from "../builtins/help.js";
import basename from "./basename.js";
import config from "./config.js";
import json from "./json.js";
import jsonParse from "./jsonParse.js";
import naturalOrder from "./naturalOrder.js";
import once from "./once.js";
import ori from "./ori.js";
import pack from "./pack.js";
import post from "./post.js";
import project from "./project.js";
import regexMatch from "./regexMatch.js";
import repeat from "./repeat.js";
import shell from "./shell.js";
import slash from "./slash.js";
import stdin from "./stdin.js";
import string from "./string.js";
import unpack from "./unpack.js";
import version from "./version.js";
import yaml from "./yaml.js";
import yamlParse from "./yamlParse.js";

const commands = {
  basename,

  // Use a dynamic import to avoid circular dependencies
  builtins: import("../builtins/internal.js").then(
    (internal) => internal.builtins
  ),

  config,
  help,
  json,
  jsonParse,
  naturalOrder,
  once,
  ori,
  pack,
  post,
  project,
  regexMatch,
  repeat,
  slash,
  shell,
  stdin,
  string,
  unpack,
  version,
  yaml,
  yamlParse,
};

Object.defineProperty(commands, "description", {
  enumerable: false,
  value: "Perform general Origami language functions",
});

export default commands;
