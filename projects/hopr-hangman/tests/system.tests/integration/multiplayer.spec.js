import { expect } from 'chai';
import sinon from 'sinon';
import Multiplayer from '../../../src/game/multiplayer.js';
import { getChannels } from '../../../src/connectivity/hoprNode.js';
import config from '../../../src/config/config.js';

describe("Multiplayer (integration tests)", function() {
    before(() => {
        config.restURL = process.env.REACT_APP_TEST_NODE_HTTP_URL1;
        config.authToken = process.env.REACT_APP_TEST_SECURITY_TOKEN;
    });

    beforeEach((done) => {
        setTimeout(() => done(), 300);
    });

    it('If otherPlayers == null, do not carry out any actions');

    it('If otherPlayers == [], do not carry out any actions');

    it('CreateGame: should open channels to all other players', function() {
        this.timeout(10000);
        const p2 = process.env.REACT_APP_TEST_PEER_ID2,
            p3 = process.env.REACT_APP_TEST_PEER_ID3,
            p4 = process.env.REACT_APP_TEST_PEER_ID4,
            p5 = process.env.REACT_APP_TEST_PEER_ID5;

        const otherPlayers = [p2, p3, p4, p5];

        const multiplayer = new Multiplayer(otherPlayers);

        return multiplayer.createGame()
            .then(res => {
                console.log("create game done");
                expect(res).to.be.ok;
                return getChannels()
            }).then(res => {
                console.log("res:", res);
                console.log("res:", res.incoming);
                expect(res.incoming.map(ch => ch.peerId)).to.include.members(otherPlayers);
            });
    });

    it('ConnectGame: Open channel to game creator', function() {
        const creator = process.env.REACT_APP_TEST_PEER_ID2;
        const multiplayer = new Multiplayer(null, creator);

        // return expect(multiplayer.connectGame(creator)).to.be.fulfilled
        return expect(multiplayer.start()).to.be.fulfilled
            .then(() => {
                return getChannels()
            }).then(res => {
                expect(res.incoming.map(ch => ch.peerId)).to.include.members([creator]);
            });
    });

    describe("Parse message:", function() {
        describe("If message is a json obj", function() {
            it('If message is roundData, save to playerData', function() {
                console.log("testing...");
                const player2 = process.env.REACT_APP_TEST_PEER_ID2;

                const multiplayer = new Multiplayer([player2]);
                console.log('game id:', multiplayer.gameID);

                const wsMsg = {num:3, game_id:multiplayer.gameID, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData', peerId: player2};

                return multiplayer.parseMessage(wsMsg)
                    .then(() => {
                        expect(multiplayer.getRounds(player2)).to.have.property("3");
                    });
            });
        });
    });
});
