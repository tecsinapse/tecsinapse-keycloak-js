const TecSinapseKeycloak = {

  login(username, password, options) {
    const logged = this.isLogged();
    if (logged && !options.transient) {
      // TODO so pedir refresh quando estiver proximo de expirar o token
      return KeycloakService.refreshToken(options, this.getRefreshToken()).then((result) => {
        if (result.error) {
          this.logout(options);
          return Promise.reject(new Error(`Error updating token, ${result.error}, ${result.error_description}`));
        }
        CookieService.setCookie(result);
        return Promise.resolve(result.access_token);
      })
    }
    return KeycloakService.getTokenByUsernameAndPassword(options, {username, password}).then(json => {
      if (json.error) {
        return Promise.reject(new Error(`Error getting access token by user and password, ${json.error}, ${json.error_description}`));
      }

      if (!options.transient) {
        CookieService.setCookie(json);
      }
      return Promise.resolve(json.access_token);
    });
  },

  isLogged() {
    return CookieService.hasCookie();
  },

  logout(options, callback) {
    this.login(options.adminUsername, options.adminPassword, {...options, transient: true})
        .then(accessToken => KeycloakService.logout(options, accessToken, CookieService.getCookie().session_state))
        .then(res => {
          CookieService.removeCookie();
          if (callback) {
            callback();
          }
          if (!res.ok) {
            console.warn(`Error logging out: Session is not found at server, but session is closed on client`)
          }
        })
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
  },

  getRoles(options, userId) {
    return this.login(options.adminUsername, options.adminPassword, {...options, transient: true})
        .then(accessTokenAdmin => KeycloakService.getRoles(options, userId, accessTokenAdmin))
        .then(roles => {
          let clientMapping = roles.clientMappings[options.clientId];

          if (clientMapping) {
            return clientMapping.mappings.map(m => m.name);
          }
          return undefined;
        })
  },

  hasRole(options, userId, role) {
    return this.getRoles(options, userId)
        .then(roles => roles ? roles.includes(role) : false);
  }
};

export default TecSinapseKeycloak;