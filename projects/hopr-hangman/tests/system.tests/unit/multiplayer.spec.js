import { expect } from 'chai';
import sinon from 'sinon';

import { faker } from '@faker-js/faker';
import { fakeHoprAddress } from '../../helpers';
import Multiplayer from '../../../src/game/multiplayer.js';

describe("Multiplayer (unit tests)", function() {
    it('If otherPlayers == null, do not carry out any actions');

    it('Start(): If user is gameCreator, create gameID', function() {
        const ownAddress = fakeHoprAddress();
        const gameCreator = ownAddress;

        const p4 = fakeHoprAddress(),
            p5 = fakeHoprAddress();

        const otherPlayers = [
            p4, p5
        ]

        const multiplayer = new Multiplayer(otherPlayers);
        expect(ownAddress == gameCreator);// Sanity check

        sinon.stub(multiplayer, 'getAddress').resolves(ownAddress);

        const createGame = sinon.stub(multiplayer, 'createGame').resolves(true);

        expect(multiplayer.gameID).to.be.a('string');
        expect(multiplayer.gameID).to.not.be.empty;
        expect(multiplayer.gameID).to.not.be.null;
        expect(multiplayer.gameID).to.not.be.undefined;
    });

    it('Start(): Do not allow double calls', function() {
        const gameCreator = fakeHoprAddress();

        const p2 = fakeHoprAddress();

        const otherPlayers = [
            p2, fakeHoprAddress()
        ]

        const multiplayer1 = new Multiplayer(otherPlayers);
        sinon.stub(multiplayer1, 'getAddress').resolves(gameCreator);

        const multiplayer2 = new Multiplayer(null, gameCreator);
        sinon.stub(multiplayer2, 'getAddress').resolves(p2);

        const spy1 = sinon.stub(multiplayer1, 'createGame').resolves(true);
        const spy2 = sinon.stub(multiplayer2, 'connectGame').resolves(true);

        return Promise.all([
            multiplayer1.start(),
            multiplayer1.start(),
            multiplayer2.start(),
            multiplayer2.start(),
        ])
            .then(() => {

                sinon.assert.calledOnce(spy1);
                sinon.assert.calledOnce(spy2);
            });
    });

    it('Start(): If gameCreator is user, call createGame', function() {
        const ownAddress = fakeHoprAddress();
        const gameCreator = ownAddress;

        const p4 = fakeHoprAddress(),
            p5 = fakeHoprAddress();

        const otherPlayers = [
            p4, p5
        ]

        const multiplayer = new Multiplayer(otherPlayers, gameCreator);

        sinon.stub(multiplayer, 'getAddress').resolves(ownAddress);

        const createGame = sinon.stub(multiplayer, 'createGame').resolves(true);
        const shouldNotBeCalled = sinon.stub(multiplayer, 'connectGame').resolves(true);

        expect(ownAddress == gameCreator);// Sanity check

        return expect(multiplayer.start()).to.be.fulfilled
            .then(() => {
                sinon.assert.called(createGame);
                sinon.assert.notCalled(shouldNotBeCalled);
            })
    });

    it('isReady: If multiplayer.answers is not set, return false', function() {
        const gameCreator = fakeHoprAddress();
        const otherPlayers = [fakeHoprAddress(), fakeHoprAddress()]

        const multiplayer = new Multiplayer([], gameCreator);

        expect(multiplayer.isReady).to.be.false;
    });

    it('Start(): After starting game, set playerData for self', function() {
        const p1 = fakeHoprAddress();

        const p2 = fakeHoprAddress(),
            p3 = fakeHoprAddress();

        const otherPlayers = [
            p2, p3
        ]

        const m1 = new Multiplayer(otherPlayers); // Game creator
        sinon.stub(m1, 'getAddress').resolves(p1);
        sinon.stub(m1, 'establishChannel').resolves(true);
        sinon.stub(m1, 'sendHoprMessage').resolves(true);

        const m2 = new Multiplayer([], p1); // Is joining game
        sinon.stub(m2, 'getAddress').resolves(p2);
        sinon.stub(m2, 'establishChannel').resolves(true);
        sinon.stub(m2, 'sendHoprMessage').resolves(true);

        return m1.start()
            .then(() => {
                expect(m1.playerData).to.have.property(p1);
            })
    });

    it('Start(): If gameCreator is user, send addresses of all players to all users', function() {
        this.timeout(5000);
        const ownAddress = fakeHoprAddress();
        const gameCreator = ownAddress;

        const p3 = fakeHoprAddress(),
            p4 = fakeHoprAddress(),
            p5 = fakeHoprAddress();

        const otherPlayers = [
            p3, p4, p5
        ]

        const multiplayer = new Multiplayer(otherPlayers);

        const spy = sinon.stub(multiplayer, 'sendHoprMessage').resolves(true);
        sinon.stub(multiplayer, 'establishChannel').resolves(true);
        sinon.stub(multiplayer, 'getAddress').resolves(ownAddress);

        expect(ownAddress == gameCreator);// Sanity check

        return expect(multiplayer.start()).to.be.fulfilled
            .then(() => {
                otherPlayers.forEach(peerId => {
                    expect(peerId).to.be.a('string');
                    expect(spy.withArgs(peerId, sinon.match.has('players',
                        sinon.match.array.deepEquals([...otherPlayers, gameCreator]))).callCount)
                        .to.equal(1, "Send message only once");

                    // sinon.assert.calledWith(spy, peerId, sinon.match.has('players'));
                    sinon.assert.calledWith(spy, peerId, sinon.match.has('players',
                        sinon.match.array.deepEquals([...otherPlayers, gameCreator])));
                })
            })
    });

    it.only('Start(): If gameCreator is user, send "startGame" message every fifteen seconds for five minutes after game starts', function() {
        this.timeout(9000);

        const clock = sinon.useFakeTimers(new Date());

        const ownAddress = fakeHoprAddress();
        const gameCreator = ownAddress;

        const p3 = fakeHoprAddress(),
            p4 = fakeHoprAddress(),
            p5 = fakeHoprAddress();

        const otherPlayers = [
            p3, p4, p5
        ]

        const multiplayer = new Multiplayer(otherPlayers);

        const generalSpy = sinon.stub(multiplayer, 'sendHoprMessage').resolves(true);
        sinon.stub(multiplayer, 'establishChannel').resolves(true);
        sinon.stub(multiplayer, 'getAddress').resolves(ownAddress);

        expect(ownAddress == gameCreator);// Sanity check

        // return expect(multiplayer.start()).to.be.fulfilled
        multiplayer.start()

        return Promise.all(
            [
               // {timeJump_s: 16, expectedCallCount: 1},
                // {timeJump_s: 31, expectedCallCount: 2},
                {timeJump_s: 61, expectedCallCount: 4},
                {timeJump_s: 180, expectedCallCount: 12},
                {timeJump_s: 301, expectedCallCount: 20},
            ].map(({timeJump_s, expectedCallCount}) => {
                return clock.tickAsync(timeJump_s * 1000)
                    .then(() => {
                        otherPlayers.forEach(peerId => {
                            expect(peerId).to.be.a('string');

                            const spy = generalSpy.withArgs(peerId);

                            /*
                    sinon.assert.calledWith(spy, peerId, sinon.match.has('players',
                        sinon.match.array.deepEquals([...otherPlayers, gameCreator])));
                        */

                            sinon.assert.callCount(spy.withArgs(peerId, sinon.match.has('type', 'startGame')), expectedCallCount);
                        })
                    })
            }))
            .then(() => clock.restore());
    });

    it.skip('AllowNewRound should return false if any players are more than one round behind', function() {
        const ownAddress = fakeHoprAddress();
        const gameCreator = ownAddress;

        const multiplayer = new Multiplayer([fakeHoprAddress()]);

        sinon.stub(multiplayer, 'getAddress').resolves(ownAddress);

        const randRoundData = {num:1, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData'};

        const p2 = fakeHoprAddress(),
            p3 = fakeHoprAddress(),
            p4 = fakeHoprAddress();

        multiplayer.saveRound({...randRoundData, peerId: gameCreator, num: 3})
        multiplayer.saveRound({...randRoundData, peerId: p2, num: 1})
        multiplayer.saveRound({...randRoundData, peerId: p3, num: 2})
        multiplayer.saveRound({...randRoundData, peerId: p4, num: 3})

        expect(multiplayer.allowNewRound).to.be.false;
    });

    it.skip('AllowNewRound should return true if all players are at same round', function() {
        const ownAddress = fakeHoprAddress();
        const gameCreator = ownAddress;

        const multiplayer = new Multiplayer([fakeHoprAddress()]);

        sinon.stub(multiplayer, 'getAddress').resolves(ownAddress);

        const p2 = fakeHoprAddress(),
            p3 = fakeHoprAddress(),
            p4 = fakeHoprAddress();

        const randRoundData = {num:1, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData'};
        multiplayer.saveRound({...randRoundData, peerId: gameCreator, num: 3})
        multiplayer.saveRound({...randRoundData, peerId: p2, num: 1})
        multiplayer.saveRound({...randRoundData, peerId: p3, num: 2})
        multiplayer.saveRound({...randRoundData, peerId: p4, num: 3})

        expect(multiplayer.allowNewRound).to.be.true;
    });

    it('Start(): If gameCreator is another player, call connectGame', function() {
        const ownAddress = fakeHoprAddress();
        const gameCreator = fakeHoprAddress();

        const otherPlayers = [
            gameCreator,
            fakeHoprAddress(),
            fakeHoprAddress()
        ]

        const multiplayer = new Multiplayer(otherPlayers, gameCreator);

        const connectGame = sinon.stub(multiplayer, 'connectGame').resolves(true);
        const shouldNotBeCalled = sinon.stub(multiplayer, 'createGame').resolves(true);

        sinon.stub(multiplayer, 'getAddress').resolves(ownAddress);
        expect(ownAddress).to.not.equal(gameCreator); // Sanity check

        return expect(multiplayer.start()).to.be.fulfilled
            .then(() => {
                sinon.assert.calledWith(connectGame, gameCreator);
                sinon.assert.notCalled(shouldNotBeCalled);
            })
    });

    it('CreateGame: should establishChannel() to all other players', function() {
        this.timeout(9000);
        const p2 = fakeHoprAddress(),
            p3 = fakeHoprAddress(),
            p4 = fakeHoprAddress(),
            p5 = fakeHoprAddress();

        const otherPlayers = [
            p2, p3, p4, p5
        ]

        const multiplayer = new Multiplayer(otherPlayers);

        const spy = sinon.stub(multiplayer, 'establishChannel').resolves(true);
        sinon.stub(multiplayer, 'sendHoprMessage').resolves(true);

        return multiplayer.createGame()
            .then(() => {
                sinon.assert.called(spy);

                sinon.assert.calledWith(spy, p2)
                expect(spy.withArgs(p2).callCount).to.equal(1);

                sinon.assert.calledWith(spy, p3)
                expect(spy.withArgs(p3).callCount).to.equal(1);

                sinon.assert.calledWith(spy, p4)
                expect(spy.withArgs(p4).callCount).to.equal(1);

                sinon.assert.calledWith(spy, p5)
                expect(spy.withArgs(p5).callCount).to.equal(1);

            });
    });

    it('CreateGame: should send startGame message with game ID', function() {
        this.timeout(5000);
        const p2 = fakeHoprAddress(),
            p3 = fakeHoprAddress(),
            p4 = fakeHoprAddress(),
            p5 = fakeHoprAddress();

        const otherPlayers = [
            p2, p3, p4, p5
        ]

        const multiplayer = new Multiplayer(otherPlayers);
        const gameID = "jofwjeaf";
        multiplayer.gameID = gameID;

        sinon.stub(multiplayer, 'establishChannel').resolves(true);
        const spy = sinon.stub(multiplayer, 'sendHoprMessage').resolves(true);

        return multiplayer.createGame()
            .then(() => {
                sinon.assert.called(spy);
                sinon.assert.calledWith(spy, p2, sinon.match.has('game_id', gameID))
                expect(spy.withArgs(p2, sinon.match.has('game_id', gameID)).callCount).to.equal(1);

                sinon.assert.calledWith(spy, p3, sinon.match.has('game_id', gameID))
                sinon.assert.calledWith(spy, p4, sinon.match.has('game_id', gameID))
                sinon.assert.calledWith(spy, p5, sinon.match.has('game_id', gameID))
            });
    });

    it('CreateGame: if establishChannel() throws because channel is open, continue', function() {
        this.timeout(5000);

        const p2 = fakeHoprAddress(),
            p3 = fakeHoprAddress(),
            p4 = fakeHoprAddress(),
            p5 = fakeHoprAddress();

        const otherPlayers = [p2, p3, p4, p5];

        const m1 = new Multiplayer(otherPlayers);

        sinon.stub(m1, 'establishChannel').rejects("CHANNEL_ALREADY_OPEN");
        sinon.stub(m1, 'sendHoprMessage').resolves(true);

        return expect(m1.createGame()).to.be.fulfilled;
    });

    it('ConnectGame: if establishChannel() throws because channel is open, continue', function() {
        const creator = fakeHoprAddress();
        const multiplayer = new Multiplayer(null, creator);

        const spy = sinon.stub(multiplayer, 'establishChannel').rejects("CHANNEL_ALREADY_OPEN");

        return expect(multiplayer.connectGame(creator)).to.be.fulfilled
            .then(() => {
                sinon.assert.calledWith(spy, creator);
            });
    });

    it('ConnectGame: Call establish channel to game creator', function() {
        const gameCreator = fakeHoprAddress();
        const multiplayer = new Multiplayer([], gameCreator);

        const spy = sinon.stub(multiplayer, 'establishChannel').resolves(true);

        return multiplayer.connectGame(gameCreator)
            .then(() => {
                sinon.assert.calledWith(spy, gameCreator);
            });
    });

    it("SaveRound: update player gameScore everytime it's called", async function() {
        const player1 = fakeHoprAddress();
        const player2 = fakeHoprAddress();

        const multiplayer = new Multiplayer([player2]);

        const r1 = {num:1, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData', peerId: player2};
        const r2 = {num:2, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData', peerId: player2};
        const r3 = {num:2, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 9, type: 'roundData', peerId: player2};
        const r4 = {num:2, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 17, type: 'roundData', peerId: player2};

        multiplayer.saveRound(r1)
        expect(multiplayer.getScore(player2)).to.equal(7);
        multiplayer.saveRound(r2)
        expect(multiplayer.getScore(player2)).to.equal(7);
        multiplayer.saveRound(r3)
        expect(multiplayer.getScore(player2)).to.equal(9);
        multiplayer.saveRound(r4)
        expect(multiplayer.getScore(player2)).to.equal(17);
    });

    it('CanChooseWinner should be false if any player does not have gameOver=true',function() {
        const gameCreator = fakeHoprAddress(),
            otherPlayers = faker.datatype.array().map(() => fakeHoprAddress());

        const m1 = new Multiplayer(otherPlayers);
        const m2 = new Multiplayer([], gameCreator);
        const m3 = new Multiplayer(null, gameCreator);

        [{mm:m1, a:gameCreator}, {mm:m2,a:otherPlayers[0]}, {mm:m3, a:otherPlayers[1]}].forEach(({mm, a}) => {
            sinon.stub(mm, 'sendHoprMessage').resolves(true);
            sinon.stub(mm, 'establishChannel').resolves(true);
            sinon.stub(mm, 'getAddress').resolves(a);
        });

        const randRoundData = {score: faker.random.numeric()}

        return [m1, m2,m3].forEach(mm => {
            const playerData = mm.playerData[mm];
            mm.playerData = {
                [gameCreator]: {score: 7, gameOver: true},
            }

            otherPlayers.forEach(peerId => {
                mm.playerData[peerId] = {score: faker.random.numeric(), gameOver: true};
            });

            mm.playerData[otherPlayers[5]] = {score: faker.random.numeric()};

            expect(mm.canChooseWinner).to.be.false;
        });
    });

    it('CanChooseWinner should be true if all players have gameOver=true',function() {
        const gameCreator = fakeHoprAddress(),
            otherPlayers = faker.datatype.array().map(() => fakeHoprAddress());

        const m1 = new Multiplayer(otherPlayers);
        const m2 = new Multiplayer([], gameCreator);
        const m3 = new Multiplayer(null, gameCreator);

        [{mm:m1, a:gameCreator}, {mm:m2,a:otherPlayers[0]}, {mm:m3, a:otherPlayers[1]}].forEach(({mm, a}) => {
            sinon.stub(mm, 'sendHoprMessage').resolves(true);
            sinon.stub(mm, 'establishChannel').resolves(true);
            sinon.stub(mm, 'getAddress').resolves(a);
        });

        const randRoundData = {score: faker.random.numeric()}

        return [m1, m2,m3].forEach(mm => {
            const playerData = mm.playerData[mm];
            mm.playerData = {
                [gameCreator]: {score: 7, gameOver: true},
            }

            otherPlayers.forEach(peerId => {
                mm.playerData[peerId] = {score: faker.random.numeric(), gameOver: true};
            });

            expect(mm.canChooseWinner).to.be.true;
        });
    });

    it('chooseWinner if all players have sent gameOver, call chooseWinner', async function() {
        const ownAddress = fakeHoprAddress();
        const gameCreator = ownAddress;

        const p2 = fakeHoprAddress(),
            p3 = fakeHoprAddress(),
            p4 = fakeHoprAddress();

        const multiplayer = new Multiplayer([p2, p3, p4]);

        sinon.stub(multiplayer, 'getAddress').resolves(ownAddress);
        sinon.stub(multiplayer, 'broadcastMessage').resolves(true);
        const spy = sinon.stub(multiplayer, 'chooseWinner');

        const randRoundData = {num:1, guess:"______",word:"fogles",roundScore:0, app:'hangman', gameScore: 7, type: 'roundData'};

        await multiplayer.sendGameOver({gameScore: 3, peerId: ownAddress});
        sinon.assert.notCalled(spy);
        await multiplayer.receiveGameOver({gameScore: 7, peerId: p2})
        sinon.assert.notCalled(spy);
        await multiplayer.receiveGameOver({gameScore: 7, peerId: p3})
        sinon.assert.notCalled(spy);

        await multiplayer.receiveGameOver({gameScore: 7, peerId: p4})
        sinon.assert.calledOnce(spy);
    });

    it('ChooseWinner: set winner as player with highest score', function() {
        this.timeout(6000);

        const p1 = fakeHoprAddress(),
            p2 = fakeHoprAddress(),
            p3 = fakeHoprAddress(),
            p4 = fakeHoprAddress();

        const gameCreator = p1;

        const m1 = new Multiplayer([p2, p3, p4]);
        const m2 = new Multiplayer([], gameCreator);
        const m3 = new Multiplayer(null, gameCreator);

        [{mm:m1, a:p1}, {mm:m2,a:p2}, {mm:m3, a:p3}].forEach(({mm, a}) => {
            sinon.stub(mm, 'sendHoprMessage').resolves(true);
            sinon.stub(mm, 'establishChannel').resolves(true);
            sinon.stub(mm, 'getAddress').resolves(a);
        });

        const randRoundData = {gameScore: 3}

        return m1.start()
            .then(() => m2.start())
            .then(() => m3.start())
            .then(() => {
                [m1, m2,m3].forEach(mm => {
                    const playerData = mm.playerData[mm];
                    mm.playerData = {
                        [gameCreator]: {score: 7, gameOver: true},
                        [p2]: {score: 12, gameOver:true},
                        [p3]: {score: 14, gameOver: true},
                        [p4]: {score: 4, gameOver: true},
                    };

                    expect(mm.chooseWinner()).to.equal(p3);
                });
            });
    });

    it('Winner should return "You" if player address is same as winner address', function() {
        const ownAddr = fakeHoprAddress();
        const mm = new Multiplayer([fakeHoprAddress()]);

        mm.address = ownAddr;

        sinon.stub(mm, 'canChooseWinner').get(sinon.fake.returns(true));
        sinon.stub(mm, 'chooseWinner').returns(ownAddr);

        expect(mm.winner).to.equal("You");
    });

    it('ReceiveRoundScores: If player is game creator, send round scores to all other players', function() {
        const p1 = fakeHoprAddress(),
            p2 = fakeHoprAddress(),
            p3 = fakeHoprAddress(),
            p4 = fakeHoprAddress(),
            p5 = fakeHoprAddress();

        const otherPlayers = [
            p2, p3, p4, p5
        ]

        const roundData = {score:13, peerId: p3}

        const multiplayer = new Multiplayer(otherPlayers);

        multiplayer.playerData = {
            [p1]: {},
            [p2]: {}, [p3]: {}, [p4]: {}, [p5]: {},
        }

        sinon.stub(multiplayer, 'establishChannel').rejects("CHANNEL_ALREADY_OPEN");
        const spy = sinon.stub(multiplayer, 'sendRoundScores').resolves(true);

        return multiplayer.receiveRoundScores(roundData)
            .then(() => {
                sinon.assert.calledWith(spy, roundData, p2);
                sinon.assert.calledWith(spy, roundData, p3);
                sinon.assert.calledWith(spy, roundData, p4);
                sinon.assert.calledWith(spy, roundData, p5);
            });
    });

    it('ReceiveRoundScores: If player is not game creator, do not send round scores', function() {
        const p1 = fakeHoprAddress(),
            p2 = fakeHoprAddress(),
            p3 = fakeHoprAddress();

        const roundData = {score: 3, peerId: p3}

        const m2 = new Multiplayer([], p1);
        const m3 = new Multiplayer(null, p1);

        m2.address = p2;
        m3.address = p3;

        const spies = [];

        [m2, m3].forEach(mm => {
            mm.playerData = {
                [p1]: {},
                [p2]: {}, [p3]: {},
            }

            sinon.stub(mm, 'establishChannel').rejects("CHANNEL_ALREADY_OPEN");
            spies.push(sinon.stub(mm, 'sendRoundScores').resolves(true));
        })

        return m2.receiveRoundScores(roundData)
            .then(() => m3.receiveRoundScores(roundData))
            .then(() => {
                spies.forEach(spy => sinon.assert.notCalled(spy));
            });
    });

    it('SendGameOver: Should set gameover to true for player', function() {
        this.timeout(5000);
        const p1 = fakeHoprAddress(),
            p2 = fakeHoprAddress(),
            p3 = fakeHoprAddress();

        const otherPlayers = [p2, p3]

        const roundData = {score: 3}

        const m1 = new Multiplayer(otherPlayers);
        const m2 = new Multiplayer(null, p1);

        sinon.stub(m1, 'establishChannel').resolves(true);
        sinon.stub(m1, 'sendHoprMessage').resolves(true);
        sinon.stub(m1, 'getAddress').resolves(p1);

        sinon.stub(m2, 'establishChannel').resolves(true);
        sinon.stub(m2, 'sendHoprMessage').resolves(true);
        sinon.stub(m2, 'getAddress').resolves(p2);

        return m1.start()
            .then(() => m1.sendGameOver(roundData))
            .then(() => {
                expect(m1.playerData[p1], 'Game creator').to.have.property('gameOver', true);
            })

            .then(() => m2.start())
            .then(() => m2.sendGameOver(roundData))
            .then(() => {
                expect(m2.playerData[p2], 'Player 2').to.have.property('gameOver', true);
            });
    });

    it('ReceiveGameOver: Should set gameover to true for player', function() {
        this.timeout(5000);
        const p1 = fakeHoprAddress(),
            p2 = fakeHoprAddress(),
            p3 = fakeHoprAddress();

        const otherPlayers = [p2, p3]

        const roundData = {
            score: 3,
            peerId: p3,
            type: 'gameOver'
        }

        const m1 = new Multiplayer(otherPlayers);
        const m2 = new Multiplayer(null, p1);

        sinon.stub(m1, 'establishChannel').resolves(true);
        sinon.stub(m1, 'sendHoprMessage').resolves(true);
        sinon.stub(m1, 'getAddress').resolves(p1);

        sinon.stub(m2, 'establishChannel').resolves(true);
        sinon.stub(m2, 'sendHoprMessage').resolves(true);
        sinon.stub(m2, 'getAddress').resolves(p2);

        return m1.start()
            .then(() => m1.receiveGameOver(roundData))
            .then(() => expect(m1.playerData[p3], 'Game creator').to.have.property('gameOver', true))

            .then(() => m2.start())
            .then(() => m2.receiveGameOver(roundData))
            .then(() => expect(m2.playerData[p3], 'Player 2').to.have.property('gameOver', true));
    });
});
