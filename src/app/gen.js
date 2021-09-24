/**
 * Given a set of formulas, generate their material implications.
 *
 * From https://en.wikipedia.org/wiki/Material_conditional: "In a conditional
 * formula p → q, the subformula p is referred to as the antecedent and q is
 * termed the consequent of the conditional."
 *
 * In explorable apps, we focus on defining the consequents, so would tend to
 * right q ← p, with the consequent first.
 */
export default function* gen(formulas) {
  const implications = new Set();
  // We make repeated passes over the array of formulas. If a pass produces new
  // implications, we make another pass. When there are no new implications, the
  // set of implications has settled and we can exit.
  let settled = false;
  while (!settled) {
    settled = true; // Assume we won't find new implications.
    for (const { consequent, antecedents } of formulas) {
      // Look for a consequent that's new whose antecedents all exist.
      if (
        !implications.has(consequent) &&
        antecedents.every((a) => implications.has(a))
      ) {
        // We found a new implication.
        yield consequent;
        implications.add(consequent);
        settled = false; // Will need to make at least one more pass.
      }
    }
  }
}
