export default async function get(obj) {
  return await obj?.contents?.();
}
