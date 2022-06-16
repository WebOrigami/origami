const startMark = "start";
performance.mark(startMark);

const counts = {};

export function incrementCount(name) {
  if (!counts[name]) {
    counts[name] = 0;
  }
  counts[name]++;
}

export function results() {
  const entry = performance.measure(startMark);
  const time = Math.round(entry.duration);
  return {
    counts,
    time,
  };
}
