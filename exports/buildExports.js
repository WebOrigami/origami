import concat from "../src/builtins/concat.js";
import MapExtensionGraph from "../src/common/MapExtensionsGraph.js";
import { transformObject } from "../src/core/utilities.js";
import PathTransform from "./PathTransform.js";

const prologue = `// This file is generated by running buildExports.js -- do not edit by hand.\n`;

// For builtins that should not be exported
const ignoredBuiltins = {
  false: true, // Ignore the "false" builtin
  true: true, // Ignore the "true" builtin
};

// For builtins whose names are not valid JS identifiers
const specialIdentifiers = {
  "@": "config",
  "@loaders": "loaders",
  "…": "inherited",
};

// Generate a top-level export file for the entire project. For each .js file in
// the given source tree, generate an appropriate statement that includes that
// file's export(s) in the top-level export file.
export default async function (src) {
  // Add paths to the source tree so they can be used in the export statements.
  const withPaths = transformObject(PathTransform, src);

  // Map each source file to an export statement.
  const mapped = new MapExtensionGraph(withPaths, exportStatementForCode, {
    deep: true,
    extension: "js",
    extensionMatchesOnly: true,
  });

  // Do a deep traversal of the tree to concatenate all the export statements.
  const exportStatements = await concat.call(this, mapped);

  return prologue + exportStatements;
}

// Given a buffer containing the code for a JavaScript file, generate an
// appropriate export statement for that file.
async function exportStatementForCode(codeBuffer, key) {
  const code = String(codeBuffer);

  let exportName;
  const exportsAnything = code.match(/^export /m);
  const exportsDefault = code.match(/^export default /m);
  if (exportsDefault) {
    // Has a default export
    const basename = key.slice(0, -3);
    if (ignoredBuiltins[basename]) {
      return ""; // Don't export
    }
    const identifier = specialIdentifiers[basename] || basename;
    exportName = `{ default as ${identifier} }`;
  } else if (exportsAnything) {
    // Export everything
    exportName = "*";
  } else {
    // Has no exports
    return "";
  }

  const container = (await this.get("@path")) ?? "";
  // Skip loaders
  if (container === "loaders") {
    return "";
  }

  const path = `${container}/${key}`;

  return `export ${exportName} from "../src/${path}";\n`;
}