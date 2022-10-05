import type { Settings } from "../state";

export const getUrlParams = (loc: Location): Partial<Settings> => {
    const params = new URLSearchParams(loc.search);
    const userData = localStorage.getItem("userData");
    
    if(params.get("apiEndpoint")) {
      const userData = {
        apiEndpoint: params.get("apiEndpoint"),
        apiToken: params.get("apiToken"),
      };
      if(localStorage) {
        localStorage.setItem("userData", JSON.stringify(userData));
      }
    }
    
    if (userData) {
      const parsed = JSON.parse(userData);

      return {
        apiEndpoint: parsed.apiEndpoint,
        apiToken: parsed.apiToken,
      }
    } else {
      return {
        apiEndpoint: undefined,
        apiToken: undefined,
      }
    }
  };

export const getUserConfig = () => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      return {
        apiEndpoint: parsed.apiEndpoint,
        apiToken: parsed.apiToken,
      }
    } else {
      return {
        apiEndpoint: undefined,
        apiToken: undefined,
      }
    }
  };

export const getRelayerConfig = () => {
    const relayerData = localStorage.getItem("relayerData");
    if (relayerData) {
      const parsed = JSON.parse(relayerData);
      return {
        apiEndpoint: parsed.apiEndpoint,
        apiToken: parsed.apiToken,
        rpcEndpoint: parsed.rpcEndpoint,
      }
    } else {
      return {
        apiEndpoint: undefined,
        apiToken: undefined,
        rpcEndpoint: undefined,
      }
    }
  }