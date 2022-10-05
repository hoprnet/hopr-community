import { useImmer } from "use-immer";
import { decode } from "rlp";
import { getUrlParams, getRelayerConfig } from "../lib/url";

export type Settings = {
  apiEndpoint: string;
  apiToken?: string;
};

export type State = {
  settings: Settings;
};

export type RpcCallStruct = {
  tag: string;
  from: string;
  address: string;
  content: string[];
};

export const isSSR: boolean = typeof window === "undefined";

export const DEFAULT_SETTINGS: Settings = {
  apiEndpoint: "http://localhost:3001",
};

export const useAppState = () => {
  const urlParams = !isSSR ? getUrlParams(window.location) : {};
  const [state, setState] = useImmer<State>({
    settings: {
      apiEndpoint: urlParams.apiEndpoint || DEFAULT_SETTINGS.apiEndpoint,
      apiToken: urlParams.apiToken,
    },
  });

  const [rpcCallAsnwer, setRpcCallAsnwer] = useImmer<RpcCallStruct>({
    tag: "",
    from: "",
    address : "",
    content: [],
  });

  const updateSettings = (settings: Partial<Settings>) => {
    setState((draft) => {
      for (const [k, v] of Object.entries(settings)) {
        (draft.settings as any)[k] = v;
      }
      return draft;
    });
  }

    const decodeMessage = (msg: string): {
      tag: string;
      from: string;
      address: string;
      content: string[];
    } => {
      let uint8Array = new Uint8Array(JSON.parse(`[${msg}]`));
      let decodedArray = decode(uint8Array);
      if (decodedArray[0] instanceof Uint8Array) {
        const data = new TextDecoder().decode(decodedArray[0]);
        const [tag, from, address, ...content] = data.split(":");
        return {
          tag,
          from,
          address,
          content,
        };
      }
      throw Error(`Could not decode received message: ${msg}`);
    };

    const handleReceivedMessage = async (ev: MessageEvent<string>) => {
      try {
        const data = decodeMessage(ev.data);
        if(data.tag === "jsonrpc") {
        setRpcCallAsnwer((draft) => {
          draft.tag = data.tag;
          draft.from = data.from;
          draft.address = data.address;
          draft.content = data.content;
          return draft;
        });
        }
        //const message = JSON.parse(data);
      } catch (err) {
        console.error(err);
      }
    };

    return {
      state: {
        ...state,
      },
      rpcCallAsnwer: {
        ...rpcCallAsnwer
      },
      updateSettings,
      handleReceivedMessage,
    };
  };

export const useRelayerState = () => {
  const relayerConfig = getRelayerConfig();
  const [relayerState, setRelayerState] = useImmer<State>({
    settings: {
      apiEndpoint: relayerConfig.apiEndpoint || DEFAULT_SETTINGS.apiEndpoint,
      apiToken: relayerConfig.apiToken,
    }
  });

  const updateSettings = (settings: Partial<Settings>) => {
    setRelayerState((draft) => {
      for (const [k, v] of Object.entries(settings)) {
        (draft.settings as any)[k] = v;
      }
      return draft;
    });
  }

  return {
    relayerState: {
      ...relayerState,
    },
    updateSettings,
  };
};


// export default useAppState;
