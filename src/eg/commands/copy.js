export default async function copy(source, target) {
  await target.set(source);
}

copy.usage = `copy(source, target)\tCopies the source graph to the target`;
