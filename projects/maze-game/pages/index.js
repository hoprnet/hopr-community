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
  
  const [win, set_win] = useState(null);
  const [lobby, set_lobby] = useState(true);
  const [lobbyId, set_lobbyId] = useState(null);
  const childFunc = React.useRef(null);
  const hopr = React.useRef({apiToken: null, apiEndpoint: null, peerId: null, environment: null});

  const [apiEndpoint, set_apiEndpoint] = useState(null);
  const [apiToken, set_apiToken] = useState(null);
  const [peerId, set_peerId] = useState(null);

  const [environment, set_environment] = useState(null);
  const [players, set_players] = useState([]);
  const [map, set_map] = useState(false);

  const [gotHoprAPI, set_gotHoprAPI] = useState(false);
  const [startedAt, set_startedAt] = useState();
  const [wonAt, set_wonAt] = useState([]);

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

  //DEV WIN
  // useEffect(()=>{
  //   set_lobby(false)
  //   set_peerId('16Uiu2HAkwrugLw54kVtDB4x9AULNv7kVqVkP5PAYVQwbNT4fJmpQ')
  //   set_win('16Uiu2HAkwrugLw54kVtDB4x9AULNv7kVqVkP5PAYVQwbNT4fJmpQ')
  //   set_wonAt([
  //     {wonAt: 1234, peerId: '16Uiu2HAkwrugLw54kVtDB4x9AULNv7kVqVkP5PAYVQwbNT4fJmpQ'}
  //   ])
  // }, []);


  // useEffect(()=>{
  //   console.log('players', players)
  // }, [players]);

  useEffect(()=>{
    if(!router.isReady) return;
    console.log('router ready:', router)
    hopr.current.apiToken = router.query.apiToken;
    hopr.current.apiEndpoint = router.query.apiEndpoint;
    set_apiEndpoint(router.query.apiEndpoint);
    set_apiToken(router.query.apiToken);

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
        sendMessage(apiEndpoint, apiToken, players[i].peerId, JSON.stringify(message));
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
    set_startedAt(Date.now())
  }

  function winGame(input){
    set_win(input);
    const wonAt = Date.now() - startedAt;
    let message = {
      from: hopr.current.peerId,
      wonAt
    }
    for (let i = 0; i < players.length; i++) {
      if(players[i].peerId !== peerId) {
        sendMessage(hopr.current.apiEndpoint, hopr.current.apiToken, players[i].peerId, JSON.stringify(message));
      }
    }
    set_wonAt(oldArray => [...oldArray, {wonAt, peerId: hopr.current.peerId}]);
  }

  function gotWsMessage(input){
    let message = JSON.parse(input);
    if(message.postion){
      set_remotePos1(message.postion);
    } else if (message.wonAt) {
      console.log('message.wonAt')
      set_wonAt(oldArray => [...oldArray, {wonAt: message.wonAt, peerId: message.from}]);
    }
  }

  function setApiEndpoint(input){
    set_apiEndpoint(input);
    set_peerId(null);
    hopr.current.apiEndpoint = router.query.apiEndpoint;
    router.push(`/?apiEndpoint=${input}${apiToken?.length > 0 ? `&apiToken=${apiToken}` : ''}`)
  }

  function setApiToken(input){
    set_apiToken(input);
    hopr.current.apiToken = router.query.apiToken;
    set_peerId(null);
    router.push(`/?${apiEndpoint?.length > 0 ? `apiEndpoint=${apiEndpoint}&` : ''}apiToken=${input}`)
  }

  
  return (
    <div className="App">
      <header className="App-header">

      </header>
      {
        map &&
        <Board
          onWin={winGame}
          map={map}
          newPlayerPosition={playerNewPosition}
          childFunc={childFunc}
          remotePos={remotePos1}
        />
      }
      {
        lobby &&
          <LobbyOverlay
            apiEndpoint={apiEndpoint}
            apiToken={apiToken}
            setApiEndpoint={setApiEndpoint}
            setApiToken={setApiToken}
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
        wonAt.length > 0 &&
          <WinOverlay
            wonAt={wonAt}
            peerId={peerId}
        //    onPlayAgain={resetGame}
          />
      }
      {
        peerId && apiEndpoint && apiToken &&
        <WebSockerHandler
          apiEndpoint={apiEndpoint}
          apiToken={apiToken}
          onMessage={gotWsMessage}
        />
      }

    </div>
  );
}
