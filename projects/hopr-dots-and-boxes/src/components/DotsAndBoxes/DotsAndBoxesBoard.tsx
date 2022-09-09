import React, { useEffect } from 'react';
import Score from './Score';
import Grid from './Grid';
import Constants from './constants';

// import { generateGrid, restartGame } from '../actions';
import { doMove, selectSide, Side, selectGrid, selectScores, selectDim, selectCurrentPlayer, resetGame, selectGameComplete } from 'state/slices/gameSlice/gameSlice';
import { useAppDispatch, useAppSelector } from 'app/hooks';

import './styles/DotsAndBoxesBoard.style.css';
import { Typography } from '@mui/material';

const { PRIMARY_FONT_COLOR, SECONDARY_FONT_COLOR } = Constants.colors;

function DotsAndBoxesBoard({
    boardWidth
}: {
    boardWidth: number
}) {
    const grid = useAppSelector(selectGrid)
    const { rows } = useAppSelector(selectDim)
    const scores = useAppSelector(selectScores)
    const currentPlayer = useAppSelector(selectCurrentPlayer)
    const side = useAppSelector(selectSide)
    const isGameComplete = useAppSelector(selectGameComplete)

    const dispatch = useAppDispatch()

    // useEffect(
    // 	() => {
    // 		dispatch(generateGrid());
    // 	},
    // 	[rows, columns]
    // );
    return (
        <div className="main-screen" style={{ width: '500px' }}>
            <div className="main-screen__scores">
                <Score active={currentPlayer === Side.First} title={side === Side.First ? "You" : "Opponent"} color={PRIMARY_FONT_COLOR} value={scores[0]} />
                <Score active={currentPlayer === Side.Second} title={side === Side.Second ? "You" : "Opponent"} color={SECONDARY_FONT_COLOR} value={scores[1]} />
            </div>
            <div className="main-screen__grid">
                <Grid rows={rows} grid={grid} />
            </div>
            <div className="main-screen__note">
                {(!isGameComplete && currentPlayer === side) && <Typography>Your move</Typography>}
                {isGameComplete && <div>
                    {scores[0] === scores[1] && <Typography>TIE</Typography>}
                    {((scores[0] > scores[1] && side === Side.First)
                    || (scores[0] < scores[1] && side === Side.Second)) && <Typography textAlign={"center"}>🎉 YOU WON</Typography>}
                    <Typography
                        onClick={() => {
                            dispatch(resetGame());
                        }}
                        className="main-screen__note__link"
                    >
                        Go to Main Menu.
                    </Typography>
                </div>}
            </div>
        </div>
    );
}

export default DotsAndBoxesBoard;
