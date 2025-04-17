/**
 * Given a string specifying an extension or a mapping of one extension to another,
 * return the source and result extensions.
 *
 * Syntax:
 *   .foo           source and result extension are the same
 *   .foo→.bar      Unicode Rightwards Arrow
 *   .foo→          Unicode Rightwards Arrow, no result extension
 *   →.bar          Unicode Rightwards Arrow, no source extension
 *   .foo->.bar     hyphen and greater-than sign
 *
 * @param {string} specifier
 */
export default function parseExtensions(specifier) {
  const lowercase = specifier?.toLowerCase() ?? "";
  const extensionRegex =
    /^((?<sourceExtension>\/|\.\S*)?\s*(→|->)\s*(?<resultExtension>\/|\.\S*)?)|(?<extension>\/|\.\S*)$/;
  const match = lowercase.match(extensionRegex);
  if (!match) {
    throw new Error(`Invalid file extension specifier "${specifier}".`);
  }

  // @ts-ignore
  let { extension, resultExtension, sourceExtension } = match.groups;
  if (extension) {
    // foo
    return {
      resultExtension: extension,
      sourceExtension: extension,
    };
  } else {
    // foo→bar

    if (resultExtension === undefined && sourceExtension === undefined) {
      throw new Error(
        `A file extension mapping must indicate a source or result extension: "${specifier}".`
      );
    }

    resultExtension ??= "";
    sourceExtension ??= "";
    return { resultExtension, sourceExtension };
  }
}
