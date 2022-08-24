import { DraftFunction } from "use-immer";
import { UpdateMessageHandlerInterface , Transaction} from "../state";
import { UserState, HoprBalances } from "../state/user";

export const signRequest = (endpoint: string, headers: Headers) =>
  async (encodedSignMessageRequest: string) => {
    return fetch(`${endpoint}/api/v2/message/sign`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: encodedSignMessageRequest,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.info("Returned response", data.signature)
        return data.signature;
      })
      .catch((err) => {
        console.error("ERROR requesting signature message", err);
        return String(err);
      });
  };
export const sendTransaction = (endpoint: string, headers: Headers) =>
  async (transaction: Transaction) => {
    return fetch(`${endpoint}/api/v2/account/withdraw`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        currency: transaction.currency,
        amount: transaction.amount,
        recipient: transaction.recipient,}),
    })
      .then( async (res) => {
        if(res.status === 200) return "SUCCESS";
        if(res.status === 400) return "FAILURE";
        const err = 'Unknown response status.'
        console.error("ERROR sending transaction", err);
        return String(err);
      })
      .catch((err) => {
        console.error("ERROR sending transaction", err);
        return String(err);
      });
  };
export const sendMessage = (endpoint: string, headers: Headers) =>
  async (recipient: string, body: string, destination: string, id: string, updateMessage: UpdateMessageHandlerInterface) => {
    return fetch(`${endpoint}/api/v2/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        recipient,
        body,
      }),
    })
      .then(async (res) => {
        if (res.status === 204) return updateMessage(destination, id, "SUCCESS");
        if (res.status === 422) return updateMessage(destination, id, "FAILURE", (await res.json()).error)
        // If we didn't get a supported status response code, we return unknown
        const err = 'Unknown response status.'
        console.error("ERROR sending message", err);
        return updateMessage(destination, id, "UNKNOWN", err)
      })
      .catch((err) => {
        console.error("ERROR sending message", err);
        updateMessage(destination, id, "FAILURE", String(err));
      });
  };
export const accountAddress = (endpoint: string, headers: Headers) =>
  (setPeerId: (draft: DraftFunction<UserState>) => void) => {
    return fetch(`${endpoint}/api/v2/account/address`, {
      headers,
    })
      .then((res) => res.json())
      .then((data) => {
        console.info("Fetched PeerId", data.hoprAddress);
        setPeerId((draft) => {
          draft.myPeerId = data.hoprAddress;
          return draft;
        });
      })
      .catch((err) => {
        console.error(err);
        setPeerId((draft) => {
          draft.myPeerId = undefined;
          draft.error = err;
          return draft;
        });
      });
  };
  export const hoprBalance = (endpoint: string, headers: Headers) => 
    (setBalance: (draft: DraftFunction<HoprBalances>) => void) => {
      return fetch(`${endpoint}/api/v2/account/balances`, {
        headers,
      })
        .then((res) => res.json())
        .then((data) => {
          console.info("Fetched hoprBalance", data.hopr);
          setBalance((draft) => {
            draft.hopr = data.hopr;
            return draft;          
        });
      })
        .catch((err) => {
          console.error(err);
          setBalance((draft) => {
            draft.hopr = undefined;
            draft.error = err;
            return draft;
        });
    });
  };

