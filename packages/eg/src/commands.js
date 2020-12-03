import { Explorable } from "@explorablegraph/core";
import defaultExport from "./commands/defaultExport.js";
import file from "./commands/file.js";
import Files from "./commands/Files.js";
import parse from "./commands/parse.js";
import serve from "./commands/serve.js";
import stdin from "./commands/stdin.js";
import stdout from "./commands/stdout.js";
import toUpperCase from "./commands/toUpperCase.js";
import yaml from "./commands/yaml.js";

export default Explorable({
  ":": defaultExport,
  Explorable,
  file,
  Files,
  parse,
  serve,
  stdin,
  stdout,
  toUpperCase,
  yaml,
});
