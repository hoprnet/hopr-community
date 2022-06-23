import { FC, useEffect, useState } from "react";
import { useSigma } from "react-sigma-v2";

import { FiltersState } from "../types";

// function prettyPercentage(val: number): string {
//   return (val * 100).toFixed(1) + "%";
// }

const GraphTitle: FC<{ filters: FiltersState, refresh: boolean }> = ({ filters, refresh }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const [, setVisibleItems] = useState<{ nodes: number; edges: number }>({ nodes: 0, edges: 0 });
  useEffect(() => {
    // To ensure the graphology instance has up to data "hidden" values for
    // nodes, we wait for next frame before reindexing. This won't matter in the
    // UX, because of the visible nodes bar width transition.
    requestAnimationFrame(() => {
      const index = { nodes: 0, edges: 0 };
      graph.forEachNode((_, { hidden }) => !hidden && index.nodes++);
      graph.forEachEdge((_, _2, _3, _4, source, target) => !source.hidden && !target.hidden && index.edges++);
      setVisibleItems(index);
    });
  }, [filters, refresh]);

  return (
    <div className="graph-title">
      <h1>The HOPR Network</h1>
      <h2>
        <i>
          {graph.order} node{graph.order > 1 ? "s" : ""}, {graph.size} edge
          {graph.size > 1 ? "s" : ""}{" "}
        </i>
      </h2>
    </div>
  );
};

export default GraphTitle;
