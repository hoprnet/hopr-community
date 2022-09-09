import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'state/store';

import { generateGrid, getUpdatedState } from 'lib/utils';

export enum Side {
  None = 0,
  First = 1,
  Second = 2
}

export interface GameState {
  side: Side,
  grid: any,
  scores: number[],
  currentPlayer: number,
  rows: number,
  columns: number,
  isGameComplete: boolean,
}

const initialState: GameState = {
  rows: 3,
  columns: 3,
  side: Side.None,
  grid: null,
  scores: [0, 0],
  currentPlayer: -1,
  isGameComplete: false,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    newGame: (state, action: PayloadAction<{ rows: number, columns: number }>) => {
      const grid = generateGrid(action.payload.rows, action.payload.columns)
      state.rows = action.payload.rows
      state.columns = action.payload.columns
      state.grid = grid
      state.currentPlayer = 1
    },
    resetGame: (state) => {
      state.grid = null
      state.currentPlayer = -1
      state.side = Side.None
      state.scores = [0, 0]
    },
    doMove: (state, action: PayloadAction<{ row: number, column: number, type: string }>) => {
      const { currentPlayer, grid, scores, isGameComplete } = getUpdatedState(state, action)

      state.grid = grid
      state.scores = scores
      state.currentPlayer = currentPlayer
      state.isGameComplete = isGameComplete
    },
    setSide: (state, action: PayloadAction<Side>) => {
      state.side = action.payload
    }
    // undo: (state) => {},
    // reset: (state) => {}
  },
});

export const { newGame, doMove, resetGame } = gameSlice.actions;

export const selectScores = (state: RootState) => state.game.scores
export const selectGrid = (state: RootState) => state.game.grid
export const selectDim = (state: RootState) => ({ rows: state.game.rows, columns: state.game.columns })
export const selectSide = (state: RootState) => state.game.side;
export const selectCurrentPlayer = (state: RootState) => state.game.currentPlayer
export const selectGameComplete = (state: RootState) => state.game.isGameComplete
// export const selectMoveSquares = (state: RootState) => state.game.moveSquares

export default gameSlice.reducer;
