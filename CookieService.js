import * as Cookies from 'js-cookie';
const COOKIE_TECSINAPSE_KEYCLOAK_TOKEN = 'tecsinapse-keycloak-token';

const CookieService = {
    setCookie(json, daysToExpire = 1) {
        Cookies.set(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN, json, {expires: daysToExpire});
    },

    getCookie() {
        return JSON.parse(Cookies.get(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN));
    },

    removeCookie() {
        Cookies.remove(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN);
    },

    hasCookie() {
        return !!Cookies.get(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN);
    }
};