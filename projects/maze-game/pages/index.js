import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import Board from '../components/board'
import WinOverlay from '../components/win-overlay'
import ReactLogo from '../components/hopr-logo/hopr-icon.svg';
import LobbyOverlay from '../components/lobby-overlay'

import WebSockerHandler from '../functions/WebSocketHandler'
import { getPeerId, sendMessage } from '../functions/hopr-sdk'

export default function Home() {  
  const router = useRouter();
  
  const [win, setWin] = useState(null);
  const [lobby, set_lobby] = useState(true);
  const [lobbyId, set_lobbyId] = useState(null);
  const childFunc = React.useRef(null);
  const hopr = React.useRef({apiToken: null, apiEndpoint: null, peerId: null, environment: null});

  const [peerId, set_peerId] = useState(null);
  const [environment, set_environment] = useState(null);
  const [players, set_players] = useState([]);
  const [map, set_map] = useState(false);

  const [gotHoprAPI, set_gotHoprAPI] = useState(false);

  const [remotePos1, set_remotePos1] = useState([0,1]);
  const [remotePos2, set_remotePos2] = useState([0,1]);
  const [remotePos3, set_remotePos3] = useState([0,1]);

  //DEV
  // useEffect(()=>{
  //   hopr.current.apiToken = 'apiToken-null';
  //   hopr.current.apiEndpoint = 'apiEndpoint-null';
  //   hopr.current.peerId = 'peerId-null';
  //   set_gotHoprAPI(true);
  // }, []);

  useEffect(()=>{
    console.log('players', players)
  }, [players]);

  useEffect(()=>{
    if(!router.isReady) return;
    console.log('router ready:', router)
    hopr.current.apiToken = router.query.apiToken;
    hopr.current.apiEndpoint = router.query.apiEndpoint;
    set_gotHoprAPI(true);
  }, [router.isReady]);

  const resetGame = () => {
    // setWin(null);
    // childFunc.current()
  }

  function playerNewPosition (input) {
    //sendMessage (apiEndpoint, apiToken, recipientPeerId, message)
    console.log('Index: playerNewPosition', input, hopr.current.apiEndpoint, hopr.current.apiToken, hopr.current.peerId);
    console.log('Index: players', players);
    let message = {
 //     from: hopr.current.peerId,
      postion: input,
    }

    for (let i = 0; i < players.length; i++) {
      if(players[i].peerId !== peerId) {
        sendMessage(hopr.current.apiEndpoint, hopr.current.apiToken, players[i].peerId, JSON.stringify(message));
      }
    }
  }

  const ComponentWithNoSSR = dynamic(
    () => import('../components/board'),
    { ssr: false }
  )

  function fakeRemote (input) {
    set_remotePos1(input)
  }

  function setPeerId(input){
    set_peerId(input);
    hopr.current.peerId = input;
  }

  function startGame(){
    console.log('Index: startGame')
    set_lobby(false);
  }

  
  return (
    <div className="App">
      <header className="App-header">

      </header>
      {
        map &&
        <Board
          onWin={setWin}
          map={map}
          newPlayerPosition={playerNewPosition}
          childFunc={childFunc}
          remotePos={remotePos1}
        />
      }
      {
        lobby &&
          <LobbyOverlay
            apiEndpoint={hopr.current.apiEndpoint}
            apiToken={hopr.current.apiToken}
            lobbyId={lobbyId}
            set_lobbyId={set_lobbyId}
            peerId={peerId}
            set_peerId={setPeerId}
            environment={environment}
            set_environment={set_environment}
            set_players={set_players}
            set_map={set_map}
            startGame={startGame}
          />
      }
      {
        win &&
          <WinOverlay
            win={win}
            onPlayAgain={resetGame}
          />
      }
      {
        hopr.current.apiEndpoint && hopr.current.apiToken &&
        <WebSockerHandler
          apiEndpoint={hopr.current.apiEndpoint}
          apiToken={hopr.current.apiToken}
          onMessage={(input)=>{
            console.log('WS: onMessage', input);
            set_remotePos1(JSON.parse(input).postion);
          }}
        />
      }
      {/* <p onClick={()=>{fakeRemote([0,1])}}>Press 0,1</p>
      <p onClick={()=>{fakeRemote([1,1])}}>Press 1,1</p> */}

      {/* <img src={ReactLogo} className="App-logo " alt="logo" /> */}
    </div>
  );
}
