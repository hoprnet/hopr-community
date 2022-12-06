import { getAddress, sendHoprMessage, establishChannel } from '../connectivity/hoprNode.js';
import useWebsocket from '../connectivity/useWebSocket.js';
import webSocketHandler from '../connectivity/WebSocketHandler.jsx';
import config from "../config/config.js";
import { v4 as uuidv4 } from 'uuid';

class Multiplayer {
    constructor(otherPlayers, gameCreator) {
        this.websocket = null;
        this.address = null;
        this.playerData = {};
        this._rounds = {}

        this.isStarted = false;
        this.starting = false;

        this.isReady = false;

        // Player is NOT game creator because multiplayer has a game creator property
        if(gameCreator && typeof gameCreator == 'string' && gameCreator.length > 0) {
            this.gameCreator = gameCreator;
            this.isGameCreator = false;
            this._otherPlayers = [];
        } else { // player is game creator
            // If player is game creator, add other players and set game ID
            this.gameID = uuidv4(); // used to identify current game.

            this.gameCreator = null;
            this.setPlayers(otherPlayers);

            this.isGameCreator = true;
        }
    }

    start() {
        if(!this.starting && !this.isStarted) {
            this.starting = true;
            return this.getAddress()
                .then(res => {
                    this.starting = false;
                    if(res && typeof res == 'string' && res.trim() != "") {
                        this.address = res;
                        this.isStarted = true;

                        this.playerData[this.address] = {};

                        const players = [ ...this.otherPlayers, this.address ];
                        this.setPlayers(players);

                        if(res == this.gameCreator || !this.gameCreator) {
                            this.isGameCreator = true;
                            return this.createGame();
                        } else {
                            this.isGameCreator = false;
                            return this.connectGame(this.gameCreator);
                        }
                    }
                });
        } else return Promise.resolve();
    }

    setPlayers(playerArray) {
        this._otherPlayers = [];
        this.playerData = {};
        this._otherPlayers = [];

        playerArray.forEach(p => {
            this.playerData[p] = {
                score: 0
            };

            // add player to otherPlayers array if they are not user
            if(p != this.address)
                this._otherPlayers.push(p);

        });

        this.update();
    }

    /**
     * Connects to existing game
     */
    connectGame(gameCreator) {
        if(this.isGameCreator)
            return Promise.reject("Game creator cannot connect to game");
        else
            return this.establishChannel(gameCreator)
                .catch(e => {
                    if(e == "CHANNEL_ALREADY_OPEN")
                        return true;
                    else {
                        console.error("Error opening channel", e);
                        throw e;
                    }
                });
    }

    /**
     * Creates game for others to connect to
     */
    createGame(cb) {
        console.log('create game called');
        if(!this.isGameCreator)
            return Promise.reject("Only game creator can create game");

        const gameData = {
            type: 'startGame',
            players: [...this.otherPlayers, this.address],
            answers: this.answers
        }

        let promiseChain = Promise.resolve(true);

        // Will establish channels and send startGame message containing game information to other players
        this.otherPlayers.forEach(addr => {
            promiseChain = promiseChain
                .then(() => {
                    return new Promise((resolve, reject) => {
                        setTimeout(
                            () => {
                                return this.establishChannel(addr)
                                    .catch(e => {
                                        if(e == "CHANNEL_ALREADY_OPEN")
                                            return resolve(true);
                                        else reject(e);
                                    })
                                    .then(res => {
                                        if(cb) {
                                            return cb()
                                                .then(res => resolve(res));
                                        } else
                                            return resolve(res)
                                    })
                            },
                            400
                        )
                    });
                })
                .then(() => {
                    this.isReady = true;

                    return new Promise((resolve, reject) => {
                        setTimeout(
                            () => {
                                if(!addr || addr == "")
                                    return resolve(false);

                                let callerTimer = 5 * 60 * 1000; // 5 minutes

                                const caller = setInterval(() => {
                                    return this.sendMessage(addr, gameData)
                                        .then(res => {
                                            console.log('calling timer after', (5 * 60 * 1000) - callerTimer);
                                            console.log('\ncaller timer:', callerTimer);
                                            callerTimer -= 15000;
                                            console.log('caller timer:', callerTimer);

                                            if(callerTimer < 0) {
                                                clearInterval(caller)
                                                return resolve(res);
                                            } else if(cb) {
                                                return cb()
                                                    .then(res => resolve(res));
                                            } else
                                                return resolve(res)
                                        })
                                }, 15000);
                            },
                            400
                        )
                    });
                });
        });

        return promiseChain;
    }

    sendMessage(addr, data) {
        return this.sendHoprMessage(addr, {
            ...data,
            app: 'hangman',
            game_id: this.gameID
        });
    }

