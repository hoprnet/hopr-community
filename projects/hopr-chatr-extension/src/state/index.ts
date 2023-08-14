/*
  A react hook.
  Contains the app's global state.
*/
import { useImmer } from "use-immer";
import { decodeMessage, encodeMessage, genId, getUrlParams, isSSR, verifySignatureFromPeerId } from "../utils";
import { MutableRefObject } from "react";
import { sendMessage, signRequest } from "../lib/api";
import { utils } from "ethers";

export type { ConnectionStatus } from "./websocket";

export type VerifiedStatus = "UNVERIFIED" | "VERIFIED" | "FAILED_VERIFICATION"

export type UpdateMessageHandlerInterface = (
  counterparty: string,
  messageId: string,
  status: Message["status"],
  error?: string | undefined
) => void;

export type Message = {
  id: string;
  isIncoming: boolean;
  content: string;
  createdBy: string;
  createdAt: number;
  status: "UNKNOWN" | "SUCCESS" | "FAILURE";
  error?: string;
  verifiedStatus?: VerifiedStatus;
  hasHTML?: boolean;
};

export type Settings = {
  httpEndpoint: string;
  wsEndpoint: string;
  securityToken?: string;
};

export const DEFAULT_SETTINGS: Settings = {
  httpEndpoint: "http://localhost:3001",
  wsEndpoint: "ws://localhost:3000"
}

export type State = {
  settings: Settings;
  conversations: Map<string, Map<string, Message>>;
  selection?: string;
  verified: boolean;
};

export type AddSentMessageHandler = (
  myPeerId: string,
  destination: string,
  content: string,
  id: string,
  verifiedStatus?: VerifiedStatus
) => void;

export type Transaction = {
  currency: string;
  amount: string;
  recipient: string;
};

export type ReceiveMessageHandler = (
  from: string,
  content: string,
  verifiedStatus?: VerifiedStatus
) => void;

export const dev = 'Dev';
export const welcome = 'Welcome';
export const bots = [dev, welcome];

const useAppState = () => {
  const urlParams = !isSSR ? getUrlParams() : {};
  const [state, setState] = useImmer<State>({
    settings: {
      httpEndpoint: urlParams.httpEndpoint || DEFAULT_SETTINGS.httpEndpoint,
      wsEndpoint: urlParams.httpEndpoint || DEFAULT_SETTINGS.wsEndpoint,
      securityToken: urlParams.securityToken,
    },
    verified: false,
    conversations: new Map([]),
    /*
      16Uiu2HAm6phtqkmGb4dMVy1vsmGcZS1VejwF4YsEFqtJjQMjxvHs
      16Uiu2HAm83TSuRSCN8mKaZbCekkx3zfqgniPSxHdeUSeyEkdwvTs
    */
  });

  const updateSettings = (settings: Partial<Settings>) => {
    setState((draft) => {
      for (const [k, v] of Object.entries(settings)) {
        (draft.settings as any)[k] = v;
      }
      return draft;
    });
  };

  const setSelection = (selection: string) => {
    setState((draft) => {
      draft.selection = selection;
      return draft;
    });
  };

  const setVerified = (verified: boolean) => {
    setState(draft => {
      draft.verified = verified;
      return draft;
    })
  }

  const addSentMessage = (
    myPeerId: string,
    destination: string,
    content: string,
    id: string,
    verifiedStatus?: VerifiedStatus
  ) => {
    setState((draft) => {
      const messages = draft.conversations.get(destination) || new Map<string, Message>();

      draft.conversations.set(
        destination,
        messages.set(id, {
          id,
          isIncoming: false,
          content: content,
          status: "UNKNOWN",
          createdBy: myPeerId,
          createdAt: +new Date(),
          verifiedStatus,
        })
      );

      return draft;
    });
  };

  const addReceivedMessage = (from: string, content: string, verifiedStatus?: VerifiedStatus, hasHTML = false) => {
    setState((draft) => {
      const messages = draft.conversations.get(from) || new Map<string, Message>();
      const id = genId();

      draft.conversations.set(
        from,
        messages.set(id, {
          id: genId(),
          isIncoming: true,
          content: content,
          status: "SUCCESS",
          createdBy: from,
          createdAt: +new Date(),
          verifiedStatus,
          hasHTML
        })
      );

      return draft;
    });
  };

  const updateMessage = (
    counterparty: string,
    messageId: string,
    status: Message["status"],
    error?: string
  ) => {
    setState((draft) => {
      const conversations = draft.conversations.get(counterparty);
      if (!conversations) return draft;
      const message = conversations.get(messageId);
      if (!message) return draft;

      message.status = status;
      message.error = error;

      conversations.set(messageId, message);
      return draft;
    });
  };

  const handleSendMessage = (addSentMessage: AddSentMessageHandler) => (myPeerId: string | undefined, socketRef: MutableRefObject<WebSocket | undefined>, headers: Headers) => async (destination: string, message: string) => {
    const { selection, settings, verified } = state;
    if (bots.includes(destination)) return addSentMessage('', destination, message, genId());
    if (!myPeerId || !selection || !socketRef.current) return;
    const signature = verified && await signRequest(settings.httpEndpoint, headers)(message)
      .catch((err: any) => console.error('ERROR Failed to obtain signature', err));
    const encodedMessage = encodeMessage(myPeerId, message, signature);
    const id = genId();
    addSentMessage(myPeerId, destination, message, id);
    await sendMessage(settings.httpEndpoint, headers)(selection, encodedMessage, destination, id, updateMessage)
      .catch((err: any) => console.error('ERROR Failed to send message', err));
  };

  const handleReceivedMessage =
    (addReceivedMessage: ReceiveMessageHandler) =>
    async (ev: MessageEvent<string>) => {
      try {
        // we are only interested in messages, not all the other events coming in on the socket
        const msg = utils.RLP.decode(
          new Uint8Array(JSON.parse(`[${ev.data}]`))
        );
        const { tag, from, message, signature } = decodeMessage(
          utils.toUtf8String(msg[0])
        );

        const verifiedStatus: VerifiedStatus = signature
          ? // Messages are pre-pended with the padding to avoid generic signatures.
            (await verifySignatureFromPeerId(
              from,
              `HOPR Signed Message: ${message}`,
              signature
            ))
            ? "VERIFIED"
            : "FAILED_VERIFICATION"
          : "UNVERIFIED";

        // we are only interested in myne messages
        if (tag == "myne") {
          addReceivedMessage(from, message, verifiedStatus);
        }
      } catch (err) {
        console.info("Error decoding message", err);
      }
    };


  return {
    state: {
      ...state,
    },
    addSentMessage,
    addReceivedMessage,
    updateSettings,
    setSelection,
    setVerified,
    handleSendMessage,
    handleReceivedMessage,
    updateMessage
  };
};

export default useAppState;