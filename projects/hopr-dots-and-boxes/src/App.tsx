import { useState, ChangeEvent, useEffect } from 'react';
import './App.css';

import { useAppDispatch, useAppSelector } from './app/hooks';
import {
  selectEndpoint,
  selectOpponent,
  selectSecurityToken,
  setOpponent,
  startGame,
  selectStatus,
  connectGame,
  selectLocation,
  setSecurityToken
} from './state/slices/peerSlice/peerSlice';
import WebSocketHandler from './components/WebSocketHandler/WebSocketHandler'
import styled from 'styled-components'

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

import { FaCog } from "react-icons/fa";

import AppBar from '@mui/material/AppBar';
import Slider from '@mui/material/Slider';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { getParam, setParam } from './lib/url';
import { push } from "redux-first-history";
import { getHeaders } from './lib/utils';

import DotsAndBoxesBoard from './components/DotsAndBoxes/DotsAndBoxesBoard'
import { selectDim, selectGrid } from 'state/slices/gameSlice/gameSlice';
import { BoardContext } from 'app/context';

const StyledPopup = styled(Popup)`
  &-content {
    background: transparent;
    border: none;
  }
`

function SettingsCard({ hoprAddress }: { hoprAddress: string }) {
  const dispatch = useAppDispatch();

  const securityToken = useAppSelector(selectSecurityToken)
  const apiEndpoint = useAppSelector(selectEndpoint)
  const status = useAppSelector(selectStatus)
  const location = useAppSelector(selectLocation)

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Box component="form"
          sx={{
            '& .MuiTextField-root': { m: 1 },
            flexDirection: 'column',
            display: 'flex',
          }}
          noValidate
          autoComplete="off">
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            HOPR Node Settings
          </Typography>
          <TextField sx={{ width: '25ch' }} id="apiEndpoint" label="API Endpoint" variant="standard" value={apiEndpoint} onChange={(e: ChangeEvent<HTMLInputElement>) =>
            location && dispatch(push(location.pathname + setParam(location, 'apiEndpoint', e.target.value)))
          } />
          <TextField sx={{ width: '25ch' }} id="securityToken" label="Security Token" variant="standard" value={securityToken} onChange={(e: ChangeEvent<HTMLInputElement>) =>
            location && dispatch(push(location.pathname + setParam(location, 'securityToken', e.target.value)))
            // dispatch(setSecurityToken(e.target.value))
          } />
          <TextField id="hoprAddress" label="HOPR Address" variant="standard" value={hoprAddress} />
          <Divider sx={{ m: 2 }} />
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Debug
          </Typography>
          <TextField sx={{ width: '25ch' }} label="Game Status" color="secondary" variant="standard" value={status} />
        </Box>
      </CardContent>
    </Card>
  );
}

function ConnectCard() {
  const dispatch = useAppDispatch();
  const opponent = useAppSelector(selectOpponent)
  const status = useAppSelector(selectStatus)

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Box component="form"
          sx={{
            '& .MuiTextField-root': { m: 1 },
            flexDirection: 'column',
            display: 'flex',
          }}
          noValidate
          autoComplete="off">
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Connect
          </Typography>
          <TextField id="opponent" label="Opponent Address" variant="standard" value={opponent} onChange={(e: ChangeEvent<HTMLInputElement>) =>
            dispatch(setOpponent(e.target.value))
          } />
          <TextField sx={{ width: '25ch' }} label="Game Status" color="secondary" variant="standard" value={status} />
        </Box>
      </CardContent>
      <CardActions>
        <Button onClick={() => dispatch(connectGame())} size="small">Connect</Button>
      </CardActions>
    </Card>
  );
}

