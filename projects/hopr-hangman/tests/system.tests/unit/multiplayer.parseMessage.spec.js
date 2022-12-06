import { expect } from 'chai';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import { makeMessage } from '../../helpers';
import Multiplayer from '../../../src/game/multiplayer.js';
import { mockFetch } from '../../mocks.js';
import { fakeHoprAddress } from '../../helpers';

describe("Multiplayer (unit tests) - Parse message", function() {
    before(() => {
        sinon.restore();
        mockFetch();
    });

    after(() => {
        sinon.restore();
    });

    it('If message is startGame but player is gameCreator, do not call setPlayers', function() {
        const ownAddress = fakeHoprAddress();
        const gameCreator = ownAddress;

        const otherPlayers = [
            fakeHoprAddress(), fakeHoprAddress(), fakeHoprAddress(), fakeHoprAddress(),
        ]

        const players = [
            ...otherPlayers, gameCreator
        ]


        const multiplayer1 = new Multiplayer(players);
        sinon.stub(multiplayer1, 'getAddress').resolves(gameCreator);

        const wsMsg = {app: 'hangman', type: 'startGame', players};

        const spy1 = sinon.stub(multiplayer1, 'setPlayers');

        return multiplayer1.parseMessage(wsMsg)
            .then(() => sinon.assert.notCalled(spy1))
    });

    it('If message is startGame, call savePlayerData', function() {
        const ownAddress = fakeHoprAddress();
        const gameCreator = ownAddress;

        const otherPlayers = [
            fakeHoprAddress(), fakeHoprAddress(), fakeHoprAddress(), fakeHoprAddress(),
        ]

        const players = [
            ...otherPlayers, gameCreator
        ]

        const multiplayer1 = new Multiplayer(undefined, gameCreator);
        sinon.stub(multiplayer1, 'getAddress').resolves(otherPlayers[2]);

        const multiplayer2 = new Multiplayer([], gameCreator);
        sinon.stub(multiplayer2, 'getAddress').resolves(otherPlayers[1]);

        const multiplayer3 = new Multiplayer(null, gameCreator);
        sinon.stub(multiplayer3, 'getAddress').resolves(otherPlayers[3]);

        const wsMsg = {app: 'hangman', type: 'startGame', players};

        const spy1 = sinon.stub(multiplayer1, 'setPlayers');
        const spy2 = sinon.stub(multiplayer2, 'setPlayers');
        const spy3 = sinon.stub(multiplayer3, 'setPlayers');

        // Start multiplayer games
        return multiplayer1.start()
            .then(multiplayer2.start())
            .then(multiplayer3.start())


        // Parse multiplayer messages
            .then(() => {
                // Reset spies in case there were any calls in .start()
                spy1.resetHistory();
                spy2.resetHistory();
                spy3.resetHistory();

                return multiplayer1.parseMessage(wsMsg)
                    .then(() => multiplayer2.parseMessage(wsMsg))
                    .then(() => multiplayer3.parseMessage(wsMsg))
            })
            .then(() => {
                sinon.assert.calledWith(spy1, players);
                sinon.assert.calledWith(spy2, players);
                sinon.assert.calledWith(spy3, players);
            });
    });

    it('If message is startGame, save answers in message', function() {
        const ownAddress = fakeHoprAddress();
        const gameCreator = ownAddress;

        const otherPlayers = [
            fakeHoprAddress(), fakeHoprAddress()
        ]

        const players = [
            ...otherPlayers, gameCreator
        ]

        const answers = ['amdfw', 'wjieofa', 'fjowiefa', 'jfwie', 'ejfowaa'];


        const m0 = new Multiplayer(players);
        sinon.stub(m0, 'getAddress').resolves(gameCreator);

        const m1 = new Multiplayer(null, gameCreator);
        sinon.stub(m1, 'getAddress').resolves(otherPlayers[0]);

        const wsMsg = {app: 'hangman', type: 'startGame', players, answers};

        return m1.parseMessage(wsMsg)
            .then(() => expect(m1.answers).to.eql(answers))
            .then(() => m0.parseMessage(wsMsg))
            .then(() => expect(m0.answers).to.not.eql(answers))
    });

    it('If message is startGame, but gameId in message matches multiplayer gameID,' +
        "don't callsavePlayerData and do not save answers anymore", function() {
        const ownAddress = fakeHoprAddress();
        const gameCreator = ownAddress;

        const gameID = 'ajfo-weafo-wnva';

        const otherPlayers = [
            fakeHoprAddress(), fakeHoprAddress(), fakeHoprAddress(), fakeHoprAddress(),
        ]

        const players = [
            ...otherPlayers, gameCreator
        ]

        const multiplayer1 = new Multiplayer(undefined, gameCreator);
        sinon.stub(multiplayer1, 'getAddress').resolves(otherPlayers[2]);

        const multiplayer2 = new Multiplayer([], gameCreator);
        sinon.stub(multiplayer2, 'getAddress').resolves(otherPlayers[1]);

        const multiplayer3 = new Multiplayer(null, gameCreator);
        sinon.stub(multiplayer3, 'getAddress').resolves(otherPlayers[3]);

        multiplayer1.gameID = gameID;
        multiplayer2.gameID = gameID;
        multiplayer3.gameID = gameID;

        const wsMsg = {app: 'hangman', type: 'startGame', players, 'game_id': gameID};

        const spy1 = sinon.stub(multiplayer1, 'setPlayers');
        const spy2 = sinon.stub(multiplayer2, 'setPlayers');
        const spy3 = sinon.stub(multiplayer3, 'setPlayers');

        // Start multiplayer games
        return multiplayer1.start()
            .then(multiplayer2.start())
            .then(multiplayer3.start())


        // Parse multiplayer messages
            .then(() => {
                // Reset spies in case there were any calls in .start()
                spy1.resetHistory();
                spy2.resetHistory();
                spy3.resetHistory();

                return multiplayer1.parseMessage(wsMsg)
                    .then(() => multiplayer2.parseMessage(wsMsg))
                    .then(() => multiplayer3.parseMessage(wsMsg))
                    .then(() => multiplayer1.parseMessage(wsMsg))
                    .then(() => multiplayer2.parseMessage(wsMsg))
                    .then(() => multiplayer3.parseMessage(wsMsg))
            })
            .then(() => {
                sinon.assert.notCalled(spy1);
                sinon.assert.notCalled(spy3);
                sinon.assert.notCalled(spy2);
            });
    });

    it('If message is roundData, call saveRound', function() {
        const player2 = fakeHoprAddress();

        const multiplayer = new Multiplayer([player2]);
        multiplayer.gameID = 'fjowiefja23';

        const wsMsg = {game_id: multiplayer.gameID,
            num:3, guess:"______",word:"fogles",
            roundScore:0, app:'hangman', gameScore: 7, type: 'roundData', peerId: player2};

        const spy = sinon.stub(multiplayer, 'saveRound');

        return multiplayer.parseMessage(wsMsg)
            .then(() => {
                console.log("round data:", wsMsg);
                sinon.assert.called(spy);
                sinon.assert.calledWith(spy, sinon.match(wsMsg));
            });
    });

    it("If message has no property type: 'roundData'", function() {
        const multiplayer = new Multiplayer([fakeHoprAddress()]);

        const wsMsg = {guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7};

        const spy = sinon.stub(multiplayer, 'receiveRoundScores').resolves(true);

        return multiplayer.parseMessage(wsMsg)
            .then(() => {
                sinon.assert.notCalled(spy);
            });
    });

    it("If message has property ('type', 'roundData'), call receiveRoundScores", function() {
        const game_id = 'faoiewf';

        const multiplayer = new Multiplayer([fakeHoprAddress()]);
        multiplayer.gameID = game_id;

        const wsMsg = {guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData', game_id};

        const spy = sinon.stub(multiplayer, 'receiveRoundScores').resolves(true);

        return multiplayer.parseMessage(wsMsg)
            .then(() => {
                sinon.assert.calledWith(spy, wsMsg);
            });
    });

    it('If receiving gameOver message, set gameover for player that sent it', function() {
        const game_id = 'faoiewf';
        const hoprAddr = fakeHoprAddress();

        const multiplayer = new Multiplayer([fakeHoprAddress(), hoprAddr]);
        multiplayer.gameID = game_id;

        const wsMsg = makeMessage({peerId:hoprAddr,type: 'gameOver',game_id}, multiplayer);

        const spy = sinon.stub(multiplayer, 'receiveRoundScores').resolves(true);

        return multiplayer.parseMessage(wsMsg)
            .then(() => {
                expect(multiplayer.playerData[hoprAddr]).to.have.property('gameOver', true);
            });
    });
});
