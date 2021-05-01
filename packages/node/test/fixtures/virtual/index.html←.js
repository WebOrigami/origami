export default async function () {
  const buffer = await this.get("index.txt");
  const text = String(buffer).trim();
  return `<p>${text}</p>`;
}
