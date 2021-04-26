export default function (graph) {
  const boundKey = graph.bindings.wildcard;
  return `This file was returned for ${boundKey}`;
}
