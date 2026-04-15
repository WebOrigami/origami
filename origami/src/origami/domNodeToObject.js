const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const CDATA_SECTION_NODE = 4;
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;

export default function domNodeToObject(node) {
  switch (node.nodeType) {
    case DOCUMENT_NODE:
      return {
        name: "#document",
        children: [...node.childNodes]
          .filter((child) => !isWhitespaceOnly(child))
          .map(domNodeToObject),
      };

    case DOCUMENT_FRAGMENT_NODE:
      return {
        name: "#document-fragment",
        children: [...node.childNodes]
          .filter((child) => !isWhitespaceOnly(child))
          .map(domNodeToObject),
      };

    case ELEMENT_NODE: {
      const attributes = Object.fromEntries(
        [...node.attributes].map((attr) => [attr.name, attr.value]),
      );

      const relevantChildren = [...node.childNodes].filter(
        (child) =>
          (child.nodeType === ELEMENT_NODE ||
            child.nodeType === TEXT_NODE ||
            child.nodeType === CDATA_SECTION_NODE) &&
          !isWhitespaceOnly(child),
      );

      const onlyText = relevantChildren.every(
        (child) =>
          child.nodeType === TEXT_NODE || child.nodeType === CDATA_SECTION_NODE,
      );

      const result = {
        name: node.localName,
      };
      if (Object.keys(attributes).length > 0) {
        result.attributes = attributes;
      }
      if (onlyText) {
        const text = relevantChildren
          .map((child) => collapseWhitespace(child.nodeValue ?? ""))
          .join("")
          .trim();
        if (text.length > 0) {
          result.text = text;
        }
      } else if (relevantChildren.length > 0) {
        result.children = relevantChildren.map(domNodeToObject);
      }

      return result;
    }

    case TEXT_NODE:
      return {
        name: "#text",
        text: collapseWhitespace(node.nodeValue ?? ""),
      };

    case CDATA_SECTION_NODE:
      return {
        name: "#cdata-section",
        text: collapseWhitespace(node.nodeValue ?? ""),
      };

    default:
      return {
        name: `#node-${node.nodeType}`,
      };
  }
}

// Collapse leading or trailing whitespace characters to a single space
function collapseWhitespace(str) {
  return str.replace(/^\s+/, " ").replace(/\s+$/, " ");
}

function isWhitespaceOnly(node) {
  return (
    (node.nodeType === TEXT_NODE || node.nodeType === CDATA_SECTION_NODE) &&
    node.nodeValue.trim() === ""
  );
}
