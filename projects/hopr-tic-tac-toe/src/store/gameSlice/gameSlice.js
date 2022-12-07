import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: null,
    side: null,
    turn: null,
    winner: null,
    draw: null
}

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        gameStatus: (state, action) => {
            state.status = action.payload
        },
        setSide: (state, action) => {
            state.side = action.payload
        },
        gameTurn: (state, action) => {
            state.turn = action.payload
        },
        setMove: (state, action) => {
            state.move = action.payload
        },
        setWinner: (state, action) => {
            state.winner = action.payload
        },
        setDraw: (state, action) => {
            state.draw = action.payload
        },
        setClearGame: (state, action) => {
            state.status = null
            state.side = null
            state.turn = null
            state.winner = null
            state.draw = null
        }
    }
})
export const {gameStatus, gameTurn, setMove, setSide, setWinner, setClearGame, setDraw} = gameSlice.actions