import React, { useState, useEffect, useRef } from 'react';
//import './index.css';

import styled from '@emotion/styled'
import Button from '@mui/material/Button';

import ReactLogo2 from '../hopr-logo/hopr-icon.svg';

import TextField from '@mui/material/TextField';
import DoneIcon from '@mui/icons-material/Done';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { getPeerId } from '../../functions/hopr-sdk';




const SLobbyOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: calc( 100vw );
  height: calc( 100vh );
  padding: 64px;
`

const LobbyContainer = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(250 250 250 / 95%);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`


const Title = styled.div`
  color: ccc;
  font-size: 32px;
  font-family: Source Code Pro,monospace;
  text-align: center;
`

const HoprTextField = styled(TextField)`
  width: 100%;
`


const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`

const Lobbies = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 300px;
  min-height: 100px;
  width: 100%;
  overflow: hidden;
  overflow-y: scroll;
  background: rgba(0,0,0,0.05);
  padding: 8px;
`

const HoprButton = styled(Button)`
  margin-top: 32px;
  color: #ccc;
  border-radius: 100px;
  cursor: pointer;
  font-weight: 700;
  padding: 0.3em 1.5em;
  background: linear-gradient(#000050,#0000b4);
  border: 1px solid #ffffff;
  text-transform: none;
  font-family: Source Code Pro,monospace;
  font-size: 28px;
  &:hover {
    /* border: 1px solid #ffffff61; */
  }
`

