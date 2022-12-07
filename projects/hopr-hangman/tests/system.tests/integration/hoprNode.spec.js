import { getAddress, sendHoprMessage, getChannels, establishChannel } from '../../../src/connectivity/hoprNode.js';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
chai.use(chaiAsPromised);

const { expect } = chai;
import config from '../../../src/config/config.js';

describe('Hopr node: REST', function() {
    beforeEach((done) => {
        setTimeout(() => done(), 200);
    });

    it('Get address', function() {
        config.restURL = process.env.REACT_APP_TEST_NODE_HTTP_URL1;
        config.authToken = process.env.REACT_APP_TEST_SECURITY_TOKEN;

        return getAddress()
            .then(res => {
                expect(res).to.match(/^16Uiu2HAm/);
            });
    });

    it('Get all channels from node', function() {
        config.restURL = process.env.REACT_APP_TEST_NODE_HTTP_URL1;
        config.authToken = process.env.REACT_APP_TEST_SECURITY_TOKEN;

        return getChannels()
        .then(res => {
            expect(res).to.have.property('incoming').that.is.an('array');
            expect(res).to.have.property('outgoing').that.is.an('array');
        });
    });

    it('EstablishChannel: If channel already established, throw with "CHANNEL_ALREADY_OPEN"', function() {
        config.restURL = process.env.REACT_APP_TEST_NODE_HTTP_URL1;
        config.authToken = process.env.REACT_APP_TEST_SECURITY_TOKEN;

        const addr = '16Uiu2HAmGZ8zeV2kcMTPx55NRXiJSmpX4kcuiTE21YifiSzrwGL3';
        return establishChannel(addr)
            .catch(e => expect(establishChannel(addr)).to.be.rejectedWith("CHANNEL_ALREADY_OPEN"))
    });

    it('Send message', function() {
        config.restURL = process.env.REACT_APP_TEST_NODE_HTTP_URL1;
        config.authToken = process.env.REACT_APP_TEST_SECURITY_TOKEN;

        const addr = '16Uiu2HAmGZ8zeV2kcMTPx55NRXiJSmpX4kcuiTE21YifiSzrwGL3';
        return establishChannel(addr)
            .catch(e => sendHoprMessage(addr, 'hello there'))
        /*
            .then(res => {
                console.log('sent message\n', res);
            });
        */
    });
});
