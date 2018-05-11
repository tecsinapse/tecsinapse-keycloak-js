var moment = require('moment');

const TOKEN_VALUE = 'token_value';
const EXPIRES_IN = 'expires-in';
const REFRESH_EXPIRES_IN = 'refresh-expires-in';

const TokenService = {
    setToken(json, daysToExpire = 1) {
        const now = moment();
        IdbKeycloak.set(TOKEN_VALUE, json);
        IdbKeycloak.set(EXPIRES_IN, moment(now).add(json.expires_in, 'seconds').toDate());
        IdbKeycloak.set(REFRESH_EXPIRES_IN, moment(now).add(json.refresh_expires_in, 'seconds').toDate());
    },

    getToken() {
        return IdbKeycloak.get(TOKEN_VALUE);
    },

    removeToken() {
        return IdbKeycloak.clear();
    },

    hasToken() {
        return new Promise(async (resolve) => {
            await IdbKeycloak.get(TOKEN_VALUE).then(token_value => resolve(!!token_value));
        });
    },

    getExpiresIn() {
        return IdbKeycloak.get(EXPIRES_IN);
    },

    getRefreshExpiresIn() {
        return IdbKeycloak.get(REFRESH_EXPIRES_IN);
    },

    tokenHasExpired(now) {
        return this.hasToken()
        .then(hasToken => {
            if (hasToken) {
                return this.getExpiresIn();
            }
            return Promise.reject("Token not found");
        })
        .then(expiresIn => {
            let expiresInAsMoment = moment(expiresIn);
            return Promise.resolve(now.isAfter(expiresInAsMoment));
        });
    },

    refreshTokenHasExpired(now) {
        return this.hasToken()
        .then(hasToken => {
            if (hasToken) {
                return this.getRefreshExpiresIn();
            }
            return Promise.reject("Token not found");
        })
        .then(refreshExpiresIn => {
            let refreshExpiresInAsMoment = moment(refreshExpiresIn);
            return Promise.resolve(now.isAfter(refreshExpiresInAsMoment));
        });
    }
};