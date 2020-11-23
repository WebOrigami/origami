import TransformGraph from "./TransformGraph.js";

export default class ExplorablePatternMap extends TransformGraph {
  constructor(options) {
    super(options);
    this.sourcePattern = options.sourcePattern;
    this.targetPattern = options.targetPattern;
    this.sourceRegex = regexFromPattern(options.sourcePattern);
    this.targetRegex = regexFromPattern(options.targetPattern);
  }

  sourceKeyForVirtualKey(key) {
    return transpose(key, this.targetRegex, this.sourcePattern);
  }

  virtualKeyForSourceKey(key) {
    return transpose(key, this.sourceRegex, this.targetPattern);
  }
}

function transpose(key, regex, pattern) {
  const match = regex.exec(key);
  return match ? pattern.replace("*", match[1]) : undefined;
}

// Escape a string for use in a regex.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function regexFromPattern(pattern) {
  const escaped = escapeRegExp(pattern);
  const replaceAsterisk = escaped.replace("\\*", "(.+)");
  const regex = new RegExp(`^${replaceAsterisk}$`);
  return regex;
}
