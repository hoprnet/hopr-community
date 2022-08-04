import { Square } from 'react-chessboard';
import { sha256 } from 'js-sha256'

export function handshake(n: number) {
  return { action: 'handshake', payload: sha256(n.toString()) }
}

export function answer(n: number) {
  return { action: 'answer', payload: n }
}

export function heartbeat(fen: string) {
  return { action: 'heartbeat', payload: sha256(fen) }
}

export function moveAction(from: Square, to: Square) {
  return { action: 'move', payload: { from, to } }
}