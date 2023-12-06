import path from "node:path";
import process from "node:process";
import url from "node:url";

const node = {
  Buffer,
  path,
  process,
  url,
};

node.usage = "@node\tAccess Node classes and utility functions";
node.documentation = "https://weborigami.org/language/@node.html";

export default node;
