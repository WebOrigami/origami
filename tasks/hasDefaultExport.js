export default function hasDefaultExport(buffer) {
  const source = String(buffer);
  const exportRegex = /^export default/m;
  return exportRegex.test(source);
}
