/**
 * Returns true if one string could be a typo of the other.
 *
 * We generally define a typo as two strings with a Damerau-Levenshtein distance
 * of 1. This will be true if the strings differ by a single insertion,
 * deletion, substitution, or transposition.
 *
 * Additionally, we consider two strings that differ only in case to be typos,
 * as well as two strings that differ only by accents.
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

  // If the strings are the same ignoring case, consider them typos
  if (s1.toLowerCase() === s2.toLowerCase()) {
    return true;
  }

  // If the strings are the same ignoring accents, consider them typos
  if (normalize(s1) === normalize(s2)) {
    return true;
  }

  // If strings are both a single character, we don't want to consider them
  // typos.
  if (length1 === 1 && length2 === 1) {
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

function normalize(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
