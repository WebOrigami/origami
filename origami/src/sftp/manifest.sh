(find . -type f -print0 | xargs -0 shasum -a 1 | sed -E 's#^([^[:space:]]+) +\./(.*)#\2: \1#'; find . -type d -empty -not -path . -print | sed -E 's#^\./(.*)#\1: {}#') | env LC_ALL=C sort
