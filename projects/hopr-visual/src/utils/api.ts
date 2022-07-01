/**
 * True if instance is running on server
 */
export const isSSR: boolean = typeof window === "undefined";

/**
 * Connectivity settings
 */
export type Settings = {
  apiEndpoint?: string;
  apiToken?: string;
  mode: "api" | "subgraph";
};

/**
 * Inspects the url to find valid settings.
 * @returns settings found in url query
 */
export const getUrlParams = (loc: Location): Settings => {
  const params = new URLSearchParams(loc.search);
  return {
    apiEndpoint: params.get("apiEndpoint") || undefined,
    apiToken: params.get("apiToken") || undefined,
    mode: (params.get("mode") as Settings["mode"]) || "subgraph",
  };
};