    parseMessage(wsMsg) {
        let data = wsMsg;

        if(wsMsg && typeof wsMsg == 'object')
            data = wsMsg
        else if(typeof wsMsg == 'string') {
            try {
                data = JSON.parse(wsMsg);
            } catch(e) {
                data = {};
            }
        }

        if(typeof data == 'string') {
            try {
                data = JSON.parse(data);
            } catch(e) {
                console.log("cannot parse data anymore:", data);
            }
        }

        if(data.app == 'hangman') {
            if(data.type == 'startGame') {
                if(!this.isGameCreator) {
                    if(data.game_id != this.gameID) {
                        const players = [...new Set([ ...data.players, this.address ])];
                        this.answers = data.answers;
                        this.setPlayers(players);
                        this.gameID = data.game_id;

                        this.isReady = true;
                    }
                }
            } else {
                if(data.game_id && this.gameID) {
                    if(data.game_id != this.gameID) {
                        console.info("Wrong game id received:", data.game_id, "\nGame id:", this.gameID);
                        return Promise.resolve(false);
                    }

                    if(data.type == 'roundData')
                        return this.receiveRoundScores(data);

                    else if(data.type == 'gameOver') {
                        return this.receiveGameOver(data)
                    }
                }
            }
        }

        return Promise.resolve(true);
    }

    saveRound(round) {
        const peerId = round.peerId;

        if(!this._rounds[peerId])
            this._rounds[peerId] = {};

        this._rounds[peerId][round.num] = round;
        this._rounds[peerId].currentRound = round;
        this.playerData[peerId].score = round.gameScore;
    }

    receiveRoundScores(round) {
        this.saveRound(round);
        let promiseChain = Promise.resolve(true);

        if(this.isGameCreator) {
            this.otherPlayers.forEach(addr => {
                this.sendRoundScores(round, addr);
            });
        }
        return promiseChain;
    }

    sendRoundScores(roundData) {
        const data = {
            ...roundData,
            app: 'hangman',
            type: 'roundData',
        }
        return this.broadcastMessage(data);
    }

    receiveGameOver(gameData) {
        const data = {
            ...gameData,
            app: 'hangman',
            type: 'gameOver',
        }

        this.gameOver(gameData);

        return Promise.resolve(true);
    }

    sendGameOver(gameData) {
        const data = {
            ...gameData,
            app: 'hangman',
            type: 'gameOver',
            peerId: this.address,
        }

        this.gameOver(data);

        return this.broadcastMessage(data)
    }

    gameOver(gameData) {
        this.playerData[gameData.peerId] = {
            gameOver: true,
            score: gameData.score,
        }

        if(this.canChooseWinner)
            return this.chooseWinner();
        else return true;
    }

    update() {
        if(this.updateHook)
            return this.updateHook();
        else return Promise.resolve(true);
    }

    onUpdate(cb) {
        if(cb)
            this.updateHook = cb;
    }

    broadcastMessage(data) {
        if(!data.peerId) {
            data.peerId = this.address;
            this.saveRound(data);
        }

        const otherPlayers = [...this.otherPlayers];
        const gameCreator = this.gameCreator;

        let promiseChain = Promise.resolve();
        if(otherPlayers && otherPlayers.length > 0) {
            otherPlayers.forEach(peerID => {
                if(peerID != data.peerId) {
                    promiseChain = promiseChain.then(() =>
                        this.sendMessage(peerID, data));
                }
            });
        }

        return promiseChain;
    }

    get allowNewRound() {
        let ans = true;

        for(let peerId in this._rounds) {
            const roundData = this.getCurrentRound(peerId);

            if(roundData && roundData.num <= this.getCurrentRound(this.address))
                ans = true;
        }

        return ans;
    }

    get winner() {
        console.log("can i choose winner?", this.canChooseWinner);
        console.log("trying to choose winner");
        if(this.canChooseWinner) {
            let winner_ = this.chooseWinner();

            if(winner_ == this.address)
                winner_ = "You";

            return winner_;
        }
        else return null;
    }

    get canChooseWinner() {
        let ans = true;

        Object.values(this.playerData).forEach(playerData => {
            if(!playerData || !playerData.gameOver)
                ans = false;
        });

        return ans;
    }

    chooseWinner() {
        let winner=null, highestScore=0;

        for(let peerId in this.playerData) {
            const score = this.playerData[peerId].score 
            // Initialise winner
            if(!winner)
                winner = peerId;

            if(score > highestScore) {
                highestScore = score;
                winner = peerId;
            }
        }

        return winner;
    }

    get otherPlayers() {
        return Object.keys(this.playerData).filter(peerId => {
            return peerId != null
                && peerId != this.address
                && peerId.trim() != "";
        });
    }

    getCurrentRound(peerId) {
        const playerRounds = this._rounds[peerId].currentRound;

        if(playerRounds)
            return playerRounds.currentRound;
        else return false;
    }

    getRounds(peerId) {
        let rounds_={}, data;
        if(!peerId)
            data = this._rounds[this.address];
        else
            data = this._rounds[peerId];

        if(!data || typeof data != 'object') {
            console.error("invalid rounds object", data);
        } else {
            // console.info("all rounds data:", data);

            for(let key in data) {
                if(/^\d+/.test(key))
                    rounds_[key] = data[key];
            }
        }

        return rounds_
    }

    getScore(peerId) {
        if(this._rounds[peerId])
            return this.playerData[peerId].score || 0;
    }

    getScores() {
        const scores = {};

        for(let key in this.playerData) {
            const value = this.playerData[key];
            
            scores[key] = value.score;
        }

        return scores;
    }
}

Multiplayer.prototype.establishChannel = establishChannel;
Multiplayer.prototype.sendHoprMessage = sendHoprMessage;
Multiplayer.prototype.getAddress = getAddress;

export default Multiplayer;
