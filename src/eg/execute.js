import { invoke } from "./ops.js";

export default async function execute(code, scope, graph) {
  const context = { graph, scope };
  return await invoke.call(context, code);
}
