/**
 * Given a set of formulas, generate their material implications.
 *
 * From https://en.wikipedia.org/wiki/Material_conditional: "In a conditional
 * formula p → q, the subformula p is referred to as the antecedent and q is
 * termed the consequent of the conditional."
 *
 * In explorable apps, we focus on defining the consequents, so would tend to
 * right q ← p, with the consequent first.
 *
 * @param {Array} definedKeys
 */
export default function impliedKeys(formulas, definedKeys) {
  const implications = new Set(definedKeys);
  // We make repeated passes over the array of formulas. If a pass produces new
  // implications, we make another pass. When there are no new implications, the
  // set of implications has settled and we can exit.
  let settled = false;
  while (!settled) {
    settled = true; // Assume we won't find new implications.
    // For all keys we currently have, both defined and implied...
    for (const key of implications) {
      // See if the key matches a formula's first antecedent.
      for (const { antecedents, consequent } of formulas) {
        const variable = match(antecedents[0], key);
        if (variable) {
          // First antecedent matched; do the rest match?
          // TODO

          // Determine the consequent of this formula.
          const implication = consequent.prefix + variable + consequent.suffix;
          if (!implications.has(implication)) {
            // We found a new implication.
            implications.add(implication);
            settled = false; // Will need to make at least one more pass.
          }
        }
      }
    }
  }
  return [...implications];
}

function match(pattern, text) {
  const { prefix, suffix } = pattern;
  const patternLength = prefix.length + suffix.length;
  if (
    patternLength < text.length &&
    text.startsWith(prefix) &&
    text.endsWith(suffix)
  ) {
    // Matched
    const variable = text.substring(prefix.length, text.length - patternLength);
    return variable;
  }
  return undefined;
}
