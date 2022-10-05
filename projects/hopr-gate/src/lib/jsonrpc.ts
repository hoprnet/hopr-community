import { ethers } from "ethers";
import { getRelayerConfig } from "./url";

const relayerConfig = getRelayerConfig();
const provider = relayerConfig
  ? new ethers.providers.JsonRpcProvider(relayerConfig.rpcEndpoint)
  : undefined;

export const sendRpcMethod = async (method: string, ...args) => {
  provider.send(method, [...args]).then((res) => {
    console.log(res);
    return res;
  });
};

const encodeSignedRecipient = (from: string, signature?: string): string => {
  return `${from}${signature ? `-${signature}` : ""}`;
};

export const encodeMessage = (
  from: string,
  message: string,
  isRelayer: string,
  signature?: string
): string => {
  return `jsonrpc:${isRelayer}:${encodeSignedRecipient(
    from,
    signature
  )}:${message}`;
};
