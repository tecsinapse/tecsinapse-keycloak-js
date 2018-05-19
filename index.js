const removeToken = (callback) => {
  TokenService.removeToken();
  if (callback) {
    callback();
  }
};

let keycloakConfig;

const TecSinapseKeycloak = {

  config(options) {
    keycloakConfig = options;
  },

  login(username, password, transient = false) {
    return this.isLogged().then(logged => {

      if (logged && !transient) {
        return Promise.reject('You are already logged in');
      }

      return this.createToken(username, password)
      .then(json => {
        if (!transient) {
          TokenService.setToken(json);
        }
        return Promise.resolve(json.access_token);
      });
    });
  },

  isLogged() {
    return TokenService.hasToken();
  },

  logout(sessionState, callback) {
    return this.createToken(keycloakConfig.adminUsername, keycloakConfig.adminPassword)
        .then(adminToken => KeycloakService.logout(keycloakConfig, adminToken.access_token, sessionState))
        .then(res => removeToken());
  },

  logoutWithoutRemoveToken(sessionState, callback) {
    return this.createToken(keycloakConfig.adminUsername, keycloakConfig.adminPassword)
        .then(adminToken => KeycloakService.logout(keycloakConfig, adminToken.access_token, sessionState));
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

  getUser(userEmail) {
    return this.createToken(keycloakConfig.adminUsername, keycloakConfig.adminPassword)
      .then(adminToken => KeycloakService.getUsers({email: userEmail}, keycloakConfig, adminToken.access_token))
      .then(users => users && users.length > 0 ? users[0] : undefined);
  },

  getRoles(userId) {
    return this.createToken(keycloakConfig.adminUsername, keycloakConfig.adminPassword)
        .then(adminToken => KeycloakService.getRoles(keycloakConfig, userId, adminToken.access_token))
        .then(roles => {
          let clientMapping = roles.clientMappings[keycloakConfig.clientId];
          if (clientMapping) {
            return clientMapping.mappings.map(m => m.name);
          }
          return undefined;
        });
  },

  hasRole(userId, role) {
    return this.getRoles(userId)
        .then(roles => roles ? roles.includes(role) : false);
  },

  removeToken(callback) {
    removeToken(callback);
  },

  createToken(username, password) {
    return KeycloakService.getTokenByUsernameAndPassword(keycloakConfig, {username, password})
    .then(json => {
      if (json.error) {
        return Promise.reject(new Error(`Error getting access token by user and password, ${json.error}, ${json.error_description}`));
      }
      return Promise.resolve(json);
    });
  }
};

export default TecSinapseKeycloak;