import sinon from 'sinon';

export function mockFetch() {
    sinon.stub(window, 'fetch').resolves({json: () => Promise.resolve({})});
}
