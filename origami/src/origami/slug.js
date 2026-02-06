import { args } from "@weborigami/async-tree";

/**
 * Return a slug version of the given text: lowercase, spaces replaced by
 * dashes, and special characters removed.
 *
 * @param {string} text
 */
export default function slug(text) {
  text = args.string(text, "Origami.slug");

  let slug = text.toLowerCase();

  // Convert spaces to dashes
  slug = slug.replace(/\s+/g, "-");

  // Remove special characters except dashes, letters, numbers, and periods.
  slug = slug.replace(/[^\w\-\.]/g, "");

  // Trim leading or trailing dashes.
  slug = slug.replace(/^-+/, "");
  slug = slug.replace(/-+$/, "");

  // Collapse consecutive dashes to a single dash.
  slug = slug.replace(/-+/g, "-");

  return slug;
}
