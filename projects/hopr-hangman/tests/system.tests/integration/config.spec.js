import { expect } from 'chai';
import config from '../../../src/config/config.js';

describe('Config', function() {
    it('Set "apiEndpoint" should set search params', function() {
        config.restURL = "foobar200";

        config.save();

        const url = new URL(window.location.href);
        expect(url.searchParams.get('apiEndpoint')).to.equal("foobar200");
    });

    it('Set "authToken" should set search params', function() {
        config.authToken = "foobar500";

        config.save();

        const url = new URL(window.location.href);
        expect(url.searchParams.get('apiToken')).to.equal("foobar500");
    });

    it('Get apiEndpoint when value is set in url', function() {
        const rand = 'blajiodfw';

        window.history.pushState({}, '', '?apiEndpoint='+rand);
        expect(config.restURL).to.equal(rand);
    });

    it('Get apiToken when value is set in url', function() {
        const rand = 'blaniodfeifowief';

        window.history.pushState({}, '', '?apiToken='+rand);
        expect(config.authToken).to.equal(rand);
    });
});
