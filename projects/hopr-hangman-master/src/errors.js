export class NetworkError extends Error {
    name = 'NetworkError';

    constructor(status_, statusCode) {
        super(status_);

        if(statusCode)
            this.statusCode = statusCode;
    }
}
