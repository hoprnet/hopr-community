import { NetworkError } from '../errors.js';
import config from '../config/config.js';
import { getHeaders } from './getHeaders.js';

function hoprNodeHttpUrl() {
    let url = config.restURL;

    if(url && url.length > 1) {
        if(url[url.length - 1] == '/')
            url = url.substring(0, url.length - 1);
        return url;
    } else return false;
}

function callAPI(path, body) {
    const hopr_node_http_url = hoprNodeHttpUrl();
    const authToken = config.authToken;

    let method = 'GET';
    if(body)
        method = 'POST';

    const headers = getHeaders(authToken, method == 'POST');

    const fetchConfig = {
        headers,
        method,
        ...body && {body: JSON.stringify(body)}
    };

    return fetch(`${hopr_node_http_url}/api/v2/${path}`, fetchConfig)
        .then(res => {
            return res.json()
                .catch(e => {
                    return {};
                })
                .then(jsonRes => {
                    if(res.ok)
                        return jsonRes;
                    else {
                        if(res && typeof res == 'object')
                            return res;

                        let errorMessage = res.statusText;

                        if(jsonRes.error)
                            errorMessage += " - " + jsonRes.error;
                        else
                            console.error(jsonRes);

                        throw new NetworkError(errorMessage);
                    }
                });
        })
}

export function getAddress() {
    if(hoprNodeHttpUrl()) {
        return callAPI('account/addresses')
            .then(res => {
                return res.hoprAddress;
            });
    }
    else return Promise.resolve(null);
}

export function establishChannel(hoprAddr, amount='1000000000000000000') {
    const body = {
        peerId: hoprAddr,
        amount
    }

    return callAPI('channels', body)
        .catch(e => {
            if(e.status)
                throw e.status;
            else {
                throw e;
            }
        });
}

export function getChannel(hoprAddr, direction='incoming') {
    if(!hoprAddr || !/^16Uiu/.test(hoprAddr))
        return Promise.reject(new Error("Please supply peer id"));

    return callAPI('channels/' + hoprAddr + '/' + direction)
        .then(res => {
            // console.log("channesl:", res);
            return res;
        });
}

export function getChannels(direction='outgoing') {
    return callAPI('channels')
}

export function sendHoprMessage(hoprAddr, message, path) {
    if(!path)
        path = [];

    try {
        message = JSON.stringify(message);
    } catch(e) {
        console.log("cannot stringify message");
    }

    if(hoprNodeHttpUrl()) {
        const body = {
            recipient: hoprAddr,
            body: message,
            path,
        };
        return callAPI('messages', body)
            .then(res => {
                console.log("send hopr message", res);
                return res;
            });
    } else return Promise.reject("Node url not set. Update config");
}
