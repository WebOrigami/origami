import rss from "./@rss.js";

const entries = {
  rss,
};

export default function site(key) {
  return entries[key];
}
