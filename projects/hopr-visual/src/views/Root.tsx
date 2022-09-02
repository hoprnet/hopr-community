import { FC, useEffect, useState } from "react";
import { SigmaContainer, ZoomControl, FullScreenControl } from "react-sigma-v2";
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";

import GraphSettingsController from "./GraphSettingsController";
import GraphEventsController from "./GraphEventsController";
import GraphDataController from "./GraphDataController";
import DescriptionPanel from "./DescriptionPanel";
import { ApolloAccountQuery, ApolloChannelQuery, Dataset, FiltersState, VisualMode, RemoteStatus } from "../types";
import SearchField from "./SearchField";
import drawLabel from "../canvas-utils";
import GraphTitle from "./GraphTitle";
import { datasetBuilderAccount, datasetBuilderChannel, exploreLocalCluster } from "../utils/dataset-utils"

import "react-sigma-v2/lib/react-sigma-v2.css";
import { GrClose } from "react-icons/gr";
import { BiRadioCircleMarked, BiBookContent, BiNetworkChart } from "react-icons/bi";
import { BsArrowsFullscreen, BsFullscreenExit, BsZoomIn, BsZoomOut } from "react-icons/bs";
import EndpointField from "./EndpointField";
import { isSSR, getUrlParams, Settings } from "../utils/api"

const APIURL = 'https://api.thegraph.com/subgraphs/name/hoprnet/hopr-channels'
const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache(),
})


