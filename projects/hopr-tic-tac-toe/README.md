# Tic-Tac-Toe dApp using HOPR.
**Tic-tac-toe** is a logical game between two opponents on a square field of 3 by 3 cells. One of the players plays "X", the second - "O".
Players take turns putting signs on free cells (one is always X, the other is always O). The first one to line up 3 of their pieces vertically, horizontally or diagonally wins.

## Development
Developed with 
- [React.js](https://reactjs.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [HOPR](https://docs.hoprnet.org/developers/intro)

## Game
The game requires 2 participants (2 nodes).<br/>
The player must set the node settings (Node API Endpoint, Security Token).<br/>
The player can create a game or join an existing one by specifying the opponent's address.<br/>
The side for which you will play (X or O) is chosen randomly. When both players connect, they are given a randomly generated number. The player whose number is greater than the opponent's number goes first (side X).<br/>
When a player makes a move, a message with his move (his side and cell index) is sent to the opponent.

## Usage
- [Demo App Site](https://tic-tac-toe-hopr.vercel.app/)
- [Demo (Video)](https://youtu.be/jlJUXKiBmXU)

## Contacts
- [Telegram](https://t.me/h1xten)
- Discord - h1xten#3783
- [Project Repo](https://github.com/h1xten/tic-tac-toe-hopr)
- Person of contact: h1xtenc@gmail.com

#### Notice
This project is not audited and should not be used in a production environment.
