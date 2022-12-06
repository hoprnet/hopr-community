import sowpodslist from '../wordlists/sowpods';
import { randomWord } from './words';
import { sendHoprMessage, establishChannel } from '../connectivity/hoprNode.js';
import Multiplayer from './multiplayer.js';

const MAX_SCORE=5;

class Game {
    repeatedWord = false
    _word = null;
    _currentRound = 1;
    _score = 0;
    rounds = [];
    isGameCreator=false;
    _gameOver=false;

    constructor(otherConfig={}) {
        this.gameStarted = false;
        this.config = otherConfig;
        this.otherPlayers = otherConfig.otherPlayers || [];
        this.gameCreator = otherConfig.gameCreator;

        this.initGame();
    }

    get answers() {
        if(this.multiplayer && this.multiplayer.answers)
            return this.multiplayer.answers;

        else return null;
    }

    get loading() {
        return !this.isReady;
    }

    get isReady() {
        if(this.multiplayer) {
            return this.multiplayer.isReady;
        } else
            return true;
    }

    async startGame() {
        if(this.gameStarted == false) {
            console.log('starting game');
            if(this.multiplayer) {
                console.log("starting multiplayer");
                await this.multiplayer.start()
            }

            if(this.isReady) {
                // Initialise first round
                this.initRound();

                this.gameStarted = true
            }
        }

        console.log('game started?', this.gameStarted);
        return Promise.resolve(this.gameStarted);
    }

    generateAnswers() {
        let answers = [];

        let answer_ = randomWord(this.wordlist);

        while(this.repeatedWord == true || answers.length < 5) {
            answer_ = randomWord(this.wordlist);
            if(!this.repeatedWord)
                answers.push(answer_);
        }

        return answers;
    }

    initGame() {
        this.wordlist = sowpodslist;
        this.pastAnswers = [];
        this.gameOverAction = () => Promise.resolve(true);
        this.roundOverAction = () => Promise.resolve(true);
        this._currentRound = 0;

        // Setup Multiplayer instance
        if(this.gameCreator || (this.otherPlayers && this.otherPlayers.length > 0)) {
            this.multiplayer = new Multiplayer(this.otherPlayers, this.gameCreator);
            if(this.multiplayer.isGameCreator) {
                const answers = this.generateAnswers();
                this.multiplayer.answers = answers;
            }
        } else this.multiplayer = null;
    }

    initRound() {
        if(!this._gameOver) {
            this.word = null;
            if(this.answers)
                this.answer = this.answers[this._currentRound];
            else {
                this.answer = randomWord(this.wordlist);

                while(this.repeatedWord == true) {
                    this.answer = randomWord(this.wordlist);
                }
            }

            this._currentRound++;
            this.wrongGuesses = [];
            this.correctGuesses = [];
        }
    }

    get round() {
        return this._currentRound;
    }

    get roundData() {
        return {
            num: this._currentRound,
            app: 'hangman',
            type: 'roundData',
            guess: this.word,
            word: this.answer,
            gameScore: this.score,
        };
    }

    newRound(roundScore=0) {
        if(!this._gameOver) {
            const roundData = this.roundData;
            this.rounds.push({...roundData, roundScore});

            if(this._currentRound > 0) {
                this.roundOver(roundData);
            }

            if(this._currentRound < 5)
                this.initRound();
            else this.endGame();
        }
    }

    sendRoundData(roundData) {
        if(this.multiplayer)
            return this.multiplayer.sendRoundScores(roundData);
        else return Promise.resolve(true);
    }

    get score() {
        return this._score;
    }
    set score(val) {
        this._score = val;
    }

    get answer() {
        if(this.answers) {
            const answer = this.answers[this._currentRound - 1];

            if(answer)
                return answer;
        }
        else
            return this._answer;
    }
    set answer(val) {
        if(this.pastAnswers.includes(val)) {
            this.repeatedWord = true;
        } else {
            this.repeatedWord = false;
            this.pastAnswers.push(val);
        }

        this._answer = val;
        this.word = null;
    }

    // Returns word with "unguessed" letters as underscores
    get word() {
        if(this._word)
            return this._word;

        let _word = '';

        for(let i = 0; i < this.answer.length; i++) {
            _word += '_';
        }

        return _word;
    }

    // If player guesses word correctly, start new round
    set word(val) {
        this._word = val;
    }

    get incorrectGuesses() {
        let wrongGuesses = this.wrongGuesses || [];
        return wrongGuesses.length;
    }
    // If player has too many incorrect guesses (8), start new round
    set incorrectGuesses(val) {
        this._incorrectGuesses = val;
        if(val == 8)
            this.newRound();
    }

    guessLetter(letter) {
        if(this.correctGuesses.includes(letter))
            return true;
        if(this.wrongGuesses.includes(letter))
            return false;

        if(!this._gameOver) {
            const answer = this.answer;
            let isCorrect = false;

            let word = "";

            for(let i=0; i<this.answer.length; i++) {
                const currentLetter = this.word[i];

                // ie, if letter has already been guessed
                if(currentLetter && currentLetter != '_') {
                    word += currentLetter
                    // isCorrect = null;
                    // break;
                }
                else {
                    if(letter == answer[i]) {
                        word += letter;
                        isCorrect = true;
                    } else {
                        // isCorrect =  false;
                        word += '_';
                    }
                }
            }

            this.word = word;
            if(isCorrect === true)
                this.correctGuesses.push(letter);
            if(isCorrect === false) {
                this.wrongGuesses.push(letter);
            }

            if(this.incorrectGuesses == 8)
                this.newRound();
            else if(this.word === this.answer) {
                let roundScore_ = MAX_SCORE;

                if(this.incorrectGuesses > 3)
                    roundScore_ = roundScore_ - (this.incorrectGuesses - 3);

                this.score += roundScore_;
                // this.roundScore = roundScore_
                this.newRound(roundScore_);
            }

            return isCorrect;
        } else return null;
    }

    onGameOver(cb) {
        this.gameOverAction = cb;
    }

    get gameOver() {
        return this._gameOver;
    }

    endGame() {
        this._gameOver = true;

        return Promise.resolve(true)
            .then(() => {
                if(this.multiplayer)
                    return this.multiplayer.sendGameOver({score: this.score})
                else return Promise.resolve(true);
            })
            .then(() =>this.gameOverAction());
    }

    onRoundOver(cb) {
        this.roundOverAction = cb;
    }

    roundOver(roundData) {
        return Promise.resolve(true)
            .then(() => this.sendRoundData(roundData))
            .then(() => this.roundOverAction());
    }
}

export default Game;
