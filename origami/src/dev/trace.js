import { symbols } from "@weborigami/language";

export default symbols.traceSymbol;

// export default async function trace(object) {
//   if (isUnpackable(object)) {
//     object = await object.unpack();
//   }

//   if (object[sourceSymbol] === undefined) {
//     // Not an annotated result
//     return normalize(object);
//   }

//   const source = object[sourceSymbol];
//   // const url = object[codeSymbol]?.location?.source?.url;
//   const evaluated = object[evaluatedSymbol].map(trace);
//   const value = normalize(object);

//   return Object.assign(
//     {
//       value,
//       source,
//       // path: url?.pathname,
//     },
//     evaluated && { evaluated }
//   );
// }

// function normalize(object) {
//   let normalized = object.valueOf?.() ?? object;
//   // HACKS
//   if (normalized instanceof Buffer) {
//     normalized = toString(normalized);
//   } else if (normalized instanceof Function) {
//     normalized = Object.getOwnPropertyNames(normalized).includes("toString")
//       ? normalized.toString()
//       : normalized.name;
//     // } else if (normalized instanceof Scope) {
//     //   normalized = "[scope]";
//   }
//   return normalized;
// }
