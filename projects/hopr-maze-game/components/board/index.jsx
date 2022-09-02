import React, { useState, useEffect, useRef } from 'react';
//import './index.css';

import createMaze from '../../functions/maze'
import { display } from '../../functions/maze'
//import { ReactComponent as ReactLogo2 } from '../hopr-logo/hopr-icon.svg';
import  ReactLogo2 from '../hopr-logo/hopr-icon.svg';


const rectWidth = 40;
const rectHeight = 40;
const mazeHeight = 9;
const mazeWidth = 17;
// const mazeHeight = 5;
// const mazeWidth = 8;

function Board(props) {
  const [maze, setMaze] = useState(null);
  const [playerPosition, setPlayerPosition] = useState([0,1]);
  const [shake, setShake] = useState(false);
  const [win, setWin] = useState(null);
  const mazeRef = useRef();
  const winRef = useRef();
  mazeRef.current = maze;
  winRef.current = win;
  
  //Multiplayer
  const [playerPosition2, setPlayerPosition2] = useState([0,1]);
  const [shake2, setShake2] = useState(false);
  const [overlap, setOverlap] = useState(true);

  useEffect(() => {
    console.log('Board rendered')
  }, []);

  useEffect(() => {
    resetGame();
    document.addEventListener('keydown', keyPressHandler);
    return function cleanupListener() {
      document.removeEventListener('keydown', keyPressHandler);
    }
  }, []);

  useEffect(() => {
    let overlap = playerPosition[0] === playerPosition2[0] && playerPosition[1] === playerPosition2[1];
    setOverlap(overlap);


    if(maze && playerPosition[0] === maze.length - 1 && playerPosition[1] === maze[0].length - 2){
      console.log('Win!', playerPosition);
      setWin(1);
      props.onWin(1);
    }
  }, [playerPosition, playerPosition2]);

  useEffect(() => {
    if(shake) {
      setTimeout(()=>setShake(false), 500);
    }
  }, [shake]);

  useEffect(() => {
    if(shake2) {
      setTimeout(()=>setShake2(false), 500);
    }
  }, [shake2]);

  useEffect(() => {
    props.childFunc.current = resetGame
  }, [])


  useEffect(() => {
    console.log('Board, useEffect:', props.remotePos)
    setPlayerPosition2(props.remotePos);
  }, [props.remotePos])

  // const movedTo = (input) => {
  //   console.log(props)
  //   props.newPos(input);
  // }

  const resetGame = () => {
  //  const mazeObj = createMaze(mazeWidth,mazeHeight,true);
    console.log('resetGame map', props.map)
    const mazeObj = createMaze(mazeWidth, mazeHeight, false, props.map);
  //  console.log('mazeObj', mazeObj);
    const draw = display(mazeObj);
 //   console.log('draw', draw);

    setMaze(mazeObj.array)
    setPlayerPosition([0,1]);
    setPlayerPosition2([0,1]);
    setShake(false);
    setShake2(false);
    setWin(null);
  }

  const keyPressHandler  = (event) => {
    console.log('event.code', event.code);
  
    if(winRef.current) return;

    let maze = mazeRef.current;

    if (event.code === "ArrowUp") {
      setPlayerPosition((poz) => {
        const canMove = poz[0]-1 >= 0 && maze[poz[0]-1][poz[1]] === ' ';
        if(canMove) {
          let newPos = [poz[0]-1,poz[1]];
          props.newPlayerPosition(newPos);
          return newPos;
        }
        else {
          setShake(true);
          return poz
        }
      });
    }

    else if (event.code === "ArrowDown") {
      setPlayerPosition((poz) => {
        const canMove = poz[0]+1 < maze.length && maze[poz[0]+1][poz[1]] === ' ';
        if(canMove) {
          let newPos = [poz[0]+1,poz[1]];
          props.newPlayerPosition(newPos);
          return newPos;
        }
        else {
          setShake(true);
          return poz
        }
      });
    }

    else if (event.code === "ArrowLeft") {
      setPlayerPosition((poz) => {
        const canMove = maze[poz[0]][poz[1]-1] === ' ';
        if(canMove) {
          let newPos = [poz[0],poz[1]-1];
          props.newPlayerPosition(newPos);
          return newPos;
        }
        else {
          setShake(true);
          return poz
        }
      });
    }

    else if (event.code === "ArrowRight") {
      setPlayerPosition((poz) => {
        const canMove = maze[poz[0]][poz[1]+1] === ' ';
        if(canMove) {
          let newPos = [poz[0],poz[1]+1];
          props.newPlayerPosition(newPos);
          return newPos;
        }
        else {
          setShake(true);
          return poz
        }
      });
    }

    // if (event.code === "KeyW") {
    //   setPlayerPosition2((poz) => {
    //     const canMove = poz[0]-1 >= 0 && maze[poz[0]-1][poz[1]] === ' ';
    //     if(canMove) return [poz[0]-1,poz[1]]
    //     else {
    //       setShake2(true);
    //       return poz
    //     }
    //   });
    // }

    // else if (event.code === "KeyS") {
    //   setPlayerPosition2((poz) => {
    //     const canMove = poz[0]+1 < maze.length && maze[poz[0]+1][poz[1]] === ' ';
    //     if(canMove) return [poz[0]+1,poz[1]]
    //     else {
    //       setShake2(true);
    //       return poz
    //     }
    //   });
    // }

    // else if (event.code === "KeyA") {
    //   setPlayerPosition2((poz) => {
    //     const canMove = maze[poz[0]][poz[1]-1] === ' ';
    //     if(canMove) return [poz[0],poz[1]-1]
    //     else {
    //       setShake2(true);
    //       return poz
    //     }
    //   });
    // }

    // else if (event.code === "KeyD") {
    //   setPlayerPosition2((poz) => {
    //     const canMove = maze[poz[0]][poz[1]+1] === ' ';
    //     if(canMove) return [poz[0],poz[1]+1]
    //     else {
    //       setShake2(true);
    //       return poz
    //     }
    //   });
    // }
  };


  function renderRect(lineIndex, rowIndex, field) {
    const x = rowIndex * rectWidth;
    const y = lineIndex * rectWidth;
    const wall = field === 'x';
    return (
      <rect  
        x={x}
        y={y}
        width={rectWidth} 
        height={rectHeight}
        className={`ractange lineIndex-${lineIndex} lineRow-${rowIndex} ${wall ? 'wall' : ''}`}
        key={`ractange-lineIndex-${lineIndex}-lineRow-${rowIndex}`}
      />
    )
  }

  return (
    <div 
      className="boardContainer"
   //   onKeyDown={keyPressHandler}
      tabIndex="0"
    >
        <svg 
          viewBox={`0 0 ${(mazeWidth*2+1)*rectWidth} ${(mazeHeight*2+1)*rectHeight}`}
          className="maze-svg" 
        >
          { 
            maze && maze.map((line, lineIndex) => {
                return (
                  line.map((field, rowIndex) => {
                    return renderRect(lineIndex, rowIndex, field)
                  }
                )
                )
              }
            )
          }
          <g 
            className="hopr-logo-maze-player-container player-1"
            animation={`${shake && !overlap}`}
            win={`${win === 1}`}
            overlap={`${overlap}`}
          >
            <ReactLogo2
              x={ overlap ? (rectWidth * playerPosition[1] + 2)*2 : rectWidth * playerPosition[1] + 2 }
              y={ overlap ? (rectHeight * playerPosition[0] + 2)*2 : rectHeight * playerPosition[0] + 2 }
              width={ rectWidth - 4 } 
              height={ rectHeight - 4 }
            />
          </g>
          <g 
            className="hopr-logo-maze-player-container player-2"
            animation={`${shake2 && !overlap}`}
            win={`${win === 2}`}
            overlap={`${overlap}`}
          >
            <ReactLogo2
              x={ overlap ? (rectWidth * playerPosition2[1] + 2)*2 : rectWidth * playerPosition2[1] + 2 }
              y={ overlap ? (rectHeight * playerPosition2[0] + 2)*2 : rectHeight * playerPosition2[0] + 2 }
              width={ rectWidth - 4 } 
              height={ rectHeight - 4 }
            />
          </g>
        </svg>
    </div>
  );
}

export default Board;
