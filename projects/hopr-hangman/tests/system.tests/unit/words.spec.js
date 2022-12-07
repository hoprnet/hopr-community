import { expect } from 'chai';
import * as words from '../../../src/game/words';

describe('Words and Phrases (unit tests)', function() {
    it('randomWord(): Returns random word', function() {
        const wordlist = ['feeee', 'fi', 'foh', 'fum'];

        const randomWord = words.randomWord(wordlist);
        expect(randomWord).to.be.oneOf(wordlist);
    });

    it('GuessLetter(): should return false if letter is wrong', function() {
        const word = 'foobar';

        const letters = ['c', 'd', 'e', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

        letters.forEach((letter) => {
            expect(words.guessLetter(letter, word)).to.equal(false);
        });
    });

    it('GuessLetter(): should return position(s) of letter if letter is in word', function() {
        const word = 'foobar';

        expect(words.guessLetter('f', word)).to.eql([0]);
        expect(words.guessLetter('b', word)).to.eql([3]);
        expect(words.guessLetter('o', word)).to.eql([1,2]);
        expect(words.guessLetter('a', word)).to.eql([4]);
        expect(words.guessLetter('r', word)).to.eql([5]);

        expect(words.guessLetter('e', 'brethren')).to.eql([2, 6]);
    });
});
