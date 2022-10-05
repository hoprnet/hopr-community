/*
  A react hook.
  Keeps user state and balances updated whenever endpoint is changed.
*/
import type { Settings } from "./index";
import { useEffect } from "react";
import { useImmer } from "use-immer";
import { isSSR } from "./index";
import { accountAddress } from "../lib/api";

export type UserState = {
  myPeerId?: string;
  error?: string;
}

const useUser = (settings: Settings) => {
  const [state, setState] = useImmer<UserState>({});

  // construct headers to be used in authenticated requests
  // when security token is present
  const getReqHeaders = (isPost: boolean = false) => {
    const headers = new Headers();
    if (isPost) {
      headers.set("Content-Type", "application/json");
      headers.set("Accept-Content", "application/json");
    }
    if (settings.apiToken) {
      headers.set("Authorization", "Basic " + btoa(settings.apiToken));
    }

    return headers;
  };

  // runs everytime "httpEndpoint" changes
  useEffect(() => {
    if (isSSR) return;
    console.info("Fetching user data..");
    const headers = getReqHeaders()
    accountAddress(settings.apiEndpoint, headers)(setState);
  }, [settings?.apiEndpoint, settings?.apiToken]);

  return {
    state,
    getReqHeaders,
  };
};

export default useUser;