function LobbyOverlay(props) {
  const [networkWorking, set_networkWorking] = useState(false);
  const [lobbies, set_lobbies] = useState([]);
  const [refreshLobbyOn, set_refreshLobbyOn] = useState(false);

  const [startingTimer, set_startingTimer] = useState(false);
  const [startingInSeconds, set_startingInSeconds] = useState(null);

  const [tempolaryMapHolder, set_tempolaryMapHolder] = useState(null);

  // useEffect(() => {
  //   set_networkWorking(true);
  //   props.set_environment('dev-environment');
  //   props.set_peerId('peerId-dev');
  // }, []);
  

  useEffect(() => {
    let interval;
    if(networkWorking && !refreshLobbyOn){
      getLobbies();
      interval = setInterval(() => {
        getLobbies();
      }, 5000);
    }
    if(networkWorking && refreshLobbyOn){
      interval = setInterval(() => {
        getLobbies();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [networkWorking, refreshLobbyOn, startingTimer]);

  useEffect(() => {
    let interval;
    if(props.lobbyId){
      interval = setInterval(() => {
        refreshLobby();
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [refreshLobbyOn, props.lobbyId]);

  useEffect(() => {
    if(startingTimer){
      const interval = setInterval(() => {
        set_startingInSeconds(time=> time-1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startingTimer]);

  useEffect(() => {
    console.log('startingInSeconds', startingInSeconds);
    if(startingInSeconds !== null && startingInSeconds <= 0){
      console.log('startingInSeconds && startingInSeconds <= 0', startingInSeconds && startingInSeconds <= 0, tempolaryMapHolder);
      props.set_map(tempolaryMapHolder);
      props.startGame();
    }
  }, [startingInSeconds, tempolaryMapHolder]);
  
  function testNetwork(){
    console.log('Test')
    if(props.apiEndpoint && props.apiToken){
      const host = new URL(props.apiEndpoint).host;
      props.set_environment(host.split('.')[0].match(/_\w+/)[0].replace('_','') || 'any' );
      const fetchData = async () => {
        const id = await getPeerId(props.apiEndpoint, props.apiToken);
        if(id) {
          set_networkWorking(true);
          props.set_peerId(id);
        }
        else set_networkWorking(false)
      }
      fetchData().catch(console.error);
    }
  };

  async function createLobby(){
    console.log(`/api/create-lobby`, props);
    let url = `/api/create-lobby`;
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        peerId: props.peerId,
        environment: props.environment
      })
    }
    );
    const json =  await response.json();
    console.log('response', json);
    props.set_lobbyId(json.lobbyId);

    let tmp = JSON.parse(JSON.stringify(lobbies));
    tmp.push({id: json.lobbyId, open: 1, players: 1});
    set_lobbies(tmp);

    setTimeout(()=>{
      let objDiv = document.getElementById("lobby-list");
      console.log(objDiv.scrollHeight)
      objDiv.scrollTop = objDiv.scrollHeight;
    }, 100)
    set_refreshLobbyOn(true);
  };

  async function joinLobby(lobbyId){
    console.log('joinLobby', lobbyId);
    let url = `/api/join-lobby`;
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        lobbyId,
        peerId: props.peerId,
        environment: props.environment
      })
    }
    );
    const json =  await response.json();

    let tmp = JSON.parse(JSON.stringify(lobbies));
    let index = tmp.findIndex(lobby => lobby.id === lobbyId);
    tmp[index].players += 1;
    if(props.lobbyId){
      index = tmp.findIndex(lobby => lobby.id === props.lobbyId);
      tmp[index].players -= 1;
      if(tmp[index].players < 0) tmp[index].players = 0;
    }

    props.set_lobbyId(lobbyId);
    set_lobbies(tmp);
    set_refreshLobbyOn(true);
  };

  async function refreshLobby(){
    console.log('refreshLobby', props.lobbyId, props.peerId);
    let url = `/api/refresh-lobby`;
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        lobbyId: props.lobbyId,
        peerId: props.peerId,
        environment: props.environment
      })
    });
  };

  async function getLobbies() {
    console.log('getLobbies');
    let url = `/api/get-lobbies`;
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        environment: props.environment
      })
    });
    const json =  await response.json();
    set_lobbies(json);

    if(!props.lobbyId) return;
    let yourLobby = json.filter(lobby => lobby.id === props.lobbyId)[0];
    if(yourLobby.startsAtSec && !startingTimer) {
      console.log('yourLobby startsAt!', yourLobby.startsAtSec, startingTimer)
      set_startingInSeconds(yourLobby.startsAtSec);
      set_startingTimer(true);
      set_tempolaryMapHolder(JSON.parse(yourLobby.map));
      getPlayers();
    }
  };

  async function startGame(){
    console.log('startGame', props.lobbyId, props.peerId);
    let url = `/api/start-game`;
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        lobbyId: props.lobbyId,
        peerId: props.peerId,
        environment: props.environment
      })
    });
    const json = await response.json();
    set_startingInSeconds(json.game[0].startsAtSec);
    set_startingTimer(true);
    props.set_players(json.peers);
    set_tempolaryMapHolder(JSON.parse(json.game[0].map))
  };

  async function getPlayers(){
    console.log('getPlayers', props.lobbyId, props.environment);
    let url = `/api/get-players`;
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        lobbyId: props.lobbyId,
        environment: props.environment
      })
    });
    const json = await response.json();
    console.log('response getPlayers', json);
    props.set_players(json);
  };
  
  return (
    <SLobbyOverlay>
      <LobbyContainer>
        <ReactLogo2
          className="win-overlay--logo"
        />
        <Title> 
          HOPR Node Settings
        </Title>
        <HoprTextField
          label="apiEndpoint"
          id="filled-size-small"
          variant="filled"
          size="small"
          disabled
          value={props.apiEndpoint ? props.apiEndpoint : ''}
        />
        <HoprTextField
          label="apiToken"
          id="filled-size-small"
          variant="filled"
          size="small"
          disabled
          value={props.apiToken? props.apiToken : ''}
        />
        <Row>
          <Button 
            variant="outlined"
            onClick={testNetwork}
          >Test</Button>
          {
            networkWorking ? 
              <DoneIcon/>
              :
              <DoNotDisturbIcon/>
          }
          

        </Row>
          <br></br>
        <Row>
          <Title> 
            Lobby
          </Title>
          <Button 
              variant="outlined"
            //  disabled={!networkWorking || props.lobbyId}
              disabled={!networkWorking || !!startingInSeconds}
              onClick={createLobby}
          >
            Create lobby
          </Button>
        </Row>
        {/* <p>
          <strong>In lobby ID: </strong>{ props.lobbyId}
        </p> 
        <p>
          <strong>Lobbies online:</strong>
        </p>*/}
        <Lobbies
          id='lobby-list'
        >
          {
            lobbies.map(lobby => 
              <Button 
                key={`lobby-${lobby.id}`}
                onClick={()=>{
                  joinLobby(lobby.id);
                }}
                disabled={lobby.open === 0 || lobby.players > 1}
              >
                {
                  lobby.id ===  props.lobbyId ? 
                  <strong>Lobby {lobby.id}, players: {lobby.players}</strong> :
                  <>Lobby {lobby.id}, players: {lobby.players ? lobby.players : 0} {lobby.players === 2? '(max)' : ''}</>
                }
              </Button>
            )
          }
        </Lobbies>
        <Button 
          variant="outlined"
          disabled={!props.lobbyId || !!startingInSeconds}
          onClick={startGame}
        >
          {
            startingInSeconds ? 
            <span>Starts in { startingInSeconds } s</span> :
            <span>Start Game</span>
          }
        </Button>
      </LobbyContainer>
    </SLobbyOverlay>
  );
}

// LobbyOverlay.defaultProps = {
//   apiEndpoint: '',
//   apiToken: ''
// }

export default LobbyOverlay;
