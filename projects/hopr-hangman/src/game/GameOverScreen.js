import React from 'react';

class GameOverScreen extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        const game = this.props.game;

        return (
            <div>
                <p>Game Over</p>

                <p>Your score: {game.score}</p>
            </div>
        );
    }
}

export default GameOverScreen;
