import React from 'react';

export const BoardContext = React.createContext({ rows: 3, columns: 3 });
export const useBoardContext = () => React.useContext(BoardContext);