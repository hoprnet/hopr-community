import { useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";
import { keyBy, omit } from "lodash";
import { random } from 'graphology-layout';

import { Dataset, FiltersState, VisualMode } from "../types";
import forceAtlas2 from "graphology-layout-forceatlas2";

const GraphDataController: FC<{ dataset: Dataset; filters: FiltersState, refresh: boolean, mode: VisualMode }> = ({ dataset, filters, children, refresh, mode }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  useEffect(() => {
    //console.log("Sigma refreshing")
    //sigma.refresh()
  }, [refresh])

  /**
   * Feed graphology with the new dataset:
   */
  useEffect(() => {
    if (!graph || !dataset) return;

    let clustersA = [
      {
        "key": "1",
        "color": "#5f83cc",
        "clusterLabel": "Nodes"
      }
    ]
    // let tagsA = [
    //   {
    //     "key": "nodes",
    //     "image": "technology.svg"
    //   }
    // ]

    const clusters = keyBy(clustersA, "key");
    // const tags = keyBy(tagsA, "key");

    graph.clear()

    dataset.nodes.forEach((node) =>
      graph.addNode(node.id, {
        ...node,
        label: node.id,
        URL: "https://blockscout.com/xdai/mainnet/address/" + node.id,
        score: node.balance,
        cluster: "1",
        tag: "nodes",
        ...omit(clusters["1"], "key"),
      }),
    );
    dataset.edges.forEach((channel) => graph.addEdge(channel.source.id, channel.destination.id, { size: 1, label: channel.balance }));

    // Use degrees as node sizes:
    const scores = graph.nodes().map((node) => graph.getNodeAttribute(node, "score"));
    const minDegree = Math.min(...scores);
    const maxDegree = Math.max(...scores);
    const MIN_NODE_SIZE = 3;
    const MAX_NODE_SIZE = 10;
    graph.forEachNode((node) => {
      graph.setNodeAttribute(
        node,
        "size",
        ((graph.getNodeAttribute(node, "score") - minDegree) / (maxDegree - minDegree)) *
        (MAX_NODE_SIZE - MIN_NODE_SIZE) +
        MIN_NODE_SIZE,
      );
      //graph.setNodeAttribute(node, 'x', 0);
      //graph.setNodeAttribute(node, 'y', i);
      //i++;
    }
    );
    random.assign(graph);
    const settings = forceAtlas2.inferSettings(graph);
    forceAtlas2.assign(graph, { settings, iterations: 200 });

    sigma.getCamera().animatedReset()

    return () => graph.clear();
  }, [graph, dataset]);

  /**
   * Apply filters to graphology:
   */
  useEffect(() => {/*
    const { clusters, tags } = filters;
    console.log("Filter state: ", filters)
    graph.forEachNode((node, { cluster, tag }) => {
      graph.setNodeAttribute(node, "hidden", !clusters[cluster] || !tags[tag])
    }
    );*/
  }, [graph, filters]);

  return <>{children}</>;
};

export default GraphDataController;
