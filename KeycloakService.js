const KeycloakService = {

  tokenDataForm(keycloakOptions, {user, refreshToken}, refresh = false) {

    const auth = refresh ? {
      refresh_token: refreshToken,
    } : {
      username: user.username,
      password: user.password,
    };
    const dataForm = {
      ...auth,
      grant_type: refresh ? 'refresh_token' : 'password',
      client_id: keycloakOptions.clientId,
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
  },

  getToken(keycloakOptions, userOrRefreshToken, refresh = false) {
    return fetch(this.createUrlToken(keycloakOptions), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: this.tokenDataForm(keycloakOptions, userOrRefreshToken, refresh)
    })
      .then(res => res.json());
  },

  getTokenByUsernameAndPassword(keycloakOptions, user) {
    return this.getToken(keycloakOptions, {user});
  },

  refreshToken(keycloakOptions, refreshToken) {
    return this.getToken(keycloakOptions, {refreshToken}, true);
  },

  createUrlToken(keycloak) {
    return `${keycloak.urlServer}/realms/${keycloak.realm}/protocol/openid-connect/token`;
  },

  createUrlLogout(keycloak, sessionId) {
    return `${keycloak.urlServer}/admin/realms/${keycloak.realm}/sessions/${sessionId}`;
  },

  createUrlRole(keycloak, userId) {
    return `${keycloak.urlServer}/admin/realms/${keycloak.realm}/users/${userId}/role-mappings`;
  },

  createUrlGetUsers(keycloak, params) {
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
  },

  createHeaderGetRequest(accessToken) {
    return {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    };
  },

  getUsers(queryParam, options, access_token) {
    return fetch(this.createUrlGetUsers(options, queryParam), this.createHeaderGetRequest(access_token))
      .then(res => res.json());
  },

  logout(keycloakOptions, accessToken, sessionId) {
    return fetch(this.createUrlLogout(keycloakOptions, sessionId), {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + accessToken

      }
    });
  },

  getRoles(keycloakOptions, userId, accessToken) {
    return fetch(this.createUrlRole(keycloakOptions, userId), this.createHeaderGetRequest(accessToken))
        .then(res => res.json())
        .catch(function (err) {
          console.error(err);
          return undefined
        });
  }
};