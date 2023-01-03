import graphviz from "graphviz-wasm";

let graphvizLoaded = false;

export default async function flowSvg(flow) {
  if (!graphvizLoaded) {
    await graphviz.loadWASM();
    graphvizLoaded = true;
  }
  const dot = flowDot(flow);
  const svg = await graphviz.layout(dot, "svg");
  return svg;
}

function flowDot(flow) {
  const nodes = [];
  const edges = [];
  for (const [key, record] of Object.entries(flow)) {
    const dependencies = record.dependencies ?? [];
    let label = record.label ?? key;
    if (record.undefined) {
      label += " (?)";
    }
    const virtualNode = dependencies.length > 0;
    const url = record.url ?? key;
    const nodeLabel = `label="${label}"`;
    const nodeUrl = `URL="${url}"`;
    const nodeShape = record.undefined ? `shape="none"` : "";
    const nodeStyle = virtualNode ? `style="dashed"` : null;
    const attributes = [nodeLabel, nodeShape, nodeStyle, nodeUrl].filter(
      (attribute) => attribute
    );
    const nodeDot = `  "${key}" [${attributes.join("; ")}];`;
    nodes.push(nodeDot);

    for (const dependency of dependencies) {
      edges.push(`  "${dependency}" -> "${key}";`);
    }
  }

  return `digraph dataflow {
  nodesep=1;
  rankdir=LR;
  ranksep=1.5;
  node [color="gray70"; fillcolor="white"; fontname="Helvetica"; fontsize="10"; nojustify="true"; style="filled"; shape="box"];
  edge [arrowhead="onormal"; arrowsize="0.75"; color="gray60"; fontname="Helvetica"; fontsize="10"; labeldistance="5"];

${nodes.join("\n")}

${edges.join("\n")}
}`;
}

flowSvg.usage = `flowSvg <dataflow>\tRenders the output of dataflow() as an SVG`;
flowSvg.documentation = "https://graphorigami.org/cli/builtins.html#flowSvg";
