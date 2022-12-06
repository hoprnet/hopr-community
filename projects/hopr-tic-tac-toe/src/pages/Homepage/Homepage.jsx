import React, { useState, useEffect } from 'react';
import WebSocketHandler from '../../components/webSocket/WebSocketHandler';
import Header from '../../components/header/Header';
import { useGetPeerInfoQuery } from '../../store/peerSlice/peerApi';
import GameLogic from '../../components/gameLogic/GameLogic';
import { useDispatch, useSelector } from 'react-redux';
import { setParam, getParam } from '../../utils/urlParams';
import { push } from 'redux-first-history';
import {
  selectNodeApi,
  selectSecurityToken,
  setHoprAddress,
  setNodeApi,
  setSecurityToken,
} from '../../store/peerSlice/peerSlice';
import Invite from '../../components/invite/Invite';

const Homepage = () => {
  const dispatch = useDispatch();

  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isGameModalVisible, setIsGameModalVisible] = useState(false);
  const [isConnectModalVisible, setIsConnectModalVisible] = useState(false);
  const [clear, setClear] = useState(false);
  const location = useSelector((state) => state.router.location);
  const nodeApi = useSelector(selectNodeApi);
  const securityToken = useSelector(selectSecurityToken);
  const [skipPeerInfo, setSkipPeerInfo] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isNewMessage, setIsNewMessage] = useState(false);

  const {
    data: peer,
    isLoading: peerLoading,
    isError: peerError,
    isSuccess: peerSuccess,
    error,
  } = useGetPeerInfoQuery({ nodeApi }, { skip: skipPeerInfo });

  useEffect(() => {
    if (!location) return;

    const newLocation = { ...location };

    if (!getParam(newLocation, 'apiEndpoint')) {
      newLocation.search = setParam(
        newLocation,
        'apiEndpoint',
        'http://localhost:13301',
      );
    }
    if (getParam(newLocation, 'apiToken')) {
      setSkipPeerInfo(false);
    }
    if (newLocation.search !== location.search) {
      dispatch(push(newLocation.pathname + newLocation.search));
    }
    dispatch(setSecurityToken(securityToken));
    dispatch(setNodeApi(nodeApi));
  }, []);

  return (
    <div className='tic-tac-toe'>
      <Header
        isSettingsModalVisible={isSettingsModalVisible}
        setIsSettingsModalVisible={setIsSettingsModalVisible}
        isGameModalVisible={isGameModalVisible}
        setIsGameModalVisible={setIsGameModalVisible}
        isConnectModalVisible={isConnectModalVisible}
        setIsConnectModalVisible={setIsConnectModalVisible}
        clear={clear}
        setClear={setClear}
        nodeApi={nodeApi}
        setSkipPeerInfo={setSkipPeerInfo}
        securityToken={securityToken}
        hoprAddress={peer?.hoprAddress ? peer.hoprAddress : ''}
        peerError={peerError}
        peerSuccess={peerSuccess}
        peerLoading={peerLoading}
      />

      <GameLogic
        nodeApi={nodeApi}
        messages={messages}
        hoprAddress={peer?.hoprAddress}
      />

      <Invite
        messages={messages}
        hoprAddress={peer?.hoprAddress}
        nodeApi={nodeApi}
        isNewMessage={isNewMessage}
        setIsNewMessage={setIsNewMessage}
      />

      {securityToken && nodeApi && (
        <WebSocketHandler
          wsEndpoint={`${nodeApi}/api/v2/messages/websocket`}
          securityToken={securityToken}
          setMessages={setMessages}
          setIsNewMessage={setIsNewMessage}
        />
      )}
    </div>
  );
};

export default Homepage;
