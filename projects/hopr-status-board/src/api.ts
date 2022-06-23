type GenericResponse = any;

const nonJsonApi = async (
  baseUrl: string,
  headers: Headers,
  endpoint: string,
  jsonCatchResponse: Promise<any>
) =>
  (await (
    await fetch(`${baseUrl}${endpoint}`, {
      headers,
    }).catch((err) => ({
      json: () => jsonCatchResponse,
    }))
  ).json()) as GenericResponse;

const api = async (
  baseUrl: string,
  headers: Headers,
  endpoint: string,
  jsonCatchResponse: Promise<any>,
  keyValue: string
) =>
  (await nonJsonApi(baseUrl, headers, endpoint, jsonCatchResponse))[keyValue];

export const getBalance =
  (baseUrl: string, headers: Headers) => (balanceType: string) =>
    api(
      baseUrl,
      headers,
      '/api/v2/account/balances',
      Promise.resolve({ [balanceType]: '' }),
      balanceType
    );

export const getAddress =
  (baseUrl: string, headers: Headers) => (addressType: string) =>
    api(
      baseUrl,
      headers,
      '/api/v2/account/addresses',
      Promise.resolve({ [addressType]: '' }),
      addressType
    );

export const getHoprAddress = (baseUrl: string, headers: Headers) =>
  getAddress(baseUrl, headers)('hopr');

export const getNativeAddress = (baseUrl: string, headers: Headers) =>
  getAddress(baseUrl, headers)('native');

export const getHoprBalance = (baseUrl: string, headers: Headers) =>
  getBalance(baseUrl, headers)('hopr');

export const getNativeBalance = (baseUrl: string, headers: Headers) =>
  getBalance(baseUrl, headers)('native');

export const getChannels = (baseUrl: string, headers: Headers) =>
  nonJsonApi(baseUrl, headers, '/api/v2/channels', Promise.resolve({}));

export const getInfo = (baseUrl: string, headers: Headers) =>
  nonJsonApi(baseUrl, headers, '/api/v2/node/info', Promise.resolve({}));

export const getUptime = async (baseUrl: string, headers: Headers) => {
  const start = performance.now();
  const version = await (
    await nonJsonApi(baseUrl, headers, '/api/v2/node/version', Promise.resolve(0))
  );  
  const end = performance.now();
  return version ? end - start : 0;
};

export const getTickets = (baseUrl: string, headers: Headers) =>
  nonJsonApi(
    baseUrl,
    headers,
    '/api/v2/tickets/statistics',
    Promise.resolve({})
  );

export const getVersion = (baseUrl: string, headers: Headers) =>
  nonJsonApi(baseUrl, headers, '/api/v2/node/version', Promise.resolve(''));
