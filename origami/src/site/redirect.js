export default function redirect(url, options = { permanent: false }) {
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
redirect.description = "redirect(url, options) - Redirect to the given URL";
