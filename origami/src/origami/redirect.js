import { args } from "@weborigami/async-tree";

/**
 * Generate a live or static redirect response.
 *
 * @param {string} url
 * @param {{ permanent?: boolean }} [options]
 */
export default function redirect(url, options = { permanent: false }) {
  url = args.string(url, "Origami.redirect");
  const response = new Response("ok", {
    headers: {
      Location: url,
    },
    status: options.permanent ? 301 : 307,
  });
  /** @type {any} */ (response).pack = () => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=${url}" />
  </head>
</html>
`;
  return response;
}
