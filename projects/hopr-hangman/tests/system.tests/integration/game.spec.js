import { expect } from 'chai';
import Game from '../../../src/game/game';
import sowpodslist from '../../../src/wordlists/sowpods.js';
import { mockFetch } from '../../mocks.js';
import sinon from 'sinon';

describe('Game', function() {
    after(() => {
        sinon.restore();
    });

    it('After 8 wrong guesses, start new round', async function() {
        const game = new Game();
        await game.startGame();
        game.answer = 'foobar';

        ['a', 'b', 'e', 'f', 'g', 'z', 'i', 'k', 'p', 'q']
            .forEach(letter => {
                game.guessLetter(letter)
                expect(game.round).to.equal(1);
            });

        game.guessLetter('m');
        expect(game.round).to.equal(2);
    });

    it('View previous round words and guesses', async function() {
        mockFetch();

        const game = new Game();
        await game.startGame();

        game.answer = 'foobar';

        game.guessLetter('i');

        'foobar'.split("").forEach(letter =>
            game.guessLetter(letter));
        console.log('game round:', game.round);

        expect(game.rounds).to.have.lengthOf(1);
        expect(game.rounds[0]).to.contain({
            word: 'foobar',
            guess: 'foobar',
            roundScore: 5,
        });

        game.answer = 'chocolate';

        "chocmingpqrl".split("").forEach(letter =>
            game.guessLetter(letter));

        expect(game.rounds).to.have.lengthOf(2);

        expect(game.rounds[0]).to.contain({
            word: 'foobar',
            guess: 'foobar',
            gameScore: 5,
            roundScore: 5,
        });
        expect(game.rounds[1]).to.contain({
            word: 'chocolate',
            guess: 'choco____',
            roundScore: 0,
            gameScore: 5
        });
    });
});