function CreateGameCard({ hoprAddress }: { hoprAddress: string }) {
  const dispatch = useAppDispatch();
  const opponent = useAppSelector(selectOpponent)
  const status = useAppSelector(selectStatus)
  const [rows, setRows] = useState(3)
  const [columns, setColumns] = useState(3)

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Box component="form"
          sx={{
            '& .MuiTextField-root': { m: 1 },
            flexDirection: 'column',
            display: 'flex',
          }}
          noValidate
          autoComplete="off">
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Create Game
          </Typography>
          <TextField id="hoprAddress" label="HOPR Address" variant="standard" value={hoprAddress} />
          <TextField id="opponent" label="Opponent Address" variant="standard" value={opponent} onChange={(e: ChangeEvent<HTMLInputElement>) =>
            dispatch(setOpponent(e.target.value))
          } />
          <TextField sx={{ width: '25ch' }} label="Game Status" color="secondary" variant="standard" value={status} />
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Rows
          </Typography>
          <Container>
            <Slider
              valueLabelDisplay="auto"
              value={rows}
              marks={[3, 4, 5].map((v) => ({ label: '' + v, value: v }))}
              onChange={(_, value) => setRows(value as number)}
              step={1}
              min={3}
              max={5}
            />
          </Container>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Columns
          </Typography>
          <Container>
            <Slider
              value={columns}
              onChange={(_, value) => setColumns(value as number)}
              marks={[3, 4, 5].map((v) => ({ label: '' + v, value: v }))}
              step={1}
              min={3}
              max={5}
            />
          </Container>
        </Box>
      </CardContent>
      <CardActions>
        <Button onClick={() => dispatch(startGame({ rows, columns }))} size="small">Start</Button>
      </CardActions>
    </Card>
  );
}

function App() {
  const grid = useAppSelector(selectGrid)
  const securityToken = useAppSelector(selectSecurityToken)
  const apiEndpoint = useAppSelector(selectEndpoint)

  const dispatch = useAppDispatch()
  const [hoprAddress, setHoprAddress] = useState("");

  const [createGameModal, setCreateGameModal] = useState(false)
  const [connectGameModal, setConnectGameModal] = useState(false)
  const [settingsModal, setSettingsModal] = useState(false)

  const closeCreateGameModal = () => setCreateGameModal(false);
  const closeConnectGameModal = () => setConnectGameModal(false);
  const closeSettingsModal = () => setSettingsModal(false);

  const location = useAppSelector(selectLocation)

  useEffect(() => {
    if (!location) return

    const newLocation = { ...location }

    if (!getParam(newLocation, 'apiEndpoint')) {
      newLocation.search = setParam(newLocation, 'apiEndpoint', 'http://localhost:13301')
    }

    if (!getParam(newLocation, 'securityToken')) {
      newLocation.search = setParam(newLocation, 'securityToken', '^^LOCAL-testing-123^^')
    }

    if (newLocation.search !== location.search) {
      dispatch(push(newLocation.pathname + newLocation.search))
    }
  }, []);

  useEffect(() => {
    if (!securityToken || !apiEndpoint) return;

    const loadAddress = async () => {
      const headers = getHeaders(false, securityToken);
      const account = await fetch(`${apiEndpoint}/api/v2/account/addresses`, {
        headers
      })
        .then((res) => res.json())
        .catch((err) => console.error(err));

      if (account?.hoprAddress) {
        setHoprAddress(account?.hoprAddress);
      } else {
        setHoprAddress('');
      }
    };
    loadAddress();
  }, [securityToken, apiEndpoint]);

  const { rows, columns } = useAppSelector(selectDim)
  return (
    <BoardContext.Provider value={{ rows, columns }}>
      <div className="App">
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="h6" color="inherit" component="div" sx={{ flexGrow: 1 }}>
              Dots And Boxes
            </Typography>
            <Button color="inherit" onClick={() => setCreateGameModal(true)} >New Game</Button>
            <Button color="inherit" onClick={() => setConnectGameModal(true)} >Connect</Button>
            <IconButton onClick={() => setSettingsModal(true)} edge="start" color="inherit" aria-label="menu" sx={{ m: 2 }}>
              <FaCog />
            </IconButton>
          </Toolbar>
        </AppBar>
        <StyledPopup open={settingsModal} position="right center" modal onClose={closeSettingsModal}>
          <SettingsCard hoprAddress={hoprAddress} />
        </StyledPopup>
        <StyledPopup open={connectGameModal} position="right center" modal onClose={closeConnectGameModal}>
          <ConnectCard />
        </StyledPopup>
        <StyledPopup open={createGameModal} position="right center" modal onClose={closeCreateGameModal}>
          <CreateGameCard hoprAddress={hoprAddress} />
        </StyledPopup>
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={{ height: '100%' }}
        >
          {grid && <DotsAndBoxesBoard boardWidth={500} />}
          {/* {!position && <Typography sx={{ fontSize: 14 }} color="text.secondary">No Open Games.</Typography>} */}
        </Grid>
        <div style={{ position: 'fixed', bottom: '0', right: '15px' }}>
          {securityToken && <WebSocketHandler wsEndpoint={`${apiEndpoint}/api/v2/messages/websocket`} securityToken={securityToken} />}
        </div>
      </div>
    </BoardContext.Provider>
  );
}

export default App;
