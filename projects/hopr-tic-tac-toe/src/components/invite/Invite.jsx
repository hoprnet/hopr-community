import { Button, Modal } from 'antd';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSendMessageMutation } from '../../store/peerSlice/peerApi';
import { gameStatus, setClearGame } from '../../store/gameSlice/gameSlice';
import {
  setMyStatus,
  setMyNumber,
  setClearPeer,
} from '../../store/peerSlice/peerSlice';
import { getRandom } from '../../utils/getRandom';

const Invite = ({
  messages,
  hoprAddress,
  nodeApi,
  isNewMessage,
  setIsNewMessage,
}) => {
  const dispatch = useDispatch();
  if (isNewMessage) console.log(isNewMessage);
  let sender = '';
  const lastMessage = messages.slice(-1).map((msg) => ({
    move: msg.split('-')[0],
    msg: msg.split('-')[1],
    sender: msg.split('-')[2],
  }));

  if (lastMessage[0]?.move === 'invite') {
    sender = lastMessage[0]?.sender;
  }

  const [sendMessage] = useSendMessageMutation();

  const handleConnect = () => {
    dispatch(setClearPeer());
    dispatch(setClearGame());
    const randNumber = getRandom(1500);
    sendMessage({
      nodeApi,
      recipient: sender,
      body: `connected-${randNumber}-${hoprAddress}`,
    });
    dispatch(gameStatus('connecting'));
    dispatch(setMyStatus('connected'));
    dispatch(setMyNumber(randNumber));
    setIsNewMessage(false);
  };

  return (
    <Modal
      visible={isNewMessage}
      title='You are invited to play a game!'
      onCancel={() => setIsNewMessage(false)}
      footer={
        lastMessage[0]?.sender ? (
          <Button key='submit' type='primary' onClick={() => handleConnect()}>
            Accept
          </Button>
        ) : (
          <Button
            key='submit'
            type='primary'
            onClick={() => setIsNewMessage(false)}>
            OK
          </Button>
        )
      }>
      {lastMessage[0]?.sender
        ? `${sender} invites you to play!`
        : 'You will see this window if you receive an invite to play'}
    </Modal>
  );
};

export default Invite;
