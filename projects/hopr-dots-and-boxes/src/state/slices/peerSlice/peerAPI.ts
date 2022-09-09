import { sha256 } from 'js-sha256'

export function handshake(n: number, options: any = null) {
  return { action: 'handshake', payload: { hash: sha256(n.toString()), options } }
}

export function answer(n: number) {
  return { action: 'answer', payload: n }
}

export function heartbeat(fen: string) {
  return { action: 'heartbeat', payload: sha256(fen) }
}

export function moveAction(row: number, column: number, type: string) {
  return { action: 'move', payload: { row, column, type } }
}