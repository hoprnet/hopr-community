import React from 'react';

class Word extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        const word = this.props.game.word;
        return (
            <div className='game-word game__word'>
                {word.split("").map(letter => {
                    return <div class='game-word__letter'>
                        {letter}
                    </div>
                })}
            </div>
        );
    }
}

export default Word
