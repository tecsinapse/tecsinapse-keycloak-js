import * as Cookies from 'js-cookie';

const COOKIE_TECSINAPSE_KEYCLOAK_TOKEN = 'tecsinapse-keycloak-token';

const TecSinapseKeycloak = {

  login(username, password, options) {
    const logged = this.isLogged();
    if (logged && !options.transient) {
      // TODO so pedir refresh quando estiver proximo de expirar o token
      return KeycloakService.refreshToken(options, this.getRefreshToken()).then((result) => {
        if (result.error) {
          this.logout();
          Promise.reject(new Error(`Erro ao atualizar token, ${result.error}, ${result.error_description}`));
        }
        this.setCookie(result);
        return Promise.resolve(result.access_token);
      })
    }
    return KeycloakService.getTokenByUsernameAndPassword(options, {username, password}).then(json => {
      if (json.error) {
        Promise.reject(new Error(`Erro ao obter token de acesso por usuario e senha, ${json.error}, ${json.error_description}`));
      }

      if (!options.transient) {
        this.setCookie(json);
      }
      return Promise.resolve(json.access_token);
    });
  },

  isLogged() {
    return !!Cookies.get(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN)
  },

  logout() {
    Cookies.remove(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN)
  },

  setCookie(json) {
    Cookies.set(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN, json, {expires: 1});
  },

  getCookie() {
    return JSON.parse(Cookies.get(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN));
  },

  getAccessToken() {
    return this.getCookie().access_token;
  },

  getRefreshToken() {
    return this.getCookie().refresh_token;
  },

  getUser(userEmail, options) {
    return this.login(options.adminUsername, options.adminPassword, {...options, transient: true})
      .then(access_token => {
        return KeycloakService.getUsers({email: userEmail}, options, access_token)
      })
      .then(users => {
        if (users && users.length > 0) {
          return users[0];
        }
        return null;
      });
  }
};

export default TecSinapseKeycloak;