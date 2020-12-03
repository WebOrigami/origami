import { Explorable } from "@explorablegraph/core";
import defaultExport from "./commands/defaultExport.js";
import parse from "./commands/parse.js";
import serve from "./commands/serve.js";
import stdin from "./commands/stdin.js";
import stdout from "./commands/stdout.js";
import toUpperCase from "./commands/toUpperCase.js";
import yaml from "./commands/yaml.js";

export default Explorable({
  ":": defaultExport,
  Explorable,
  parse,
  serve,
  stdin,
  stdout,
  toUpperCase,
  yaml,
});
