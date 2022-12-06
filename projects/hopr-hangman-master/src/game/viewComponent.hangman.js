import React from 'react';
import pose1 from '../assets/hangman-drawings/pose1.png';
import pose2 from '../assets/hangman-drawings/pose2.png';
import eyes from '../assets/hangman-drawings/eyes.png';
import deadEyes from '../assets/hangman-drawings/eyes-dead.png';
import smile from '../assets/hangman-drawings/mouth-smile.png';
import mouthOpen from '../assets/hangman-drawings/mouth-open.png';

class Hangman extends React.Component {
    constructor(props) {
        super();

        this.state = {
            game: props.game
        }
    }

    render() {
        const game = this.state.game;
        return (
            <div className='game__hangman game-drawing'>
                <div className = 'game-drawing__hangman hangman'>
                    {game.incorrectGuesses < 6 ?
                        <img className='hangman__body' src={pose1} /> :
                        <img className='hangman__body' src={pose2} />
                    }

                    {game.incorrectGuesses < 4 && ([
                        <div className = 'hangman__face'>
                            <img className='hangman__eyes' src={eyes} />
                            <img className='hangman__mouth' src={smile} />
                        </div>
                    ])}

                    {game.incorrectGuesses >= 4 && ([
                        <div className = 'hangman__face'>
                            {game.incorrectGuesses > 6 ?
                                <img className='hangman__eyes' src={deadEyes} /> : 
                                <>
                                    <img className='hangman__eyes' src={eyes} />
                                    <img className='hangman__mouth' src={mouthOpen} />
                                </>
                            }
                        </div>
                    ])}
                </div>

                <svg className = 'gallows'>
                    {game.incorrectGuesses > 4 && 
                        <rect id='gallows__smallbeam' x='130' y='20' width='20' height='20' />
                    }
                    {game.incorrectGuesses > 3 && 
                        <path id='gallows__beam-support' x='55' y='20' fill="green" stroke="black" d="m100,20 L20,70 v-20 L70,20 h20 z" />
                    }
                    {game.incorrectGuesses > 2 && 
                        <rect id='gallows__hbeam' x='0' y='0' width='150' height='20' />
                    }
                    {game.incorrectGuesses > 1 && 
                        <rect id='gallows__vbeam' x='15' y='20' width='20' height='150' />
                    }
                    {game.incorrectGuesses > 0 && 
                        <rect id='gallows__base' x='0' y='130' width='50' height='20' />
                    }
                </svg>
            </div>
        );
    }
}

export default Hangman