const Root: FC = () => {
  const urlParams = !isSSR ? getUrlParams(window.location) : {} as Settings
  const [showContents, setShowContents] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [dataset, setDataset] = useState<Dataset>({} as Dataset);
  const [localNodeEndpoint, setLocalNodeEndpoint] = useState(urlParams.apiEndpoint || "");
  const [nodeToken, setNodeToken] = useState(urlParams.apiToken || "");
  const [remoteError, setRemoteError] = useState("");
  const [remoteStatus, setRemoteStatus] = useState(RemoteStatus.invalid);
  const [refresh, setRefresh] = useState(false); //refresh sigma at every state change
  const [filtersState] = useState<FiltersState>({
    clusters: {},
    tags: {},
  });
  const [mode, setMode] = useState(() => {
    if (urlParams.mode === "api") {
      return VisualMode.Localnode
    } else {
      return VisualMode.Subgraph
    }
  })

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const GET_ACCOUNTS = gql`
  query getAccounts {
    accounts(first: 1000, where:{isActive: true}) {
      id
      publicKey
      balance
      openChannelsCount
      isActive
    }
  }
  `;
  const GET_CHANNELS = gql`
  query getChannels($skipCycle: Int!) {
    channels(first: 1000, skip: $skipCycle, where: {status: OPEN}) {
      id
      source {
        id
      }
      destination {
        id
      }
      balance
      commitment
      channelEpoch
      ticketEpoch
      ticketIndex
      status
      commitmentHistory
    }
  }
`;



  function toggleVisualMode(): void {
    switch (mode) {
      case VisualMode.Localnode:
        setMode(VisualMode.Subgraph)
        break;
      case VisualMode.Subgraph:
        setMode(VisualMode.Localnode)
        break;
      default:
        throw new Error("VisualMode not supported")
    }
  }

  async function runQuery(): Promise<Dataset> {

    console.log("Loading data...")

    const a = client.query<ApolloAccountQuery>({ query: GET_ACCOUNTS, });
    const b = client.query<ApolloChannelQuery>({ query: GET_CHANNELS, variables: { skipCycle: 0 } });
    const c = client.query<ApolloChannelQuery>({ query: GET_CHANNELS, variables: { skipCycle: 1000 } });
    const d = client.query<ApolloChannelQuery>({ query: GET_CHANNELS, variables: { skipCycle: 2000 } });

    try {
      const res = await Promise.all([Promise.all([a]), Promise.all([b, c, d])])

      let dataset: Dataset = {
        nodes: [],
        edges: []
      }

      for (let i = 0; i < res[0].length; i++) {
        dataset = datasetBuilderAccount(res[0][i].data, dataset)
      }

      for (let i = 0; i < res[1].length; i++) {
        dataset = datasetBuilderChannel(res[1][i].data, dataset)
      }
      console.log("Data is ready")
      return dataset
    } catch (error) {
      console.error(error)
      throw new Error("Thegraph fetch error")
    }
  }

  useEffect(() => {

    async function loadData() {
      const setDatabase = async () => {
        let dataset: Dataset | undefined = {
          nodes: [],
          edges: []
        }
        try {
          switch (mode) {
            case VisualMode.Localnode:
              if (remoteStatus === RemoteStatus.selected) {
                console.log("Starting exploration at ", localNodeEndpoint)
                try {
                  dataset = await exploreLocalCluster(localNodeEndpoint, nodeToken, setRemoteStatus, setRemoteError)
                } catch (error: any) {
                  setRemoteError(error)
                  setRemoteStatus(RemoteStatus.errored)
                }
              } else if (remoteStatus === RemoteStatus.invalid || remoteStatus === RemoteStatus.errored) {
                setRefresh(!refresh)
              }
              break;
            case VisualMode.Subgraph:
              dataset = await runQuery()
              break;
            default:
              throw new Error("VisualMode not supported")
          }
        } catch (error) {
          dataset = {
            nodes: [],
            edges: []
          }
        }

        if (dataset === undefined)
          return;

        setDataset(dataset)
        requestAnimationFrame(() => setDataReady(true));
        setRefresh(!refresh)
      }

      setDatabase()
    }

    loadData()
  }, [mode, remoteStatus === RemoteStatus.valid, remoteStatus === RemoteStatus.errored, remoteStatus === RemoteStatus.selected, remoteStatus === RemoteStatus.invalid, localNodeEndpoint, nodeToken])

  return (
    <div id="app-root" className={showContents ? "show-contents" : ""}>
      {!dataReady ? <div className="LoadingScreen">Loading data... <div className="loader" /></div> :
        <SigmaContainer
          graphOptions={{ type: "directed" }}
          initialSettings={{
            nodeProgramClasses: { image: getNodeProgramImage() },
            labelRenderer: drawLabel,
            defaultNodeType: "image",
            defaultEdgeType: "arrow",
            renderEdgeLabels: true,
            labelDensity: 0.07,
            labelGridCellSize: 60,
            labelRenderedSizeThreshold: 15,
            labelFont: "Lato, sans-serif",
            zIndex: true,
          }}
          className="react-sigma"
        >
          <GraphSettingsController hoveredNode={hoveredNode} />
          <GraphEventsController setHoveredNode={setHoveredNode} />
          <GraphDataController dataset={dataset} filters={filtersState} refresh={refresh} mode={mode} />
          {dataReady && (
            <>
              <div className="controls">
                <div className="ico">
                  <button
                    type="button"
                    className="show-contents"
                    onClick={() => setShowContents(true)}
                    title="Show caption and description"
                  >
                    <BiBookContent />
                  </button>
                </div>
                <FullScreenControl
                  className="ico"
                  customEnterFullScreen={<BsArrowsFullscreen />}
                  customExitFullScreen={<BsFullscreenExit />}
                />
                <ZoomControl
                  className="ico"
                  customZoomIn={<BsZoomIn />}
                  customZoomOut={<BsZoomOut />}
                  customZoomCenter={<BiRadioCircleMarked />}
                />

                <div className="ico">
                  <button
                    type="button"
                    className="Mode"
                    onClick={() => toggleVisualMode()}
                    title="Toggle Graph Mode"
                  >
                    <BiNetworkChart />
                  </button>
                </div>
              </div>
              <div className="contents">
                <div className="ico">
                  <button
                    type="button"
                    className="ico hide-contents"
                    onClick={() => setShowContents(false)}
                    title="Show caption and description"
                  >
                    <GrClose />
                  </button>
                </div>
                <GraphTitle filters={filtersState} refresh={refresh} />

                <div className="panels">
                  {mode === VisualMode.Subgraph ? <SearchField filters={filtersState} /> : <EndpointField endpoint={localNodeEndpoint} remoteStatus={remoteStatus} nodeToken={nodeToken} error={remoteError} setNodeToken={setNodeToken} setRemoteEndpoint={setLocalNodeEndpoint} setRemoteStatus={setRemoteStatus} />}
                  <DescriptionPanel mode={mode} />

                </div>
              </div>
            </>
          )}
        </SigmaContainer>
      }</div>
  );
};

export default Root;

