export const getHeaders = (isPost = false, securityToken: string) => {
  const headers = new Headers();
  if (isPost) {
    headers.set("Content-Type", "application/json");
    headers.set("Accept-Content", "application/json");
  }
  headers.set("Authorization", "Basic " + btoa(securityToken));
  return headers;
};

export const sendMessage = (endpoint: string, headers: Headers) =>
  async (recipient: string, body: string) => {
    return fetch(`${endpoint}/api/v2/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        recipient,
        body,
      }),
    })
  };