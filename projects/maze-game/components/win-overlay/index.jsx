import React, { useState, useEffect, useRef } from 'react';
//import './index.css';

import styled from '@emotion/styled'
import Button from '@mui/material/Button';

import ReactLogo2 from '../hopr-logo/hopr-icon.svg';


const HoprButton = styled(Button)`
  margin-top: 32px;
  color: #fff;
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


function App(props) {
  return (
    <div 
      className="win-overlay"
    >
      <div
        className="win-overlay--container"
      >
        <ReactLogo2
          className="win-overlay--logo"
        />
        <div
          className="win-overlay--title"
        > 
          Player { props.win } won!
        </div>
        <HoprButton 
          variant="outlined"
          onClick={props.onPlayAgain}
          disabled
        >
          Play again
        </HoprButton>
      </div>

    </div>
  );
}

export default App;
