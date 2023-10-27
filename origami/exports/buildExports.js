/** @typedef {import("@graphorigami/types").AsyncTree} AsyncTree */
import unpackOrigamiTemplate from "../src/builtins/@loaders/orit.js";
import MapExtensionTree from "../src/common/MapExtensionsTree.js";
import { transformObject } from "../src/common/utilities.js";
import PathTransform from "./PathTransform.js";

// For builtins that should be renamed or not exported
const specialBuiltinNames = {
  "!": null,
  "@false": null,
  "@new": null,
  "@true": null,
  "~": "homeFiles",
};

// Top-level template for the export file
const templateText = `// This file is generated by running buildExports.js -- do not edit by hand.
{{ _ }}`;

// Generate a top-level export file for the entire project. For each .js file in
// the given source tree, generate an appropriate statement that includes that
// file's export(s) in the top-level export file.
export default async function exportFile(src) {
  const statements = await exportStatements(src);
  const templateFn = await unpackOrigamiTemplate(templateText);
  const result = await templateFn(statements);
  return result;
}

/**
 * Given a buffer containing the code for a JavaScript file, generate an
 * appropriate export statement for that file.
 *
 * @this {AsyncTree}
 */
async function exportStatementForCode(codeBuffer, key) {
  const code = String(codeBuffer);

  const exportsAnything = code.match(/^export /m);
  if (!exportsAnything) {
    // Has no exports
    return "";
  }

  // @ts-ignore
  const path = codeBuffer[PathTransform.pathKey] ?? "";
  const pathParts = path.split("/");
  pathParts.pop(); // Drop key

  const exportsDefault = code.match(/^export default /m);
  if (!exportsDefault) {
    // Export everything.
    return `export * from "../src/${path}";\n`;
  }

  // Export a single default export.

  // We construct an identifier for the export based on the path to the file and
  // the file name. This omits the first part of the path, which is the name of
  // a folder that's a direct child of the `src` folder. The remaining parts are
  // joined in camelCase to form the export name. We remove the `@` prefix from
  // any parts that start with it. As an example, the file inside the src folder
  // at `builtins/@tree/concat.js` will be identified as `treeConcat`.
  let exportIdentifierParts = pathParts.slice(1);

  // The file name is the last part of the path; remove the .js extension.
  let name = key.slice(0, -3);

  // Ignore certain builtins like `@true` and `@false` that would conflict with
  // JavaScript keywords. Developers can use those JavaScript keywords directly.
  const specialName = specialBuiltinNames[name];
  if (specialName === null) {
    return "";
  }
  if (specialName) {
    name = specialName;
  }

  // Add the name to the parts.
  exportIdentifierParts.push(name);

  // Remove the @ prefix from any parts, if present.
  exportIdentifierParts = exportIdentifierParts.map((part) =>
    part.startsWith("@") ? part.slice(1) : part
  );

  // Join the parts in camelCase to form the identifier.
  const identifier = exportIdentifierParts
    .map((part, index) =>
      index === 0 ? part : part[0].toUpperCase() + part.slice(1)
    )
    .join("");

  return `export { default as ${identifier} } from "../src/${path}";\n`;
}

function exportStatements(src) {
  // Add paths to the source tree so they can be used in the export statements.
  const withPaths = transformObject(PathTransform, src);

  // Map each source file to an export statement.
  const mapped = new MapExtensionTree(withPaths, exportStatementForCode, {
    deep: true,
    extension: "js",
    extensionMatchesOnly: true,
    preferExistingValue: true,
  });

  return mapped;
}
