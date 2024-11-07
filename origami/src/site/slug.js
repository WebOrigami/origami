import helpRegistry from "../common/helpRegistry.js";

export default function slug(filename) {
  let slug = filename.toLowerCase();

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

helpRegistry.set(
  "site:slug",
  "(text) - A version of the text suitable for use in URLs"
);
