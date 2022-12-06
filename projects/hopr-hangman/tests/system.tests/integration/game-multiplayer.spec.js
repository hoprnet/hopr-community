import { expect } from 'chai';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import { makeMessage, fakeHoprAddress } from '../../helpers';
import config from '../../../src/config/config.js';
import Game from '../../../src/game/game';
import Multiplayer from '../../../src/game/multiplayer.js';
import { mockFetch } from '../../mocks.js';

describe("Multiplayer game (integration tests) - Parse message", function() {
    before(() => {
        config.restURL = 'http://localhost:3001';
        config.authCode = 'ofjieaw';
        mockFetch();
    });

    after(() => {
        sinon.restore();
    });

    it('If no multiplayer config is set, game.multiplayer should be null', function() {
        const game = new Game();

        expect(game.multiplayer).to.be.null;
    });

    it('If multiplayer instance receives "startGame" message, game should be inited properly', async function() {
        this.timeout(5000);
        const gameCreator = fakeHoprAddress();

        const configObj = {
            multiplayer: true,
            connectGame: true,
            gameCreator
        };

        const game = new Game(configObj);

        expect(game.loading).to.be.true;
        expect(game.answers).to.be.null;

        const answers = ['ajpoiw', 'jfoewa', 'jfwif', 'fjihaid', 'jfiq'];

        const players = [gameCreator, fakeHoprAddress()];

        const wsMessage = JSON.stringify({app: 'hangman', type: 'startGame', players, answers});

        return game.multiplayer.parseMessage(wsMessage)
            .then(() => {
                expect(game.loading).to.be.false;
                return game.startGame()
            }).then(() => {
                expect(game.answers).to.eql(answers);
                expect(game.answer).to.equal(answers[0]);
            })
    });

    it('If player is not game creator, game.loading should be true after game.setup', async function() {
        this.timeout(5000);
        const gameCreator = fakeHoprAddress();

        const configObj = {
            multiplayer: true,
            connectGame: true,
            gameCreator
        };

        const game = new Game(configObj);

        expect(game.loading).to.be.true;
        expect(game.answers).to.be.null;

        game.startGame();

        const answers = ['anfoiw', 'jfoewa', 'jfwif', 'fjihaid', 'jfiq'];

        const players = [gameCreator, fakeHoprAddress()];

        const wsMessage = JSON.stringify({app: 'hangman', type: 'startGame', players, answers});

        return game.multiplayer.parseMessage(wsMessage)
            .then(() => {
                expect(game.loading).to.be.false;
            })
    });

    it('If receiving startGame message, set game.answers to message.answers', function() {
        this.timeout(5000);
        const gameCreator = fakeHoprAddress();

        const configObj = {
            multiplayer: true,
            connectGame: true,
            gameCreator
        };

        const game = new Game(configObj);

        const answers = ['amfoiw', 'jfoewa', 'jfwif', 'fjihaid', 'jfiq'];

        const players = [gameCreator, fakeHoprAddress()];

        const wsMessage = JSON.stringify({app: 'hangman', type: 'startGame', players, answers});

        return game.multiplayer.parseMessage(wsMessage)
            .then(() => game.startGame())
            .then(() => {
                expect(game.answers).to.eql(answers);
                expect(game.answer).to.equal(answers[0]);
            })
    });

    it.skip('If receiving gameOver message, set game.gameover=true', function() {
        const game_id = 'faoiewf';
        const hoprAddr = process.env.REACT_APP_TEST_PEER_ID4;

        const multiplayer = new Multiplayer([process.env.REACT_APP_TEST_PEER_ID3, hoprAddr]);
        multiplayer.gameID = game_id;

        const roundData = makeMessage({peerId:hoprAddr,type: 'gameOver',game_id}, multiplayer);

        const wsMsg = JSON.stringify(roundData);

        const spy = sinon.stub(multiplayer, 'receiveRoundScores').resolves(true);

        return multiplayer.parseMessage(wsMsg)
            .then(() => {
                expect(game.gameOver).to.be.true;
            });
    });
});
