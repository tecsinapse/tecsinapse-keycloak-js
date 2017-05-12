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
}

const createUrlRole = (keycloak) => {
    return `${keycloak.urlServer}/admin/realms/${keycloak.realm}/users/${keycloak.userKeycloakId}/role-mappings`;
}

const createUrlGetUsers = (keycloak) => {
    return `${keycloak.urlServer}/admin/realms/${keycloak.realm}/users`;
}

const getUsers = (authParams, accessToken) => {
    const authorization = 'Bearer ' + accessToken;
    const obj = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorization
        }
    };
    return fetch(createUrlGetUsers(authParams), obj)
        .then(res => res.json())
        .then(users => {
            return users
        })
        .catch(function (err) {
            console.error(err);
            return undefined;
        })
};

const getToken = (authParams, user) => {
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

    return fetch(createUrlToken(authParams), obj)
        .then(res => res.json())
        .then(token => {
            return token;
        })
        .catch(function (err) {
            console.error(err);
            return new Error(err);
        })
};

const getRoles = (authParams) => {
//não foi utilizado new FormData() devido a incompatibilidade com o IE. Mais detalhes aqui: https://developer.mozilla.org/en-US/docs/Web/API/Body/formData
    const tokenDataForm = () => {
        let dataForm = {
            grant_type: 'password',
            client_id: 'admin-cli',
            username: AuthKeycloak.USERNAME,
            password: AuthKeycloak.PASSWORD
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
    }

    const fetchToken = () => {
        const obj = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: tokenDataForm()
        }

        return fetch(createUrlToken(authParams), obj)
            .then(res => res.json())
            .then(token => {
                return token
            })
            .catch(function (err) {
                console.error(err)
                return undefined
            })
    }

    const fetchRoles = (accessToken) => {
        const access_token = 'Bearer ' + accessToken;
        const obj = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': access_token
            }
        }

        return fetch(createUrlRole(authParams), obj)
            .then(res => res.json())
            .then(roles => {
                return roles
            })
            .catch(function (err) {
                console.error(err)
                return undefined
            })
    }


    return fetchToken()
        .then(token => {
            return fetchRoles(token.access_token)
                .then(roles => {
                    return roles
                })
        });
};

const COOKIE_TECSINAPSE_KEYCLOAK_TOKEN = 'tecsinapse-keycloak-token';

const TecSinapseKeycloak = {

    login(username, password, options) {
        let logged = this.isLogged();

        if (logged) {
            //TODO fazer refresh no token
        } else {
            logged = getToken(options, {username, password}).then(token => {
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
    }
};
export default TecSinapseKeycloak;