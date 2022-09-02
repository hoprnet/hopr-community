function generateHeaders (apiToken, isPost = false) {
    const headers = new Headers();
    if (isPost) {
        headers.set("Content-Type", "application/json");
        headers.set("Accept-Content", "application/json");
    }
    headers.set("Authorization", "Basic " + btoa(apiToken));
    return headers;
};

export async function getPeerId (apiEndpoint, apiToken) {
  let address;
  const response = await fetch(`${apiEndpoint}/api/v2/account/addresses`, {
    headers: generateHeaders(apiToken)
  }).then((res) => res.json())
    .catch((err) => console.error(err));
  address = response?.hoprAddress;
  console.log('getPeerId', address)
  return address;
};

export async function sendMessage (apiEndpoint, apiToken, recipientPeerId, message) {
  await fetch(`${apiEndpoint}/api/v2/messages`, {
    method: "POST",
    headers: generateHeaders(apiToken, true),
    body: JSON.stringify({
      recipient: recipientPeerId,
      body: message
    })
  }).catch((err) => console.error(err));
};