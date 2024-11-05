import { naturalOrder } from "@weborigami/async-tree";
import basename from "./@basename.js";
import config from "./@config.js";
import help from "./@help.js";
import inherited from "./@inherited.js";
import json from "./@json.js";
import jsonParse from "./@jsonParse.js";
import once from "./@once.js";
import ori from "./@ori.js";
import pack from "./@pack.js";
import post from "./@post.js";
import project from "./@project.js";
import regexMatch from "./@regexMatch.js";
import repeat from "./@repeat.js";
import setDeep from "./@setDeep.js";
import shell from "./@shell.js";
import slash from "./@slash.js";
import stdin from "./@stdin.js";
import string from "./@string.js";
import unpack from "./@unpack.js";
import version from "./@version.js";
import yaml from "./@yaml.js";
import yamlParse from "./@yamlParse.js";

export default {
  basename,

  // Use a dynamic import to avoid circular dependencies
  builtins: import("./internal.js").then((internal) => internal.builtins),

  config,
  help,
  inherited,
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
  setDeep,
  shell,
  stdin,
  string,
  unpack,
  version,
  yaml,
  yamlParse,
};
