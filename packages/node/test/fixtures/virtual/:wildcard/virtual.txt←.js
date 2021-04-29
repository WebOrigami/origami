// import path from "path";
// import { fileURLToPath } from "url";

export default function (graph) {
  return `This text was returned for ${graph.params?.wildcard}`;
}

// function getParams(graph) {
//   debugger;
//   const params = {};
//   const graphDirname = graph.path;
//   const graphParts = graphDirname.split(path.sep);
//   const moduleDirname = path.dirname(fileURLToPath(import.meta.url));
//   const moduleParts = moduleDirname.split(path.sep);
//   for (const index in graphParts) {
//     const key = graphParts[index];
//     if (graph.isWildcardKey(key)) {
//       const paramName = key.slice(1);
//       const paramValue = moduleParts[index];
//       params[paramName] = paramValue;
//     }
//   }
//   return params;
// }
