import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  gameStatus,
  gameTurn,
  setClearGame,
  setSide,
  setDraw,
} from '../../store/gameSlice/gameSlice';
import {
  setClearPeer,
  setOpponent,
  setOpponentNumber,
} from '../../store/peerSlice/peerSlice';
import Board from '../game/board/Board';
import { SettingOutlined } from '@ant-design/icons';
import './GameLogic.css';
import GameInfo from '../game/gameInfo/GameInfo';
import { setWinner } from '../../store/gameSlice/gameSlice';

const GameLogic = ({ nodeApi, messages, hoprAddress }) => {
  const dispatch = useDispatch();

  const myStatus = useSelector((state) => state?.peer?.status);
  const gamestatus = useSelector((state) => state?.game?.status);
  const myNumber = useSelector((state) => state?.peer?.randNumber);
  const recipient = useSelector((state) => state?.peer?.opponent?.address);
  const mySide = useSelector((state) => state?.game?.side);
  const winner = useSelector((state) => state?.game?.winner);
  const draw = useSelector((state) => state.game?.draw);

  let gameMove = {};

  const lastMessage = messages.slice(-1).map((move) => ({
    move: move.split('-')[0],
    msg: move.split('-')[1],
    sender: move.split('-')[2],
  }));

  if (
    (lastMessage[0]?.move === 'X' || lastMessage[0]?.move === 'O') &&
    lastMessage[0]?.msg >= 0 &&
    lastMessage[0]?.msg <= 8
  ) {
    gameMove = { value: lastMessage[0].move, index: lastMessage[0].msg };
    dispatch(gameTurn('you'));
  }

  if (lastMessage[0]?.move === 'quit') {
    dispatch(setClearGame());
    dispatch(setClearPeer());
  }
  if (lastMessage[0]?.move === 'draw') {
    dispatch(setDraw(true));
  }

  if (
    (myStatus === 'invite' && lastMessage[0]?.move === 'connected') ||
    (myStatus === 'connected' && lastMessage[0]?.move === 'invite')
  ) {
    dispatch(setDraw(null));
    dispatch(setOpponentNumber(lastMessage[0]?.msg));
    dispatch(setOpponent(lastMessage[0]?.sender));
    if (Number(myNumber) >= Number(lastMessage[0]?.msg)) {
      dispatch(setSide('X'));
      dispatch(gameTurn('you'));
    } else {
      dispatch(setSide('O'));
      dispatch(gameTurn('opponent'));
    }
    dispatch(gameStatus('playing'));
  }

  return (
    <div className='main'>
      {gamestatus === 'playing' ? (
        <div className='game wrapper'>
          <GameInfo
            hoprAddress={hoprAddress}
            nodeApi={nodeApi}
            setWinner={setWinner}
          />
          <Board
            gameMove={gameMove}
            nodeApi={nodeApi}
            recipient={recipient}
            setWinner={setWinner}
            hoprAddress={hoprAddress}
          />
          <div className='game__info game__result'>
            {winner && winner === mySide ? (
              <>
                <h2 className='win__text'>
                  Congratulations! <br /> You won
                </h2>
                <h3>The winner is {winner}</h3>
              </>
            ) : winner && winner !== mySide ? (
              <>
                <h2 className='lose__text'>You Lost :(</h2>
                <h3>The winner is {winner}</h3>
              </>
            ) : draw ? (
              <>
                <h2 className='draw__text'>
                  The Game Ended <br /> In A Draw
                </h2>
              </>
            ) : (
              <p></p>
            )}
          </div>
        </div>
      ) : (
        <div className='game wrapper'>
          <div className='hello__player'>
            <p>
              1) Set Your Node Settings in{' '}
              <SettingOutlined style={{ fontSize: '16px' }} />{' '}
            </p>
            <p>
              2) Create Game or Connect to the Game by entering an opponent's
              address{' '}
            </p>
            <p>
              3) The side for which you will play (X or O) is chosen randomly.
              <br />
              When both players connect, they are given a randomly generated
              number. <br />
              The player whose number is greater than the opponent's number goes
              first (side X).
            </p>
            <h2>Good Luck :)</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLogic;
