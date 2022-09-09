import { createSlice, ThunkAction, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'state/store';
import { gameSlice, Side } from 'state/slices/gameSlice/gameSlice';
import { sha256 } from 'js-sha256'
import { getHeaders, sendMessage } from 'lib/utils'
import { Action } from 'redux'

import { handshake, answer, heartbeat, moveAction } from './peerAPI'
import { getParam } from 'lib/url';


export enum Status {
  Idle = 'idle',
  Waiting = 'waiting',
  Handshake = 'handshake',
  Answered = 'answered',
  Playing = 'playing',
}

export interface PeerState {
  host: boolean,
  options: any,
  num: number | null
  status: Status
  endpoint: string
  securityToken: string
  opponent: {
    address?: string,
    handshake?: string,
    answer?: number
  }
}

const initialState: PeerState = {
  host: false,
  options: {},
  num: null,
  status: Status.Idle,
  endpoint: 'http://localhost:13301',
  securityToken: '^^LOCAL-testing-123^^',
  opponent: {}
};

export const peerSlice = createSlice({
  name: 'peer',
  initialState,
  reducers: {
    setNumber: (state, action: PayloadAction<number>) => {
      state.num = action.payload
    },
    setSecurityToken: (state, action: PayloadAction<string>) => {
      state.securityToken = action.payload
    },
    // setEndpoint: (state, action: PayloadAction<string>) => {
    //   state.endpoint = action.payload
    // },
    setOpponent: (state, action: PayloadAction<string>) => {
      state.opponent.address = action.payload
      state.opponent.handshake = undefined
      state.opponent.answer = undefined
    },
    setHost: (state, action: PayloadAction<boolean>) => {
      state.host = action.payload
    },
    setOptions: (state, action: PayloadAction<any>) => {
      state.options = action.payload
    },
    inviteOpponent: (state) => {
      state.status = Status.Waiting
    },
    sendAnswer: (state) => {
      if (state.status === Status.Waiting || state.status === Status.Handshake) {
        state.status = Status.Answered
      }
    },
    sendHandshake: (state) => {
      if (state.status === Status.Waiting || state.status === Status.Handshake) {
        state.status = Status.Handshake
      }
    },
    receiveHandshake: (state, action: PayloadAction<string>) => {
      if (state.opponent.address && typeof state.opponent.handshake === 'undefined' && (state.status === Status.Waiting || state.status === Status.Handshake)) { // && state.opponent.address === from
        state.opponent.handshake = action.payload
      }
    },
    receiveAnswer: (state, action: PayloadAction<number>) => {
      if (typeof state.opponent.handshake !== 'undefined' &&
          state.status === Status.Answered && 
          sha256(action.payload.toString()) === state.opponent.handshake) {
        state.opponent.answer = action.payload
        state.status = Status.Playing
      }
    },
    // receiveHeartbeat: (state) => {

    // }
  },
});

export const receiveAnswer = (message: string): ThunkAction<void, RootState, unknown, Action<string>> => async (dispatch, getState) => {
  let state = getState() as RootState

  if (state.peer.status === Status.Handshake) {
    if (state.peer.opponent.address && state.peer.num) {
      const request = sendMessage(selectEndpoint(state), getHeaders(true, state.peer.securityToken))
      await request(state.peer.opponent.address, JSON.stringify(answer(state.peer.num)))
      dispatch(peerSlice.actions.sendAnswer())
    }
  }

  state = getState() as RootState

  dispatch(peerSlice.actions.receiveAnswer(parseInt(message)))

  state = getState() as RootState

  console.log(state.peer.num, state.peer.opponent.answer, state.peer.status)
  if (state.peer.num && state.peer.opponent.answer && state.peer.status === Status.Playing) {
    dispatch(gameSlice.actions.newGame(state.peer.options))

    const totalNumber = state.peer.num + state.peer.opponent.answer
    const side = totalNumber % 2
    if (side === 0) {
      dispatch(gameSlice.actions.setSide(state.peer.num > state.peer.opponent.answer ? Side.First : Side.Second))
    } else {
      dispatch(gameSlice.actions.setSide(state.peer.num > state.peer.opponent.answer ? Side.Second : Side.First))
    }
  }
}

export const startGame = (options: any): ThunkAction<void, RootState, unknown, Action<string>> => (dispatch, getState) => {
  dispatch(peerSlice.actions.setNumber(Math.floor(Math.random() * 1e15)))
  dispatch(peerSlice.actions.setHost(true))
  dispatch(peerSlice.actions.setOptions(options))
  dispatch(peerSlice.actions.inviteOpponent())
}

export const connectGame = (): ThunkAction<void, RootState, unknown, Action<string>> => (dispatch, getState) => {
  dispatch(peerSlice.actions.setNumber(Math.floor(Math.random() * 1e15)))
  dispatch(peerSlice.actions.inviteOpponent())
  dispatch(sendHandshake())
} 


export const receiveHandshake = (message: any): ThunkAction<void, RootState, unknown, Action<string>> => async (dispatch, getState) => {
  const state = getState() as RootState;

  const { hash, options = {} } = message

  if (state.peer.opponent.address && state.peer.num && state.peer.status === Status.Waiting) {
    const request = sendMessage(selectEndpoint(state), getHeaders(true, state.peer.securityToken))
    await request(state.peer.opponent.address, JSON.stringify(handshake(state.peer.num, state.peer.options)))
    
    dispatch(peerSlice.actions.sendHandshake())
  } else if (state.peer.opponent.address && state.peer.num && state.peer.status === Status.Handshake) {
    dispatch(sendAnswer())
    dispatch(peerSlice.actions.setOptions({ rows: options.rows || 3, columns: options.columns || 3 }))
  }
  dispatch(peerSlice.actions.receiveHandshake(hash))
}

export const sendAnswer = (): ThunkAction<void, RootState, unknown, Action<string>> => async (dispatch, getState) => {
  const state = getState() as RootState;
  
  if (state.peer.opponent.address && state.peer.num && state.peer.status === Status.Handshake) {
    const request = sendMessage(selectEndpoint(state), getHeaders(true, state.peer.securityToken))
    await request(state.peer.opponent.address, JSON.stringify(answer(state.peer.num)))
    dispatch(peerSlice.actions.sendAnswer())
  }
}

export const sendHandshake = (): ThunkAction<void, RootState, unknown, Action<string>> => async (dispatch, getState) => {
  const state = getState() as RootState;

  if (state.peer.opponent.address && state.peer.num && state.peer.status === Status.Waiting) {
    const request = sendMessage(selectEndpoint(state), getHeaders(true, state.peer.securityToken))
    await request(state.peer.opponent.address, JSON.stringify(handshake(state.peer.num)))
    dispatch(peerSlice.actions.sendHandshake())
  }
}

export const sendHeartbeat = (): ThunkAction<void, RootState, unknown, Action<string>> => async (dispatch, getState) => {
  const state = getState() as RootState;

  if (state.peer.opponent.address && state.peer.status === Status.Playing) {
    const request = sendMessage(selectEndpoint(state), getHeaders(true, state.peer.securityToken))
    await request(state.peer.opponent.address, JSON.stringify(heartbeat(state.game.grid)))
  }
}

export const sendMove = (move: { row: number, column: number, type: string }): ThunkAction<void, RootState, unknown, Action<string>> => async (dispatch, getState) => {
  const state = getState() as RootState;

  if (state.peer.opponent.address && state.peer.status === Status.Playing) {
    const request = sendMessage(selectEndpoint(state), getHeaders(true, state.peer.securityToken))
    await request(state.peer.opponent.address, JSON.stringify(moveAction(move.row, move.column, move.type)))
  }
}


export const { setNumber, inviteOpponent, setSecurityToken, setOpponent } = peerSlice.actions;

export const selectNumber = (state: RootState) => state.peer.num;
export const selectHashedNumber = (state: RootState) => state.peer.num == null ? '' : sha256(state.peer.num.toString())
export const selectStatus = (state: RootState) => state.peer.status
// export const selectSecurityToken = (state: RootState) => state.peer.securityToken
export const selectSecurityToken = (state: RootState) => state.router.location ? (getParam(state.router.location, 'securityToken') || '') : ''
export const selectEndpoint = (state: RootState) => state.router.location ? (getParam(state.router.location, 'apiEndpoint') || '') : ''
export const selectOpponent = (state: RootState) => state.peer.opponent.address || '' 
export const selectLocation = (state: RootState) => state.router.location

export default peerSlice.reducer;
