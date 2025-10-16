import toString from "../src/utilities/toString.js";

const replacements = new Map([
  [/async /g, "/*async*/ "],
  [/await /g, "/*await*/ "],
  [/Promise.all/g, "/*Promise.all*/ "],
  [/\/src\/operations/g, "/src/sync"],
  [/..\/utilities\/getTreeArgument.js/g, "./getTreeArgument.js"],
  [/node,fs\/promises/g, "node,fs"],
  [/fs.mkdir/g, "fs.mkdirSync"],
  [/fs.writeFile/g, "fs.writeFileSync"],
  [/fs.readdir/g, "fs.readdirSync"],
  [/fs.rm/g, "fs.rmSync"],
  [/Promise<(.+)>/g, "$1"],
]);

export default function asyncToSync(input) {
  let source = toString(input);
  if (!source) {
    return input;
  }
  for (const [find, replace] of replacements.entries()) {
    source = source.replace(find, replace);
  }
  return source;
}
