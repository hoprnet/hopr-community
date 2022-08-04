import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'state/store';

import { Chess } from 'chess.js'
import { Square } from 'react-chessboard';

export enum Side {
  None = 'n',
  Black = 'b',
  White = 'w'
}

export interface ChessState {
  position: string,
  side: Side,
  // moveSquares: string
}

const initialState: ChessState = {
  position: '',
  side: Side.None
};

export const chessSlice = createSlice({
  name: 'chess',
  initialState,
  reducers: {
    newGame: (state) => {
      const gameInstance = new Chess()
      state.position = gameInstance.fen()
      console.log('newgame', state.position)
    },
    doMove: (state, action: PayloadAction<{ from: Square, to: Square }>) => {
      const gameInstance = new Chess(state.position)
      const move = gameInstance.move({
          from: action.payload.from,
          to: action.payload.to,
          promotion: 'q' // always promote to a queen for example simplicity
      });
      if (move === null) return

      state.position = gameInstance.fen()
    },
    setSide: (state, action: PayloadAction<Side>) => {
      state.side = action.payload
    }
    // undo: (state) => {},
    // reset: (state) => {}
  },
});

export const { newGame, doMove } = chessSlice.actions;

export const selectPosition = (state: RootState) => state.chess.position;
export const selectSide = (state: RootState) => state.chess.side;
// export const selectMoveSquares = (state: RootState) => state.chess.moveSquares

export default chessSlice.reducer;
