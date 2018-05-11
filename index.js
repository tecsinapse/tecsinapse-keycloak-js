const removeToken = (callback) => {
  TokenService.removeToken();
  if (callback) {
    callback();
  }
};

const TecSinapseKeycloak = {

  login(username, password, options) {
    return this.isLogged().then(logged => {

      if (logged && !options.transient) {
        return Promise.reject('You are already logged in');
      }
      
      const daysToExpireToken = options.daysToExpireToken | 1;

      return KeycloakService.getTokenByUsernameAndPassword(options, {username, password}).then(json => {
        if (json.error) {
          return Promise.reject(new Error(`Error getting access token by user and password, ${json.error}, ${json.error_description}`));
        }
  
        if (!options.transient) {
          TokenService.setToken(json, daysToExpireToken);
        }
        return Promise.resolve(json.access_token);
      });
    })
  },

  isLogged() {
    return TokenService.hasToken();
  },

  logout(options, callback) {
    this.login(options.adminUsername, options.adminPassword, {...options, transient: true})
        .then(accessToken => TokenService.getToken().then(token => {
          return KeycloakService.logout(options, accessToken, token.session_state)
        }))
        .then(res => {
          removeToken(callback);
        })
        .catch(err => {
          console.warn(`Error logging out: Session is not found at server, but session is closed on client`);
          removeToken(callback);
        });
  },

  getToken() {
    return this.isLogged()
    .then(logged => {
      if (logged) {
        return TokenService.getToken();
      }
      return Promise.reject('You are not logged in');
    });
  },

  getAccessToken() {
    return this.getToken().then(token => token.access_token);
  },

  getRefreshToken() {
    return this.getToken().then(token => token.refresh_token);
  },

  getUser(userEmail, options) {
    return this.login(options.adminUsername, options.adminPassword, {...options, transient: true})
      .then(access_token => KeycloakService.getUsers({email: userEmail}, options, access_token))
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
        });
  },

  hasRole(options, userId, role) {
    return this.getRoles(options, userId)
        .then(roles => roles ? roles.includes(role) : false);
  },

  createToken(username, password, options) {
    return KeycloakService.getTokenByUsernameAndPassword(options, {username, password});
  }
};

export default TecSinapseKeycloak;