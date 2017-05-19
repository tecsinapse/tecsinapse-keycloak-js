/**
 authParams: {
  realm: 'realm name',
  urlServer: 'url to keycloak server',
  userKeycloakId: ,
 }
 */
import * as Cookies from "js-cookie";

const createUrlToken = (keycloak) => {
    return `${keycloak.urlServer}/realms/${keycloak.realm}/protocol/openid-connect/token`;
};

const createUrlRole = (keycloak) => {
    return `${keycloak.urlServer}/admin/realms/${keycloak.realm}/users/${keycloak.userKeycloakId}/role-mappings`;
};

const createUrlGetUsers = (keycloak, params) => {
    let queryParams = '';
    if (params) {
        queryParams = queryParams.concat("?");
        for (let property in params) {
            if (params.hasOwnProperty(property)) {
                queryParams = queryParams.concat(property).concat("=").concat(params[property]);
            }
        }
    }
    return `${keycloak.urlServer}/admin/realms/${keycloak.realm}/users` + queryParams;
};

const createHeaderGetRequest = (accessToken) => {
    return {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
    };
};

const getToken = (keycloak, user) => {
    const tokenDataForm = () => {
        let dataForm = {
            grant_type: 'password',
            client_id: 'admin-cli',
            username: user.username,
            password: user.password
        };

        let formBody = [];
        for (const property in dataForm) {
            if (dataForm.hasOwnProperty(property)) {
                const encodedKey = encodeURIComponent(property);
                const encodedValue = encodeURIComponent(dataForm[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
        }
        formBody = formBody.join("&");
        return formBody;
    };

    const obj = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: tokenDataForm()
    };

    return fetch(createUrlToken(keycloak), obj)
        .then(res => res.json())
        .then(token => {
            return token;
        })
        .catch(function (err) {
            console.error(err);
            return new Error(err);
        })
};

const accessToken = () => Cookies.get(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN);

const getRoles = (keycloak, user) => {
//não foi utilizado new FormData() devido a incompatibilidade com o IE. Mais detalhes aqui: https://developer.mozilla.org/en-US/docs/Web/API/Body/formData
    const fetchRoles = (accessToken) => {
        return fetch(createUrlRole(keycloak), createHeaderGetRequest(accessToken))
            .then(res => res.json())
            .then(roles => {
                return roles
            })
            .catch(function (err) {
                console.error(err);
                return undefined
            })
    };
    return getToken(keycloak, user)
        .then(token => {
            if (token.access_token) {
                return fetchRoles(token.access_token).then(roles => roles);
            }
            throw new Error(token.error_description);
        }).catch(err => {
            console.error(err);
            return undefined;
        });
};

const COOKIE_TECSINAPSE_KEYCLOAK_TOKEN = 'tecsinapse-keycloak-token';

const TecSinapseKeycloak = {

    login(username, password, keycloak) {
        let logged = this.isLogged();

        if (logged) {
            //TODO fazer refresh no token
        } else {
            logged = getToken(keycloak, {username, password}).then(token => {
                if (token.access_token) {
                    Cookies.set(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN, token.access_token, {expires: 1});
                    return true;
                }
                throw new Error(token.error_description);
            }).catch(err => {
                console.error(err);
                return false;
            });
        }
        return logged;
    },

    isLogged() {
        return !!Cookies.get(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN)
    },

    logout() {
        Cookies.remove(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN)
    },

    getAccessToken() {
        return accessToken();
    },

    getUsers(keycloak, params) {
        return fetch(createUrlGetUsers(keycloak, params), createHeaderGetRequest(accessToken()))
            .then(res => res.json())
            .then(users => {
                return users
            })
            .catch(function (err) {
                console.error(err);
                return undefined;
            })
    }
};
export default TecSinapseKeycloak;