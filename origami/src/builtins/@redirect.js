export default function redirect(url, options = { permanent: false }) {
  return new Response("ok", {
    headers: {
      Location: url,
    },
    status: options.permanent ? 301 : 307,
  });
}
