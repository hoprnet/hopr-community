import React from 'react';

class Keyboard extends React.Component {
    constructor(props) {
        super();
        this.state = {
        }
        this.clickKey = this.clickKey.bind(this);
    }

    clickKey(key) {
        const game = this.props.game;
        const result = game.guessLetter(key);

        this.props.onGameUpdate(game);
    }

    render() {
        const keys = [];
        const game = this.props.game;

        for(let unicode = 97; unicode <= 122; unicode++) {
            const key = String.fromCharCode(unicode);

            keys.push(
                <button key={unicode}
                    className={
                        [
                            "keyboard__key",
                            ["keyboard__key", game.wrongGuesses.includes(key) ? "red" :
                                game.correctGuesses.includes(key) ? "green" : "unselected"].join('_'),
                        ].join(" ")
                    }
                    onClick={() => this.clickKey(key)}>
                    {key}
                </button>
            );
        }

        return (
            <div className='keyboard game__keyboard'>
                { keys }
            </div>
        );
    }
}

export default Keyboard
