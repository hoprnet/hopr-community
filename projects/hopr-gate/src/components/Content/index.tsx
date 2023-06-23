import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dropdown } from "semantic-ui-react";
import { MethodDropdownOptions } from "../../constants";
import { getRelayerConfig } from "../../lib/url";
import { RelayerStateContext } from "../../contexts/RelayerStateProvider";
import { WebsocketContext } from "../../contexts/WebsocketProvider";
import styles from "./styles.module.scss";

interface ComponentType {
  interfaceType: string;
}

const Content: React.FC<ComponentType> = (props: ComponentType) => {
  const route = useLocation();
  const navigate = useNavigate();
  const [method, setMethod] = useState("");
  const relayerConfig = getRelayerConfig();

  const [relayerApiUrl, setRelayerApiUrl] = useState(relayerConfig.apiEndpoint);
  const [relayerApiToken, setRelayerApiToken] = useState(
    relayerConfig.apiToken
  );
  const [relayerRpcEndpoint, setRelayerRpcEndpoint] = useState(
    relayerConfig.rpcEndpoint
  );

  const { relayerStatus, eventsList, relayerPeerId } = useContext(RelayerStateContext);
  const { handleSendMessage, rpcCallAsnwer } = useContext(WebsocketContext);

  const relayerDropdown = [
    {
      key: `${relayerRpcEndpoint?.slice(8)}@${relayerPeerId?.slice(0, 12)}`,
      text: `${relayerRpcEndpoint?.slice(8)}@${relayerPeerId?.slice(0, 12)}`,
      value: `${relayerRpcEndpoint?.slice(8)}@${relayerPeerId?.slice(0, 12)}`,
    }
  ];

  const handleSave = () => {
    const relayerData = {
      apiEndpoint: relayerApiUrl,
      apiToken: relayerApiToken,
      rpcEndpoint: relayerRpcEndpoint,
    };
    localStorage.setItem("relayerData", JSON.stringify(relayerData));
    window.location.reload();
  };

  const onChangeMethod = (event: any, data: any) => {
    // console.log(event.target.innerText);
    setMethod(event.target.innerText);
    // console.log(method);
  };

  useEffect(() => {
    const logs = document.getElementById("logs") as HTMLTextAreaElement;

    if (logs && eventsList.at(-1) !== undefined) {
      logs.value = eventsList?.at(-1).event;
    }
  }, [relayerStatus]);

  return (
    <section className={styles.content}>
      <div className={styles.container}>
        <div className={styles.menu}>
          <div
            className={styles.relayer}
            onClick={() => {
              if (route.pathname === "/user") {
                navigate("/");
              }
            }}
            style={
              props.interfaceType === "RELAYER"
                ? {
                    background:
                      "linear-gradient(180deg, #000000 0%, #0202b3 100%)",
                    cursor: "default",
                    color: "white",
                  }
                : { background: "white", cursor: "pointer", color: "black" }
            }
          >
            Relayer
          </div>

          <div
            className={styles.user}
            onClick={() => {
              if (route.pathname === "/") {
                navigate("/user");
              }
            }}
            style={
              props.interfaceType === "USER"
                ? {
                    background:
                      "linear-gradient(180deg, #000000 0%, #0202b3 100%)",
                    cursor: "default",
                    color: "white",
                  }
                : { background: "white", cursor: "pointer", color: "black" }
            }
          >
            User
          </div>
        </div>

        <div className={styles.interface}>
          {props.interfaceType === "RELAYER" && (
            <>
              <div className={styles.columns} style={{ height: "500px" }}>
                <div className={styles.left}>
                  <div className={styles.form}>
                    <div className={styles.input}>
                      <div className={styles.title}>
                        <label>Relayer API URL:</label>
                      </div>
                      <input
                        type="text"
                        name="RELAYER_API_URL"
                        id="RELAYER_API_URL"
                        value={relayerApiUrl}
                        onChange={(e) => setRelayerApiUrl(e.target.value)}
                      />
                    </div>

                    <div className={styles.input}>
                      <div className={styles.title}>
                        <label>Relayer API KEY:</label>
                      </div>
                      <input
                        type="text"
                        name="RELAYER_API_KEY"
                        id="RELAYER_API_KEY"
                        value={relayerApiToken}
                        onChange={(e) => setRelayerApiToken(e.target.value)}
                      />
                    </div>

                    <div className={styles.input}>
                      <div className={styles.title}>
                        <label>Relayer RPC Endpoint:</label>
                      </div>
                      <input
                        type="text"
                        name="RELAYER_API_ENDPOINT"
                        id="RELAYER_API_ENDPOINT"
                        value={relayerRpcEndpoint}
                        onChange={(e) => setRelayerRpcEndpoint(e.target.value)}
                      />
                    </div>

                    <div className={styles.relayerStatus}>
                      <div
                        className={styles.ball}
                        style={
                          relayerStatus
                            ? { backgroundColor: "lime" }
                            : { backgroundColor: "red" }
                        }
                      />
                      Relayer {relayerStatus ? "On-line" : "Off-line"}
                    </div>
                  </div>

                  <div className={styles.saveButton} onClick={handleSave}>
                    Save
                  </div>
                </div>
                <div className={styles.right}>
                  <div className={styles.logs}>
                    <div className={styles.title}>
                      <label htmlFor="logs">Logs</label>
                    </div>
                    <textarea
                      name="logs"
                      id="logs"
                      cols={45}
                      rows={26}
                    ></textarea>
                  </div>
                </div>
              </div>
            </>
          )}

          {props.interfaceType === "USER" && (
            <>
              <div className={styles.columns}>
                <div className={styles.left}>
                  <div className={styles.form}>
                    <div className={styles.dropdown}>
                      <div className={styles.title}>
                        <label>Relayer Address:</label>
                      </div>
                      <Dropdown
                        fluid
                        selection
                        options={relayerStatus ? relayerDropdown : [{
                          key: "No relayer available",
                          text: "No relayer available",
                          value: "No relayer available",
                        }]}
                      />
                    </div>

                    <div className={styles.dropdown}>
                      <div className={styles.title}>
                        <label>Method:</label>
                      </div>
                      <Dropdown
                        fluid
                        selection
                        options={MethodDropdownOptions}
                        onChange={onChangeMethod}
                      />
                    </div>

                    {method === "eth_call" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>From</label>
                          </div>
                          <input
                            type="text"
                            name="FROM_ADDRESS"
                            id="FROM_ADDRESS"
                            placeholder="0xd313..."
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>To*</label>
                          </div>
                          <input
                            type="text"
                            name="TO_ADDRESS"
                            id="TO_ADDRESS"
                            placeholder="0xd313..."
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Gas</label>
                          </div>
                          <input
                            type="text"
                            name="GAS"
                            id="GAS"
                            placeholder="128, 0*80"
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Gas Price</label>
                          </div>
                          <input
                            type="text"
                            name="GAS_PRICE"
                            id="GAS_PRICE"
                            placeholder="128, 0*80"
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Value</label>
                          </div>
                          <input
                            type="text"
                            name="VALUE"
                            id="VALUE"
                            placeholder="128, 0*80"
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Data</label>
                          </div>
                          <input
                            type="text"
                            name="DATA"
                            id="DATA"
                            placeholder="0*00..."
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Number</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_NUMBER"
                            id="BLOCK_NUMBER"
                            value="latest"
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_estimateGas" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>From</label>
                          </div>
                          <input
                            type="text"
                            name="FROM_ADDRESS"
                            id="FROM_ADDRESS"
                            placeholder="0xd313..."
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>To*</label>
                          </div>
                          <input
                            type="text"
                            name="TO_ADDRESS"
                            id="TO_ADDRESS"
                            placeholder="0xd313..."
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Gas</label>
                          </div>
                          <input
                            type="text"
                            name="GAS"
                            id="GAS"
                            placeholder="128, 0*80"
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Gas Price</label>
                          </div>
                          <input
                            type="text"
                            name="GAS_PRICE"
                            id="GAS_PRICE"
                            placeholder="128, 0*80"
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Value</label>
                          </div>
                          <input
                            type="text"
                            name="VALUE"
                            id="VALUE"
                            placeholder="128, 0*80"
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Data</label>
                          </div>
                          <input
                            type="text"
                            name="DATA"
                            id="DATA"
                            placeholder="0*00..."
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_getBalance" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Address</label>
                          </div>
                          <input
                            type="text"
                            name="ADDRESS"
                            id="ADDRESS"
                            placeholder="0xd313..."
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Number</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_NUMBER"
                            id="BLOCK_NUMBER"
                            value="latest"
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_getBlockByHash" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Hash</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_HASH"
                            id="BLOCK_HASH"
                            placeholder="0x9af413..."
                          />
                        </div>

                        <div className={styles.checkbox}>
                          <input
                            type="checkbox"
                            name="TRANSACTION_OBJECT"
                            id="TRANSACTION_OBJECT"
                            value="latest"
                          />
                          <div className={styles.title}>
                            <label>Transaction Object</label>
                          </div>
                        </div>
                      </div>
                    )}

                    {method === "eth_getBlockByNumber" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Hash</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_HASH"
                            id="BLOCK_HASH"
                            placeholder="0x9af413..."
                          />
                        </div>

                        <div className={styles.checkbox}>
                          <input
                            type="checkbox"
                            name="TRANSACTION_OBJECT"
                            id="TRANSACTION_OBJECT"
                            value="latest"
                          />
                          <div className={styles.title}>
                            <label>Transaction Object</label>
                          </div>
                        </div>
                      </div>
                    )}

                    {method === "eth_getBlockTransactionCountByHash" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Hash</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_HASH"
                            id="BLOCK_HASH"
                            placeholder="0x9af413..."
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_getBlockTransactionCountByNumber" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Hash</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_HASH"
                            id="BLOCK_HASH"
                            placeholder="0x9af413..."
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_getCode" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Address</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_HASH"
                            id="BLOCK_HASH"
                            placeholder="0xd313..."
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Number</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_NUMBER"
                            id="BLOCK_NUMBER"
                            value="latest"
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_getStorageAt" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Address</label>
                          </div>
                          <input
                            type="text"
                            name="ADDRESS"
                            id="ADDRESS"
                            placeholder="0xd313..."
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Index</label>
                          </div>
                          <input
                            type="text"
                            name="INDEX"
                            id="INDEX"
                            placeholder="128, 0*80"
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Number</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_NUMBER"
                            id="BLOCK_NUMBER"
                            value="latest"
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_getTransactionByBlockHashAndIndex" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Hash</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_HASH"
                            id="BLOCK_HASH"
                            placeholder="0x9af413..."
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Index</label>
                          </div>
                          <input
                            type="text"
                            name="INDEX"
                            id="INDEX"
                            placeholder="128, 0*80"
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_getTransactionByBlockNumberAndIndex" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Number</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_NUMBER"
                            id="BLOCK_NUMBER"
                            value="latest"
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Index</label>
                          </div>
                          <input
                            type="text"
                            name="INDEX"
                            id="INDEX"
                            placeholder="128, 0*80"
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_getTransactionByHash" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Transaction Hash</label>
                          </div>
                          <input
                            type="text"
                            name="TRANSACTION_HASH"
                            id="TRANSACTION_HASH"
                            placeholder="0*9af413..."
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_getTransactionCount" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Address</label>
                          </div>
                          <input
                            type="text"
                            name="ADDRESS"
                            id="ADDRESS"
                            placeholder="0xd313..."
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Number</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_NUMBER"
                            id="BLOCK_NUMBER"
                            value="latest"
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_getTransactionReceipt" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Transaction Hash</label>
                          </div>
                          <input
                            type="text"
                            name="TRANSACTION_HASH"
                            id="TRANSACTION_HASH"
                            placeholder="0*9af413..."
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_getUncleByBlockHashAndIndex" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Hash</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_HASH"
                            id="BLOCK_HASH"
                            placeholder="0x9af413..."
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Index</label>
                          </div>
                          <input
                            type="text"
                            name="INDEX"
                            id="INDEX"
                            placeholder="128, 0*80"
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_getUncleByBlockNumberAndIndex" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Number</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_Number"
                            id="BLOCK_Number"
                            value="latest"
                          />
                        </div>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Index</label>
                          </div>
                          <input
                            type="text"
                            name="INDEX"
                            id="INDEX"
                            placeholder="128, 0*80"
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_getUncleCountByBlockHash" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Hash</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_HASH"
                            id="BLOCK_HASH"
                            placeholder="0x9af413..."
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_getUncleCountByBlockNumber" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Block Number</label>
                          </div>
                          <input
                            type="text"
                            name="BLOCK_NUMBER"
                            id="BLOCK_NUMBER"
                            value="latest"
                          />
                        </div>
                      </div>
                    )}

                    {method === "eth_sendRawTransaction" && (
                      <div className={styles.parameters}>
                        <span className={styles.spanTitle}>Parameters</span>

                        <div className={styles.input}>
                          <div className={styles.title}>
                            <label>Data</label>
                          </div>
                          <input
                            type="text"
                            name="DATA"
                            id="DATA"
                            value="0x0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.right}>
                  <div className={styles.preview}>
                    <div className={styles.title}>
                      <label htmlFor="preview">Preview</label>
                    </div>
                    <textarea
                      name="preview"
                      id="preview"
                      cols={45}
                      rows={10}
                      value={method ? JSON.stringify({
                        jsonrpc: "2.0",
                        id: 0,
                        method: method,
                      }, undefined, 4) : ""}
                    ></textarea>
                  </div>

                  <div className={styles.response}>
                    <div className={styles.title}>
                      <label htmlFor="response">Response</label>
                    </div>
                    <textarea
                      name="response"
                      id="response"
                      cols={45}
                      rows={10}
                      value={rpcCallAsnwer ? JSON.stringify({
                        tag : rpcCallAsnwer.tag,
                        relayer: `${rpcCallAsnwer.address.slice(0, 12)}...`,
                        response: rpcCallAsnwer.content[0],
                      }, undefined, 4) : ""}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className={styles.sendButton} onClick={() => { method ? handleSendMessage(method, relayerPeerId) : console.log("No Method Selected!")}}>Send Request</div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Content;
