/**
 * Returns true if the two strings have a Damerau-Levenshtein distance of 1.
 * This will be true if the strings differ by a single insertion, deletion,
 * substitution, or transposition.
 *
 * @param {string} s1
 * @param {string} s2
 */
export function isTypo(s1, s2) {
  const length1 = s1.length;
  const length2 = s2.length;

  // If the strings are identical, distance is 0
  if (s1 === s2) {
    return false;
  }

  // If length difference is more than 1, distance can't be 1
  if (Math.abs(length1 - length2) > 1) {
    return false;
  }

  if (length1 === length2) {
    // Check for one substitution
    let differences = 0;
    for (let i = 0; i < length1; i++) {
      if (s1[i] !== s2[i]) {
        differences++;
        if (differences > 1) {
          break;
        }
      }
    }
    if (differences === 1) {
      return true;
    }

    // Check for one transposition
    for (let i = 0; i < length1 - 1; i++) {
      if (s1[i] !== s2[i]) {
        // Check if swapping s1[i] and s1[i+1] matches s2
        if (s1[i] === s2[i + 1] && s1[i + 1] === s2[i]) {
          return s1.slice(i + 2) === s2.slice(i + 2);
        } else {
          return false;
        }
      }
    }
  }

  // Check for one insertion/deletion
  const longer = length1 > length2 ? s1 : s2;
  const shorter = length1 > length2 ? s2 : s1;
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] !== longer[i]) {
      // If we skip this character, do the rest match?
      return shorter.slice(i) === longer.slice(i + 1);
    }
  }
  return shorter === longer.slice(0, shorter.length);
}

/**
 * Return any strings that could be a typo of s
 *
 * @param {string} s
 * @param {string[]} strings
 */
export function typos(s, strings) {
  return strings.filter((str) => isTypo(s, str));
}
