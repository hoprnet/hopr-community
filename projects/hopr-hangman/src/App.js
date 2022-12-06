import React from 'react';

import Home from './pages/Home.js';
import GameView from './game/GameBoard.js';
import Game from './game/game.js';

import config from './config/config.js';
import ConfigPanel from './config/configPanel.jsx';
import { isValidPeerId } from './utils';

import { getAddress } from './connectivity/hoprNode.js';
import useWebSocket from './connectivity/useWebSocket.js';

import { FaCog } from "react-icons/fa";

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            showGame: false,
            game: null,

            // Game data
            multiplayer: true,
            connectGame: false,
            otherPlayers: [],
            gameCreator: "",

            route: 'home',
            address: null,
            showConfig: false,
            errors: null,
            inputs: {
                newPlayer: "",
            }
        }

        this.startGame = this.startGame.bind(this);
        this.goHome = this.goHome.bind(this);
        this.setInput = this.setInput.bind(this);
        this.setError = this.setError.bind(this);
        this.unsetError = this.unsetError.bind(this);
        this.addNewPlayer = this.addNewPlayer.bind(this);
        this.loadAddress = this.loadAddress.bind(this);
    }

    setError(msg) {
        const errors = msg;

        this.setState({errors});
    }

    unsetError(msg) {
        this.setState({errors: null});
    }

    setInput(key, val) {
        const inputs = { ...this.state.inputs };
        inputs[key] = val;

        this.setState({inputs});
    }

    goHome() {
        this.setState({route: 'home'});
    }

    goTo(routeName) {
        this.setState({route: routeName});
    }

    startGame() {
        let errors = null;

        if(this.state.multiplayer) { // if is multiplayer, make sure there is at least one other player
            if(this.state.connectGame) {
                if(!this.state.gameCreator)
                    errors = "Set game creator address first or switch to single player mode"
            } else {
                if(this.state.otherPlayers.length == 0)
                    errors = "Add other players or switch to single player mode"
            }
        }

        this.setState({errors});

        if(!errors)
            this.setState({route:'game', showGame: true});
    }

    addNewPlayer(addr) {
        const otherPlayers = this.state.otherPlayers;
        addr = addr.replace(/\s+/, "");

        if(addr == "")
            return this.setError("Player address empty");
        if(!isValidPeerId(addr))
            return this.setError("Invalid Hopr Address");
        if(addr == this.state.address)
            return this.setError("Cannot add self. You are already in this game");
        if(this.state.otherPlayers.includes(addr))
            return this.setError("You have already added this player");

        else {
            otherPlayers.push(addr)
            this.setState({ otherPlayers });
            this.unsetError();
        }

        this.setInput('newPlayer', "");
    }

    loadAddress() {
        return getAddress()
            .then(res => {
                this.setState({ address: res })
            })
            .catch(e => {
                console.error('failed to fetch address');
            });
    }

    componentDidMount() {
        return this.loadAddress();
    }

    render() {
        const route = this.state.route;
        const hoprAddress = this.state.address;

        let menu = (
            <button className='link' onClick={this.goHome}>Back to Home</button>
        );

        // Home
        let view = (
            <div className="App page page_home">
                <div className='navbar'>
                    <button className='link navbar__link navbar__link_settings' onClick={() => this.setState({showConfig: true})}><FaCog /></button>
                </div>
                <p className='page__title'>Hopr Hangman</p>
                { this.state.showConfig == true &&
                    <ConfigPanel className='page__modal' onSave={this.loadAddress} handleClose={() => this.setState({showConfig: false})}/>
                }

                { this.state.errors && <p className='notice notice_error page__element'>{this.state.errors}</p> }

                <div className='group_small-gap group_flex group_flex_center page__element'>
                    <button className={'button button_selector ' +
                        (!this.state.multiplayer && 'button_selector_active')}
                        onClick={() => this.setState({multiplayer: false})}>Play Alone</button>
                    <button className={'button button_selector ' +
                        (this.state.multiplayer && !this.state.connectGame && 'button_selector_active')}
                        onClick={() => this.setState({multiplayer: true, connectGame: false})}>Play with other players</button>
                    <button className={'button button_selector ' + (this.state.multiplayer && this.state.connectGame && 'button_selector_active')} onClick={() => this.setState({multiplayer: true, connectGame: true})}>Connect to game</button>
                </div>

                {
                    this.state.multiplayer && (
                        <div className='page__element'>
                        {!this.state.connectGame && (
                            <div>
                                <p>
                                    <span>Player 1 (You): </span>
                                    <span>{this.state.address}</span>
                                </p>
                                {
                                    this.state.otherPlayers.map((addr, index) => {
                                        return (
                                            <p key={'player-' + index}>
                                                <span>Player {index + 2}: </span>
                                                <span>{addr}</span>
                                            </p>
                                        );
                                    })
                                }
                                <label className='input-group'>
                                    <span className=' input-group__label'>Player Hopr Address: </span>
                                    <input type='text' placeholder='PeerID'
                                        className = 'input-group__input'
                                        value={this.state.inputs.newPlayer}
                                        onChange={(e) => this.setInput('newPlayer', e.target.value)}
                                    />
                                </label>
                                <button className='button page__element' onClick={() => {this.addNewPlayer(this.state.inputs.newPlayer)}}>Add New Player</button>
                            </div>
                        )}

                        {this.state.connectGame && (
                            <div className='page__element'>
                                <p>Your Hopr Address: { hoprAddress }</p>
                                <label className='input-group'>
                                    <span className='input-group__label'>Enter address: </span>
                                    <input type='text' placeholder='Game creator peer id'
                                        className="input-group__input"
                                        value={this.state.gameCreator}
                                        onChange={(e) => this.setState({gameCreator: e.target.value})}
                                    />
                                </label>
                            </div>
                        )}
                        </div>
                    )
                }
                <div className='page__element'>
                    <button className='button button_primary page__start-button' onClick={this.startGame}>Start Game</button>
                </div>
            </div>
        );

        if(route == 'game') {
            view = [
                menu,
                <GameView
                    config={{
                        multiplayer: this.state.multiplayer,
                        connectGame: this.state.connectGame,
                        otherPlayers: this.state.otherPlayers,
                        gameCreator: this.state.gameCreator
                    }}

                    otherPlayers={
                        this.state.multiplayer ? 
                            this.state.otherPlayers : null
                    }
                    gameCreator={this.state.gameCreator}
                />
            ];
        }

        return (
            <div className="App">
            {view}
            </div>
        );
    }
}

export default App;
