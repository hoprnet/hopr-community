import { createRef, useState } from 'react';
import { Chess } from 'chess.js';

import { Chessboard, ChessBoardProps, Square } from 'react-chessboard';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { doMove, selectPosition, selectSide, Side } from 'state/slices/chessSlice/chessSlice';

// import styled from 'styled-components'
import { sendMove } from 'state/slices/peerSlice/peerSlice';

// const Button = styled.div`
// margin-top: 10px;
// border: none;
// color: white;
// padding: 15px 32px;
// text-align: center;
// text-decoration: none;
// display: inline-block;
// font-size: 16px;
// `
// const UndoButton = styled(Button)`
// background-color: #808080; /* Green */
// `
// const ResetButton = styled(Button)`
// background-color: #808080; /* Green */
// `

export default function ChessBoard({ boardWidth, locked = false, }: { boardWidth: number, locked?: boolean }) {
    const position = useAppSelector(selectPosition);
    const side = useAppSelector(selectSide);

    const game = new Chess()
    // const [game, setGame] = useState(new Chess())
    game.load(position)

    const chessboardRef = createRef<HTMLDivElement>();
    //   const chessboardRef = useRef();
    const dispatch = useAppDispatch();

    const [rightClickedSquares, setRightClickedSquares] = useState<any>({});
    // const [moveSquares, setMoveSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});
    const [fromSquare, setFromSquare] = useState<Square | null>(null)

    const drop = function (sourceSquare: Square, targetSquare: Square) {
        const gameCopy = { ...game };
        const move = gameCopy.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q' // always promote to a queen for example simplicity
        });
        if (move === null) return false

        dispatch(doMove({ from: sourceSquare, to: targetSquare }))
        dispatch(sendMove({ from: sourceSquare, to: targetSquare }))

        setOptionSquares({});
        setFromSquare(null)
        return true
    }

    const onDrop: ChessBoardProps["onPieceDrop"] = function (sourceSquare, targetSquare) {
        return drop(sourceSquare, targetSquare)
    }

    const onSquareClick: ChessBoardProps["onSquareClick"] = function (square) {
        if (fromSquare && fromSquare !== square && square in optionSquares) {
            return drop(fromSquare, square)
        }

        if (fromSquare) {
            if ((fromSquare === square && Object.keys(optionSquares).length !== 0)
                || !(square in optionSquares)) {
                setOptionSquares({});
                setFromSquare(null)
            }
        } else {
            getMoveOptions(square) && setFromSquare(square)
        }
    }

    function getMoveOptions(square: Square) {
        if (game.turn() !== side) return
        const moves = game.moves({
            square,
            verbose: true
        });
        if (moves.length === 0) {
            return false;
        }

        const newSquares: any = {};
        moves.map((move) => {
            const moveTo = game.get(move.to)
            const gameSquare = game.get(square)
            newSquares[move.to] = {
                background:
                    (gameSquare && moveTo) && moveTo.color !== gameSquare.color
                        ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
                        : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                borderRadius: '50%'
            };
            return move;
        });
        newSquares[square] = {
            background: 'rgba(255, 255, 0, 0.4)'
        };
        setOptionSquares(newSquares);
        return true
    }

    return (
        <div>
            <Chessboard
                arePremovesAllowed={true}
                animationDuration={200}
                boardWidth={boardWidth}
                position={position}
                arePiecesDraggable={false}
                // onMouseOverSquare={onMouseOverSquare}
                // onMouseOutSquare={onMouseOutSquare}
                onSquareClick={onSquareClick}
                // onSquareRightClick={onSquareRightClick}
                onPieceDrop={onDrop}
                boardOrientation={side === Side.Black ? 'black' : 'white'}
                customBoardStyle={{
                    borderRadius: '4px',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
                }}
                customSquareStyles={{
                    // ...moveSquares,
                    ...optionSquares,
                    ...rightClickedSquares
                }}
                ref={chessboardRef}
            />
            {/* <ResetButton
                className="rc-button"
                onClick={() => {
                    // safeGameMutate((game: any) => {
                    //     game.reset();
                    // });
                    //   chessboardRef.current.clearPremoves();
                    // setMoveSquares({});
                    setRightClickedSquares({});
                }}
            >
                resign
            </ResetButton>
            <UndoButton
                className="rc-button"
                onClick={() => {
                    // safeGameMutate((game: any) => {
                    //     game.undo();
                    // });
                    //   chessboardRef.current.clearPremoves();
                    // setMoveSquares({});
                }}
            >
                undo
            </UndoButton> */}
        </div>
    );
}