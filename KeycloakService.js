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

  createUrlRole(keycloak) {
    return `${keycloak.urlServer}/admin/realms/${keycloak.realm}/users/${keycloak.userKeycloakId}/role-mappings`;
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

  getRoles(keycloak, user) {
//não foi utilizado new FormData() devido a incompatibilidade com o IE. Mais detalhes aqui: https://developer.mozilla.org/en-US/docs/Web/API/Body/formData
    const fetchRoles = (accessToken) => {
      return fetch(this.createUrlRole(keycloak), this.createHeaderGetRequest(accessToken))
        .then(res => res.json())
        .then(roles => {
          return roles
        })
        .catch(function (err) {
          console.error(err);
          return undefined
        })
    };
    return this.getToken(keycloak, user)
      .then(token => {
        if (token.access_token) {
          return fetchRoles(token.access_token).then(roles => roles);
        }
        throw new Error(token.error_description);
      }).catch(err => {
        console.error(err);
        return undefined;
      });
  }
}