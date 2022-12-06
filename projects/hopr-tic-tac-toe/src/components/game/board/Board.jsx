import { Button } from 'antd';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  gameTurn,
  setClearGame,
  gameStatus,
  setDraw,
} from '../../../store/gameSlice/gameSlice';
import { useSendMessageMutation } from '../../../store/peerSlice/peerApi';
import {
  setSameOpponent,
  setMyStatus,
  setMyNumber,
} from '../../../store/peerSlice/peerSlice';
import { calculateWinner } from '../../../utils/calculateWinner';
import Square from '../square/Square';
import { getRandom } from '../../../utils/getRandom';

const Board = ({ gameMove, nodeApi, recipient, setWinner, hoprAddress }) => {
  const dispatch = useDispatch();

  const whichTurn = useSelector((state) => state?.game?.turn);
  const side = useSelector((state) => state?.game?.side);
  const [board, setBoard] = useState(Array(9).fill(''));
  const winner = calculateWinner(board);
  const gamestatus = useSelector((state) => state.game?.status);

  const [sendMessage] = useSendMessageMutation();

  useEffect(() => {
    if (winner && gamestatus !== 'ended') {
      dispatch(setWinner(winner));
    }
    if (whichTurn === 'you' && gamestatus !== 'ended') {
      const copyBoard = [...board];
      copyBoard.splice(gameMove.index, 1, gameMove.value);
      setBoard(copyBoard);
      dispatch(gameTurn('turn'));
    }
    if (!winner && !board.includes('')) {
      sendMessage({
        nodeApi,
        recipient,
        body: `draw-${999}-${hoprAddress}`,
      });
      dispatch(setDraw(true));
    }
  }, [whichTurn, winner]);

  const handleClick = (index) => {
    if (
      index < 0 ||
      index > 9 ||
      board[index] ||
      winner ||
      whichTurn === 'opponent'
    )
      return;
    sendMessage({
      nodeApi,
      recipient,
      body: `${side}-${index}-${hoprAddress}`,
    });
    dispatch(gameTurn('opponent'));
    const newBoard = [...board];
    newBoard.splice(index, 1, side);
    setBoard(newBoard);
  };

  const handleRestartSame = () => {
    const randNumber = getRandom(500);
    dispatch(setClearGame());
    dispatch(setSameOpponent());
    sendMessage({
      nodeApi,
      recipient,
      body: `invite-${randNumber}-${hoprAddress}`,
    });
    dispatch(gameStatus('connecting'));
    dispatch(setMyStatus('invite'));
    dispatch(setMyNumber(randNumber));
  };

  return (
    <div className='field'>
      <div className='board'>
        {board.map((value, index) => (
          <Square
            key={index}
            index={index}
            value={value}
            handleClick={handleClick}
          />
        ))}
      </div>
      <div className='board_new_game'>
        <Button
          className='new_btn'
          type='primary'
          onClick={() => handleRestartSame()}>
          Start New Game With The Same Opponent
        </Button>
      </div>
    </div>
  );
};

export default Board;
