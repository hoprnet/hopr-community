import { Button, Popover } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSendMessageMutation } from '../../../store/peerSlice/peerApi';
import { setClearPeer, setMyStatus } from '../../../store/peerSlice/peerSlice';
import { gameStatus, setClearGame } from '../../../store/gameSlice/gameSlice';
import { CheckCircleOutlined } from '@ant-design/icons';

const GameInfo = ({ hoprAddress, nodeApi, setWinner }) => {
  const dispatch = useDispatch();
  const side = useSelector((state) => state?.game?.side);
  const turn = useSelector((state) => state?.game?.turn);
  const recipient = useSelector((state) => state.peer?.opponent?.address);
  const randNumber = useSelector((state) => state.peer?.randNumber);
  const oppRandNumber = useSelector(
    (state) => state.peer?.opponent?.randNumber,
  );

  const [sendMessage] = useSendMessageMutation();

  const handleQuit = () => {
    sendMessage({
      nodeApi,
      recipient,
      body: `quit-${randNumber}-${hoprAddress}`,
    });

    dispatch(setClearGame());
    dispatch(setClearPeer());
    setWinner('');
  };

  const popContent = (
    <div>
      <p>Your Number: {randNumber}</p>
      <p>Opponent Number: {oppRandNumber}</p>
      <p>
        {randNumber >= oppRandNumber
          ? `${randNumber} > ${oppRandNumber}`
          : `${randNumber} < ${oppRandNumber}`}
      </p>
    </div>
  );

  return (
    <div className='game__info'>
      <h2 style={{ color: 'var(--second-bg)' }}>Game Info</h2>
      <h3>
        Player Turn:{' '}
        {turn === 'you' ? 'You' : turn === 'turn' ? 'You' : 'Opponent'}
      </h3>
      <h3>
        Your Side: {side}
        <Popover content={popContent}>
          <CheckCircleOutlined className='checked' />
        </Popover>
      </h3>
      <Button key='submit' type='primary' onClick={() => handleQuit()}>
        Quit the game
      </Button>
    </div>
  );
};

export default GameInfo;
