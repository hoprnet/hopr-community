import { useBoardContext } from "app/context";
import React from "react";
import "./styles/Dot.style.css";

function Dot() {
  const board = useBoardContext()

  return (
    <div className={'dot dot' + Math.max(board.rows, board.columns)}></div>
  );
}

export default Dot;
