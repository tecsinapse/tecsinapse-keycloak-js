'use strict';

var _jsCookie = require('js-cookie');

var Cookies = _interopRequireWildcard(_jsCookie);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var COOKIE_TECSINAPSE_KEYCLOAK_TOKEN = 'tecsinapse-keycloak-token';

var CookieService = {
    setCookie: function setCookie(json) {
        Cookies.set(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN, json, { expires: 1 });
    },
    getCookie: function getCookie() {
        return JSON.parse(Cookies.get(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN));
    },
    removeCookie: function removeCookie() {
        Cookies.remove(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN);
    },
    hasCookie: function hasCookie() {
        return !!Cookies.get(COOKIE_TECSINAPSE_KEYCLOAK_TOKEN);
    }
};
'use strict';

var KeycloakService = {
  tokenDataForm: function tokenDataForm(_ref) {
    var user = _ref.user,
        refreshToken = _ref.refreshToken;
    var refresh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


    var auth = refresh ? {
      refresh_token: refreshToken
    } : {
      username: user.username,
      password: user.password
    };
    var dataForm = Object.assign({}, auth, {
      grant_type: refresh ? 'refresh_token' : 'password',
      client_id: 'admin-cli'
    });

    var formBody = [];
    for (var property in dataForm) {
      if (dataForm.hasOwnProperty(property)) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(dataForm[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
    }
    formBody = formBody.join("&");
    return formBody;
  },
  getToken: function getToken(keycloakOptions, userOrRefreshToken) {
    var refresh = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    return fetch(this.createUrlToken(keycloakOptions), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: this.tokenDataForm(userOrRefreshToken, refresh)
    }).then(function (res) {
      return res.json();
    });
  },
  getTokenByUsernameAndPassword: function getTokenByUsernameAndPassword(keycloakOptions, user) {
    return this.getToken(keycloakOptions, { user: user });
  },
  refreshToken: function refreshToken(keycloakOptions, _refreshToken) {
    return this.getToken(keycloakOptions, { refreshToken: _refreshToken }, true);
  },
  createUrlToken: function createUrlToken(keycloak) {
    return keycloak.urlServer + '/realms/' + keycloak.realm + '/protocol/openid-connect/token';
  },
  createUrlRole: function createUrlRole(keycloak) {
    return keycloak.urlServer + '/admin/realms/' + keycloak.realm + '/users/' + keycloak.userKeycloakId + '/role-mappings';
  },
  createUrlGetUsers: function createUrlGetUsers(keycloak, params) {
    var queryParams = '';
    if (params) {
      queryParams = queryParams.concat("?");
      for (var property in params) {
        if (params.hasOwnProperty(property)) {
          queryParams = queryParams.concat(property).concat("=").concat(params[property]);
        }
      }
    }
    return keycloak.urlServer + '/admin/realms/' + keycloak.realm + '/users' + queryParams;
  },
  createHeaderGetRequest: function createHeaderGetRequest(accessToken) {
    return {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    };
  },
  getUsers: function getUsers(queryParam, options, access_token) {
    return fetch(this.createUrlGetUsers(options, queryParam), this.createHeaderGetRequest(access_token)).then(function (res) {
      return res.json();
    });
  },
  getRoles: function getRoles(keycloak, user) {
    var _this = this;

    //não foi utilizado new FormData() devido a incompatibilidade com o IE. Mais detalhes aqui: https://developer.mozilla.org/en-US/docs/Web/API/Body/formData
    var fetchRoles = function fetchRoles(accessToken) {
      return fetch(_this.createUrlRole(keycloak), _this.createHeaderGetRequest(accessToken)).then(function (res) {
        return res.json();
      }).then(function (roles) {
        return roles;
      }).catch(function (err) {
        console.error(err);
        return undefined;
      });
    };
    return this.getToken(keycloak, user).then(function (token) {
      if (token.access_token) {
        return fetchRoles(token.access_token).then(function (roles) {
          return roles;
        });
      }
      throw new Error(token.error_description);
    }).catch(function (err) {
      console.error(err);
      return undefined;
    });
  }
};
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var TecSinapseKeycloak = {
  login: function login(username, password, options) {
    var _this = this;

    var logged = this.isLogged();
    if (logged && !options.transient) {
      // TODO so pedir refresh quando estiver proximo de expirar o token
      return KeycloakService.refreshToken(options, this.getRefreshToken()).then(function (result) {
        if (result.error) {
          _this.logout();
          Promise.reject(new Error("Erro ao atualizar token, " + result.error + ", " + result.error_description));
        }
        CookieService.setCookie(result);
        return Promise.resolve(result.access_token);
      });
    }
    return KeycloakService.getTokenByUsernameAndPassword(options, { username: username, password: password }).then(function (json) {
      if (json.error) {
        Promise.reject(new Error("Erro ao obter token de acesso por usuario e senha, " + json.error + ", " + json.error_description));
      }

      if (!options.transient) {
        CookieService.setCookie(json);
      }
      return Promise.resolve(json.access_token);
    });
  },
  isLogged: function isLogged() {
    CookieService.hasCookie();
  },
  logout: function logout(callback) {
    CookieService.removeCookie();
    console.log(callback);
    if (callback) {
      callback();
    }
  },
  getAccessToken: function getAccessToken() {
    return CookieService.getCookie().access_token;
  },
  getRefreshToken: function getRefreshToken() {
    return CookieService.getCookie().refresh_token;
  },
  getUser: function getUser(userEmail, options) {
    return this.login(options.adminUsername, options.adminPassword, Object.assign({}, options, { transient: true })).then(function (access_token) {
      return KeycloakService.getUsers({ email: userEmail }, options, access_token);
    }).then(function (users) {
      if (users && users.length > 0) {
        return users[0];
      }
      return null;
    });
  }
};

exports.default = TecSinapseKeycloak;
