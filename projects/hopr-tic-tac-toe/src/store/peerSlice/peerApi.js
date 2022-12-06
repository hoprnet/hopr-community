import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import { Buffer } from "buffer"
import { getParam } from "../../utils/urlParams"

export const peerApi = createApi({
    reducerPath: 'peerApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://',
        prepareHeaders: (headers, { getState }) => {
            const token = (getParam(getState().router.location, 'apiToken')) ? (getParam(getState().router.location, 'apiToken')) : getState().peer.securityToken
            if(token){
                headers.set('Authorization', 'Basic ' + Buffer.from(token).toString('base64'))
            }
            return headers
        }
    }),
    endpoints: (builder) => ({
        getPeerInfo: builder.query({
            query: ({nodeApi}) => ({
                url: `${nodeApi}/api/v2/account/addresses`,
            }),
        }),
        sendMessage: builder.mutation({
            query: ({nodeApi, recipient, body}) => ({
                url: `${nodeApi}/api/v2/messages`,
                method: 'POST',
                body: JSON.stringify({
                    body,
                    recipient
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Content': 'application/json',
                },
            })
        })
       
    })
})

export const {useGetPeerInfoQuery, useSendMessageMutation} = peerApi;