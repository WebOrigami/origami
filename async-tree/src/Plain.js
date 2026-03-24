import * as Tree from "./Tree.js";

function wrap([name, fn]) {
  const plainFn = async (...args) => Tree.plain(await fn(...args));
  return [name, plainFn];
}

const wrapped = Object.entries(Tree).map(wrap);
const Plain = Object.fromEntries(wrapped);

export default Plain;
