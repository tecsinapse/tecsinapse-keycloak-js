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
        CookieService.setCookie(result);
        return Promise.resolve(result.access_token);
      })
    }
    return KeycloakService.getTokenByUsernameAndPassword(options, {username, password}).then(json => {
      if (json.error) {
        Promise.reject(new Error(`Erro ao obter token de acesso por usuario e senha, ${json.error}, ${json.error_description}`));
      }

      if (!options.transient) {
        CookieService.setCookie(json);
      }
      return Promise.resolve(json.access_token);
    });
  },

  isLogged() {
    CookieService.hasCookie();
  },

  logout(callback) {
    CookieService.removeCookie();
    if (callback) {
      callback();
    }
  },

  getAccessToken() {
    return CookieService.getCookie().access_token;
  },

  getRefreshToken() {
    return CookieService.getCookie().refresh_token;
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